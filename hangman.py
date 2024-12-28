import re
import time
import requests
from sys import exit

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

def validate_input(input):
    if len(input) != 5:
        return {"ok": False, "message": "5-letter word only"}
    if not re.match(r"^[a-z]+$", input):
        return {"ok": False, "message": "Alphabetic letters only"}
    else:
        return {"ok": True}

def highlight_guessed_input(input, word_array):
    def mark_green(letter):
        return f">{letter}<"

    def mark_yellow(letter):
        return f"*{letter}*"
    
    result = [""] * len(word_array)
    tracking_letters = list(word_array) # duplicate array
    
    for i in range(len(word_array)):
        if input[i] == word_array[i]:
            result[i] = mark_green(input[i])
            tracking_letters[i] = None # mark as used
    for i in range(len(word_array)):
        if result[i] == "":
            if input[i] in tracking_letters: # this should now ignore all green marked letters
                result[i] = mark_yellow(input[i])
                marked_char_idx = tracking_letters.index(input[i])
                tracking_letters[marked_char_idx] = None # mark as used
            else:
                result[i] = input[i]
    return result


def newGame():
    # Init setup
    attempts = 6
    random_word = fetch_random_word()
    word_array = list(random_word)
    words_grid = []


    def showInfo():
        print(f"Current words: {words_grid}")
        print(f"Attempts left: {attempts}")


    while attempts > 0:
        print("\n ---")
        user_input = input("Input a word: ")
        is_valid = validate_input(user_input)
        if not is_valid["ok"]:
            # validation issue
            print(is_valid["message"])
            continue
        if user_input != random_word:
            # incorrect guess
            if user_input not in words_grid:
                attempts = attempts - 1
                highlight_input = highlight_guessed_input(user_input, word_array)
                words_grid.append(highlight_input)
                print(f"Oops! Word '{user_input}' is not the right word!")
                showInfo()
            else:
                print(f"Word '{user_input}' is already in the list")
            continue
        else:
            # correct guess
            attempts = attempts - 1
            highlight_input = highlight_guessed_input(user_input, word_array)
            words_grid.append(highlight_input)
            print("\nCongratulations, you won!")
            showInfo()
            restart()
    else:
        print("No attempts left! Game over.")
        restart()

def restart():
    time.sleep(2)
    print("Restarting...")
    time.sleep(1)
    newGame()

newGame()