import re
import time
import json
import random
from pathlib import Path
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
    elif not is_new_user and user.name != user_name:
        user.name = user_name
        user.save()  # update username for the existing email
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
    new_score = request.data.get("score", 0)

    # Get/create leaderboard record
    leaderboard_record, is_new_record = Leaderboard.objects.get_or_create(user=user)
    if is_new_record:
        leaderboard_record.score = new_score
        leaderboard_record.wins = 1
    else:
        prev_score = leaderboard_record.score
        leaderboard_record.score = max(prev_score, new_score)  # keep the highest score
        leaderboard_record.wins = (
            F("wins") + 1
        )  # F is a built-in function for manipulating the existing DB data
    leaderboard_record.save()  # store in DB

    # Refresh from DB to get updated wins count
    leaderboard_record.refresh_from_db()

    serializer = LeaderboardSerializer(instance=leaderboard_record)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---

# Game logic


def get_random_word():
    try:
        words_file = f"{Path.cwd()}/data/words.json"
        with open(words_file, "r") as file:
            data = json.load(file)
            random_word = random.choice(data)
            return random_word
    except Exception as error:
        print("Error getting word: ", error)
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


def calculate_score(request):
    # time
    # attempts left

    # defaults
    MAX_SCORE = 999
    PENALTY_PER_ATTEMPT = 50

    # session data
    game_start_time = request.session.get("time", 0)
    attempts_left = request.session.get("attempts", 0)

    # validate session (values don't exist)
    if game_start_time is None or attempts_left is None:
        return 0

    # calculation
    curr_time = time.time()
    game_total_time = curr_time - game_start_time  # sec

    if game_total_time >= MAX_SCORE:
        return 0

    attempts_used = 6 - attempts_left

    final_score = MAX_SCORE - game_total_time - (attempts_used * PENALTY_PER_ATTEMPT)

    return max(final_score, 0)  # return 0, if final_score is negative


# SESSION TESTING


@api_view(["GET"])
def set_test_session(request):
    request.session["test_key"] = "test_value"
    return Response({"message": "Test key set."})


@api_view(["GET"])
def get_test_session(request):
    test_value = request.session.get("test_key", "No value found")
    return Response({"test_key": test_value})


@api_view(["GET"])
def new_game(request):
    print("New game. Current session: ", request.session.session_key)
    print(print(request.session.items()))
    random_word = get_random_word()
    print("RANDOM WORD: ", random_word)
    # store session variables
    request.session["word"] = random_word
    request.session["attempts"] = 6
    request.session["words_list"] = []
    request.session["time"] = time.time()
    return Response({"message": "Game started", "attempts": 6})


@api_view(["POST"])
def guess_word(request):
    print("Guess word. Current session: ", request.session.session_key)
    print(print(request.session.items()))
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
                # game over: defeat
                return Response(
                    {
                        "victory": False,
                        "result": highlighted_input,  # add result for the final render in the UI
                        "attempts": 0,
                        "target": word,
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
        # game over: victory
        attempts = attempts - 1
        words_list.append(user_input)
        highlighted_input = highlight_user_input(user_input, word)

        # update session variables
        request.session["attempts"] = attempts
        request.session["words_list"] = words_list
        score = calculate_score(request)
        return Response(
            {
                "victory": True,
                "result": highlighted_input,
                "attempts": attempts,
                "score": score,
            }
        )


# ---
