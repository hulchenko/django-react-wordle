# Hangman Game

### to configure the game -> update newGame call at the bottom of the file

import time
import sys

def newGame(providedLives, word):
    lives = providedLives
    wordStr = word.lower()
    wordArray = list(wordStr)
    arrayToFill = ['_'] * len(list(wordStr))
    wrongLetters = []
    correct = False


    def showInfo():
        print('Current word: {}'.format(arrayToFill))
        print('Wrong letters: {}'.format(wrongLetters))
        print('Remaining lives: {}'.format(lives))

    def winnerGameReset():
        global lives
        global wrongLetters
        global arrayToFill
        lives = providedLives
        wrongLetters = []
        arrayToFill = ['_,' * len(list(wordStr))]
        print('\nCongratulations, you won!')
        time.sleep(1)
        print('\nStarting a new game...')
        time.sleep(3)
        print('\n\n.....................')


    def lostGameReset():
        global lives
        global wrongLetters
        global arrayToFill
        lives = providedLives
        wrongLetters = []
        arrayToFill = ['_,' * len(list(wordStr))]
        print('No more lives left :(')
        time.sleep(1)
        print('\nStarting a new game...')
        time.sleep(3)
        print('\n\n.....................')


    while lives > 0:
        userInput = input('\n\nInput a letter:\n').lower()
        if len(userInput) > 1:
            print('Please provide 1 letter only')
            time.sleep(2)
        else:
            for i in range(len(arrayToFill)):
                if wordArray[i] == userInput:
                    arrayToFill[i] = userInput
                    showInfo()
                    correct = True

            if correct:
                print('Correct!')
                correct = False
            else:
                correct = False
                if userInput not in wrongLetters:
                    wrongLetters.append(userInput)
                    lives = lives - 1
                    showInfo()
                else:
                    showInfo()

                print('Wrong!')

            if wordArray == arrayToFill:
                winnerGameReset()

            if lives == 0:
                lostGameReset()

### update this
newGame(5, 'Apple')