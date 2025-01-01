import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

const COLORS = {
  gray: "bg-gray-600",
  yellow: "bg-yellow-500",
  green: "bg-green-600",
  input: "bg-gray-400",
};

export const Game = () => {
  const [grid, setGrid] = useState(Array(6).fill(Array(5).fill("")));
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState("");

  const attemptsRef = useRef(0);
  const userGuess = useRef("");

  const { error, data: gameData } = useQuery({
    queryKey: ["newGame"],
    queryFn: () => fetch("api/new-game/").then((res) => res.json()),
  });

  useEffect(() => {
    attemptsRef.current = attempts;
  }, [attempts]);

  useEffect(() => {
    if (gameData) {
      console.log(`gameData: `, gameData);
      // initialize game data
      const { message, attempts, result } = gameData;
      setMessage(message);
      setAttempts(attempts);
      setResult(result);
    }
  }, [gameData]);

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
        console.log(`EMPTY SLOT: `, emptySlot);
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
        }
        setMessage("5-letter word only!"); // TODO add more of these in the UI; replace backend with errors instead
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
          throw data.message;
        }
        console.log(data);
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      setGrid((prevGrid) => {
        setAttempts(data.attempts);
        setMessage(data.message);
        const newGrid = [...prevGrid];
        newGrid[6 - attempts] = data.result.map((data) => data); // update current array sequence
        return newGrid;
      });
    },
    onError: (error) => {
      console.error("Error submitting guess: ", error);
      setMessage(error);
    },
  });

  if (error) return "Error starting the game. Please try again.";

  return (
    <>
      <div className="max-w-[600px] h-[600px] m-auto flex flex-col gap-1">
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
      {/* <input
        type="text"
        maxLength={5}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitGuess(e.target.value);
          }
        }}
      /> */}
      <p>MESSAGE: {message}</p>
      <p>ATTEMPTS: {attempts}</p>
    </>
  );
};
