import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MAX_ATTEMPTS, WORD_LENGTH } from "../constants/contstants";
import { Cell, Grid, GameStart } from "../interfaces/GameBoard";

const startGame = (): Promise<GameStart> => fetch("api/new-game/").then((res) => res.json());
const defaultCell: Cell = { letter: "", color: "default", local: true };
const initGameState = { over: false, victory: false, message: "", score: 0, target: "" };

export const useWordleGame = () => {
  const [gameKey, setGameKey] = useState(Date.now()); // required for new game
  const [grid, setGrid] = useState<Grid>(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill({ ...defaultCell })));
  const [gameInfo, setGameInfo] = useState({ ...initGameState });
  const [attempts, setAttempts] = useState(0);
  const [disabledInput, setDisabledInput] = useState(false);

  const userGuessStr = useRef("");
  const userGuessArr = useRef<Cell[]>(Array.from({ length: WORD_LENGTH }, () => ({ ...defaultCell })));

  const {
    error,
    isLoading,
    data: gameData,
  } = useQuery({
    queryKey: ["newGame", gameKey],
    queryFn: startGame,
    refetchOnWindowFocus: false,
  });

  const submitGuess = useMutation({
    mutationFn: async (guess: string) => {
      try {
        const response = await fetch("api/submit-guess/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guess }),
        });
        const data = await response.json();
        if (!response.ok) {
          // intercept + throw error for onError() method, otherwise it ends up in onSuccess()
          throw data.error;
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      const { error, attempts: newAttempts, result, victory, score, target } = data;
      if (error) {
        // intercept for onError()
        throw error;
      }
      if ("victory" in data) {
        setGameInfo((prevInfo) => ({ ...prevInfo, over: true, victory, score, target }));
      }
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[MAX_ATTEMPTS - attempts] = result.map((letter: string) => letter); // update current array sequence
        return newGrid;
      });
      setAttempts(newAttempts);
      resetLocalInput();
      setDisabledInput(false);
    },
    onError: (error: string) => {
      console.error("Error submitting guess: ", error);
      toast.error(error);
      resetLocalInput(error);
      setDisabledInput(false);
    },
  });

  const resetLocalInput = (error: string = "") => {
    const blankInputArr = Array.from({ length: WORD_LENGTH }, () => ({ ...defaultCell }));
    userGuessArr.current = blankInputArr;
    userGuessStr.current = "";
    if (error) {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[MAX_ATTEMPTS - attempts] = blankInputArr; // reset current input array
        return newGrid;
      });
    }
  };

  const keyPressHandler = useCallback(
    (key: string) => {
      if (gameInfo.over) return;

      const alphabetical = /^[A-Z]$/;
      const guessArr = userGuessArr.current;

      const updateGrid = () => {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[MAX_ATTEMPTS - attempts] = guessArr; // update current array sequence
          return newGrid;
        });
        const guessStr = guessArr
          .map((slot) => slot.letter)
          .join("")
          .toLowerCase();
        userGuessStr.current = guessStr;
      };

      if (alphabetical.test(key) && !disabledInput) {
        const emptySlot = guessArr.findIndex((slot) => slot.letter === ""); // fill out the first empty string
        if (emptySlot !== -1) {
          guessArr[emptySlot].letter = key;
          guessArr[emptySlot].color = "input";
          updateGrid();
        }
      } else if (key === "BACKSPACE") {
        for (let i = guessArr.length - 1; i >= 0; i--) {
          if (guessArr[i].letter !== "") {
            // clear out the last filled string
            guessArr[i].letter = "";
            guessArr[i].color = "default";
            updateGrid();
            break;
          }
        }
      } else if (key === "ENTER") {
        if (userGuessStr.current.length === WORD_LENGTH) {
          setDisabledInput(true);
          submitGuess.mutate(userGuessStr.current);
        } else {
          toast.error("5-letter word only!");
        }
      }
    },
    [attempts, disabledInput, gameInfo, submitGuess]
  );

  const restartGame = useCallback(() => {
    setGrid(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill({ ...defaultCell })));
    setGameInfo({ ...initGameState });
    setGameKey(Date.now()); // refetch
  }, []);

  useEffect(() => {
    if (gameData) {
      // initialize game data from query call
      const { message, attempts } = gameData;
      toast(message);
      setAttempts(attempts);
      setGameInfo({ ...initGameState });
      setGrid(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill({ ...defaultCell })));
    }
    if (error) {
      toast.error("Error connecting to the game server.");
    }
  }, [gameData, error]);

  return { grid, gameInfo, isLoading, error, keyPressHandler, restartGame };
};
