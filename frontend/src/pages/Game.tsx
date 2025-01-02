import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Error } from "../components/Error";
import { Loader } from "../components/Loader";

const COLORS = {
  gray: "bg-gray-600",
  yellow: "bg-yellow-500",
  green: "bg-green-600",
  input: "bg-gray-400",
};

export const Game = () => {
  const [grid, setGrid] = useState(Array(6).fill(Array(5).fill("")));
  const attemptsRef = useRef(0);
  const userGuess = useRef("");

  const {
    error,
    isLoading,
    data: gameData,
  } = useQuery({
    queryKey: ["newGame"],
    queryFn: () => fetch("api/new-game/").then((res) => res.json()),
  });

  useEffect(() => {
    if (gameData) {
      // initialize game data from query call
      console.log(gameData);
      const { message, attempts } = gameData;
      toast(message);
      attemptsRef.current = attempts;
    }
    if (error) {
      toast.error("Error connecting to the game server.");
    }
  }, [gameData, error]);

  useEffect(() => {
    const alphabetical = /^[A-Z]$/;
    let guessArr = Array.from({ length: 5 }, () => ({ letter: "", color: "" })); // .fill() didn't work, as it points to the same object in memory

    const guessHandler = (e) => {
      const key = e.key.toUpperCase();

      const updateGrid = () => {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[6 - attemptsRef.current] = guessArr; // update current array sequence
          return newGrid;
        });
        const guessStr = guessArr
          .map((slot) => slot.letter)
          .join("")
          .toLowerCase();
        userGuess.current = guessStr;
      };

      if (alphabetical.test(key) && attemptsRef.current > 0) {
        const emptySlot = guessArr.findIndex((slot) => slot.letter === ""); // fill out the first empty string
        if (emptySlot !== -1) {
          guessArr[emptySlot].letter = key;
          guessArr[emptySlot].color = "input";
          updateGrid();
        }
      }
      if (key === "BACKSPACE") {
        for (let i = guessArr.length - 1; i >= 0; i--) {
          if (guessArr[i].letter !== "") {
            // clear out the last filled string
            guessArr[i].letter = "";
            guessArr[i].color = "";
            updateGrid();
            break;
          }
        }
      }
      if (key === "ENTER") {
        if (userGuess.current.length === 5) {
          submitGuess.mutate(userGuess.current);

          // reset values
          userGuess.current = "";
          guessArr = Array.from({ length: 5 }, () => ({ letter: "", color: "" }));
        } else {
          toast.error("5-letter word only!");
        }
      }
    };

    document.addEventListener("keyup", guessHandler);

    return () => {
      document.removeEventListener("keyup", guessHandler);
    };
  }, []);

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
      console.log(`ON SUCCESS: `, data);
      const prevAttempts = attemptsRef.current;
      const { error, message, attempts, result } = data;
      if (error) {
        // intercept for onError()
        throw error;
      }
      if (message) {
        toast(message);
      }
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[6 - prevAttempts] = result.map((letter: string) => letter); // update current array sequence
        return newGrid;
      });
      attemptsRef.current = attempts;
    },
    onError: (error: string) => {
      console.error("Error submitting guess: ", error);
      toast.error(error);
    },
  });

  if (isLoading) return <Loader />;
  if (error) return <Error />;

  return (
    <div className="max-w-[600px] h-[600px] m-auto flex flex-col gap-1 mt-40 border border-gray-300 p-2 rounded">
      {grid.map((row, i) => (
        <div key={i} className="flex grow gap-1">
          {row.map((cell, j) => (
            <div
              key={j}
              className={`w-full flex justify-center items-center text-2xl uppercase font-bold text-white min-h-[40px] rounded ${
                COLORS[cell.color] || "bg-gray-300"
              }`}
            >
              {cell.letter || null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
