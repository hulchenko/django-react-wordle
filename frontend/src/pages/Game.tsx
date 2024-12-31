import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

export const Game = () => {
  const [grid, setGrid] = useState(Array(6).fill(Array(5).fill("")));
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState("");

  const customColors = {
    gray: "bg-gray-600",
    yellow: "bg-yellow-500",
    green: "bg-green-600",
  };

  const { error, data: gameData } = useQuery({
    queryKey: ["newGame"],
    queryFn: () => fetch("api/new-game/").then((res) => res.json()),
  });

  useEffect(() => {
    if (gameData) {
      const { message, attempts, result } = gameData;
      setMessage(message);
      setAttempts(attempts);
      setResult(result);
    }
  }, [gameData]);

  useEffect(() => {}, []);

  const mutation = useMutation({
    mutationFn: async (guess) => {
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

  const submitGuess = async (guess: string) => {
    mutation.mutate(guess);
  };

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
                  customColors[cell.color] || "bg-gray-300"
                }`}
              >
                {cell.letter || null}
              </div>
            ))}
          </div>
        ))}
      </div>
      <input
        type="text"
        maxLength={5}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitGuess(e.target.value);
          }
        }}
      />
      <p>MESSAGE: {message}</p>
      <p>ATTEMPTS: {attempts}</p>
    </>
  );
};
