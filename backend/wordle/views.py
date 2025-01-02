import re
import time
import requests
from sys import exit
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User, Leaderboard
from .serializer import UserSerializer, LeaderboardSerializer
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db.models import F


# User methods


@api_view(["GET"])
def get_users(request):  # for admin panel
    users = get_list_or_404(
        User
    )  # replaces User.objects.all(), but also throws 404 if failed to fetch
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def create_user(request):  # for admin panel
    new_user = request.data
    serializer = UserSerializer(data=new_user)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_user(request):  # called from leaderboard POST
    # Check if user already exists, if not - create one
    user_email = request.data.get("user_email")
    user_name = request.data.get("user_name")
    user, is_new_user = User.objects.get_or_create(email=user_email)
    if is_new_user:
        user.name = user_name
        user.save()  # store in DB
    return user


# ---


# Leaderboard methods


@api_view(["GET"])
def get_leaderboard(request):
    leaderboard = get_list_or_404(
        Leaderboard
    )  # replaces Leaderboard.objects.all(); if empty -> "detail": "No Leaderboard matches the given query."
    serializer = LeaderboardSerializer(leaderboard, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def create_leaderboard_record(request):
    # expected frontend object
    # {
    #   "user_name": "Test",
    #   "user_email": "test@example.com",
    #   "score": 1000
    # }
    user = get_user(request)

    # Get/create leaderboard record
    leaderboard_record, is_new_record = Leaderboard.objects.get_or_create(user=user)
    leaderboard_record.score = request.data.get("score", 0)
    if is_new_record:
        leaderboard_record.games_played = 1
    else:
        leaderboard_record.games_played = (
            F("games_played") + 1
        )  # F is a built-in function for manipulating the existing DB data
    leaderboard_record.save()  # store in DB

    # Refresh from DB to get updated games_played count
    leaderboard_record.refresh_from_db()

    serializer = LeaderboardSerializer(instance=leaderboard_record)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---

# Game logic


def fetch_random_word():
    word_length = 5
    try:
        random_word = requests.get(
            f"https://random-word-api.herokuapp.com/word?length={word_length}",
            timeout=5,
        )
        random_word.raise_for_status()  # throw an error on 4xx/5xx status code
        return random_word.json().pop().lower()
    except requests.exceptions.RequestException as error:
        print("Fetch failed: ", error)
        return Response(
            {"error": "Error getting word"}, status=status.HTTP_400_BAD_REQUEST
        )


def validate_input(input):
    if len(input) != 5:
        return {"ok": False, "error": "5-letter word only"}
    if not re.match(r"^[a-z]+$", input):
        return {"ok": False, "error": "Alphabetic letters only"}
    else:
        return {"ok": True}


def highlight_user_input(input, word):
    def mark_green(letter):
        return {"letter": letter, "color": "green"}

    def mark_yellow(letter):
        return {"letter": letter, "color": "yellow"}

    def mark_gray(letter):
        return {"letter": letter, "color": "gray"}

    result = [""] * len(word)
    word_array = list(word)
    tracking_letters = list(word_array)  # create copy for tracking

    for i in range(len(word_array)):
        if input[i] == word_array[i]:
            result[i] = mark_green(input[i])
            tracking_letters[i] = None  # use in mapping & remove from tracking
    for i in range(len(word_array)):
        if result[i] == "":  # go through the unmarked letters
            if input[i] in tracking_letters:
                result[i] = mark_yellow(input[i])
                marked_char_idx = tracking_letters.index(input[i])
                tracking_letters[marked_char_idx] = None  # remove from tracking
            else:
                result[i] = mark_gray(input[i])
    return result


@api_view(["GET"])
def new_game(request):
    random_word = fetch_random_word()
    # store session variables
    request.session["word"] = random_word
    request.session["attempts"] = 6
    request.session["words_list"] = []
    return Response({"message": "Game started.", "attempts": 6})


@api_view(["POST"])
def guess_word(request):
    # get session variables
    word = request.session.get("word")
    print("WORD:", word)  # TODO remove
    attempts = request.session.get("attempts", 0)
    words_list = request.session.get("words_list")
    user_input = request.data.get("guess")
    is_input_valid = validate_input(user_input)
    if not is_input_valid["ok"]:
        return Response(
            {"error": is_input_valid["error"]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if user_input != word:
        # incorrect guess
        if user_input not in words_list:
            # new word guess
            attempts = attempts - 1
            words_list.append(user_input)
            highlighted_input = highlight_user_input(user_input, word)

            if attempts <= 0:
                return Response(
                    {
                        "message": "Game over. Better luck next time!",
                        "victory": False,
                        "result": highlighted_input,  # add result for the final render in the UI
                        "attempts": 0,
                    }
                )

            # update session variables
            request.session["attempts"] = attempts
            request.session["words_list"] = words_list
            return Response({"result": highlighted_input, "attempts": attempts})
        else:
            return Response(
                {"error": "The word is already in the list!"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        # correct guess
        attempts = attempts - 1
        words_list.append(user_input)
        highlighted_input = highlight_user_input(user_input, word)

        # update session variables
        request.session["attempts"] = attempts
        request.session["words_list"] = words_list
        return Response(
            {
                "message": "Congratulations, you won!",
                "victory": True,
                "result": highlighted_input,
                "attempts": attempts,
            }
        )


# ---
