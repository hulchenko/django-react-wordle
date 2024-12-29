from django.shortcuts import render
from sys import exit
from .models import User, Leaderboard
import random
import re
import time
import requests
from sys import exit

WORDS = ["apple", "peach", "grape", "mango", "lemon"]

def fetch_random_word():
    word_length = 5
    try:
       random_word =  requests.get(f"https://random-word-api.herokuapp.com/word?length={word_length}", timeout=5)
       random_word.raise_for_status() # throw an error on 4xx/5xx status code
       return random_word.json().pop().lower()
    except requests.exceptions.RequestException as error:
        print("Fetch failed: ", error)
        print("Aborting...")
        exit()

def game(request):
    if request.method == "POST":
        # Retrieve session data
        # random_word = request.session.get("random_word", random.choice(WORDS))
        random_word = fetch_random_word()
        print("RANDOM WORD: ", random_word)
        attempts = request.session.get("attempts", 6)

        # Get user input
        user_guess = request.POST.get("guess", "").lower()

        # Validate input
        if len(user_guess) != 5 or not user_guess.isalpha():
            message = "Please enter a valid 5-letter word."
        else:
            attempts -= 1
            request.session["attempts"] = attempts

            if user_guess == random_word:
                message = "Congratulations! You guessed the word!"
                request.session.flush()  # Reset the game
            elif attempts == 0:
                message = f"Game Over! The word was {random_word}."
                request.session.flush()  # Reset the game
            else:
                message = f"Wrong guess! Try again. Attempts left: {attempts}"

        # Update session
        request.session["random_word"] = random_word
    else:
        # New game
        request.session["random_word"] = random.choice(WORDS)
        request.session["attempts"] = 6
        message = "Welcome to Wordle! Start guessing."
    return render(request, "game/index.html", {"message": message, "attempts": request.session.get("attempts", 6)})


def leaderboard(request):
    leaderboards = Leaderboard.objects.all()
    print("LEADERBOARDS OBJECT: ", leaderboards)
    context = {"leaderboards": leaderboards}
    return render(request, 'game/leaderboard.html', context)

# # Get leaderboard and display
# def index(request):
#     return render(request, "game/index.html") # by default pulls from the global directory. Update settings.py to use templates/game/index.html path