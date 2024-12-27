import re
import time
import requests
from sys import exit

def fetch_random_word():
    try:
       random_word =  requests.get("https://random-word-form.herokuapp.com/random/noun1", timeout=5)
       random_word.raise_for_status() # throw an error on 4xx/5xx status code
       return random_word.json().pop().lower()
    except requests.exceptions.RequestException as error:
        print("Fetch failed: ", error)
        print("Aborting...")
        exit()

def validate_input(input):
    if len(input) > 1:
        return {"ok": False, "message": "Provide 1 letter only"}
    if not re.match(r"^[a-z]+$", input):
        return {"ok": False, "message": "Alphabetic letters only"}
    else:
        return {"ok": True}

def newGame():
    # Init setup
    random_word = fetch_random_word()
    attempts = 10
    # ------
    word_array = list(random_word)
    array_to_fill = ['_'] * len(word_array)
    wrong_letters = []


    def showInfo():
        print(f"Guessed letters: {array_to_fill}")
        print(f"Wrong letters: {wrong_letters}")
        print(f"Attempts left: {attempts}")


    while attempts > 0:
        print("\n ---")
        user_input = input("Input a letter: ")
        is_valid = validate_input(user_input)
        if not is_valid["ok"]:
            # validation issue
            print(is_valid["message"])
            continue
        if user_input not in word_array:
            # incorrect guess
            if user_input not in wrong_letters:
                attempts = attempts - 1
                wrong_letters.append(user_input)
            print(f"Oops! Letter '{user_input}' is not in the word!")
            showInfo()
            continue
        else:
            # correct guess
            for i in range(len(array_to_fill)):
                if word_array[i] == user_input:
                    array_to_fill[i] = user_input
            if word_array == array_to_fill:
                print("\nCongratulations, you won!")
                showInfo()
                restart()
            else:
                print("Nice!")
                showInfo()
    else:
        print("No attempts left! Game over.")
        restart()

def restart():
    time.sleep(2)
    print("Restarting...")
    time.sleep(1)
    newGame()

newGame()