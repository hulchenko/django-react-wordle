import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Error } from "../components/Error";
import { Loader } from "../components/Loader";
import { ScoreModal } from "../components/ScoreModal";

const customColors = {
  gray: "bg-slate-600",
  yellow: "bg-yellow-500",
  green: "bg-green-600",
  input: "bg-slate-400",
};

const startGame = () => fetch("api/new-game/").then((res) => res.json());

export const Game = () => {
  const [gameKey, setGameKey] = useState(Date.now()); // required for new game
  const [grid, setGrid] = useState(Array(6).fill(Array(5).fill("")));
  const [gameInfo, setGameInfo] = useState({ over: false, victory: false, message: "" });
  const [attempts, setAttempts] = useState(0);
  const [disabledInput, setDisabledInput] = useState(false);

  const userGuess = useRef("");

  const {
    error,
    isLoading,
    data: gameData,
  } = useQuery({
    queryKey: ["newGame", gameKey],
    queryFn: startGame,
  });

  useEffect(() => {
    if (gameData) {
      // initialize game data from query call
      console.log(gameData);
      const { message, attempts } = gameData;
      toast(message);
      setAttempts(attempts);
      setGameInfo({ over: false, victory: false, message: "" });
      setGrid(Array(6).fill(Array(5).fill("")));
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
          newGrid[6 - attempts] = guessArr; // update current array sequence
          return newGrid;
        });
        const guessStr = guessArr
          .map((slot) => slot.letter)
          .join("")
          .toLowerCase();
        userGuess.current = guessStr;
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
            guessArr[i].color = "";
            updateGrid();
            break;
          }
        }
      } else if (key === "ENTER") {
        if (gameInfo.over) return;
        if (userGuess.current.length === 5) {
          setDisabledInput(true);
          submitGuess.mutate(userGuess.current);

          // reset values
          userGuess.current = "";
          guessArr = Array.from({ length: 5 }, () => ({ letter: "", color: "" }));
        } else {
          toast.error("5-letter word only!");
        }
      }
    };

    if (!gameInfo.over || attempts > 0) {
      document.addEventListener("keyup", guessHandler);
    }

    return () => {
      document.removeEventListener("keyup", guessHandler);
    };
  }, [attempts, disabledInput]);

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
      const { error, attempts: newAttempts, result, victory } = data;
      if (error) {
        // intercept for onError()
        throw error;
      }
      if ("victory" in data) {
        setGameInfo((prevInfo) => ({ ...prevInfo, over: true, victory }));
      }
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[6 - attempts] = result.map((letter: string) => letter); // update current array sequence
        return newGrid;
      });
      setAttempts(newAttempts);
      setDisabledInput(false);
    },
    onError: (error: string) => {
      console.error("Error submitting guess: ", error);
      toast.error(error);

      // TODO add global function to reset current grid (use in useState gameData too)
      const guessArr = Array.from({ length: 5 }, () => ({ letter: "", color: "" }));
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[6 - attempts] = guessArr; // update current array sequence
        return newGrid;
      });
      setDisabledInput(false);
    },
  });

  const restart = () => {
    console.log(`restart clicked!`);
    setGrid(Array(6).fill(Array(5).fill("")));
    setGameInfo({ over: false, victory: false, message: "" });
    setGameKey(Date.now()); // refetch
  };

  if (isLoading) return <Loader marginTop={96} size={30} />;
  if (error) return <Error />;

  return (
    <>
      {gameInfo.over && <ScoreModal victory={gameInfo.victory} restart={restart} />}
      <div className="max-w-[600px] h-[600px] m-auto flex flex-col gap-1 mt-40 border border-slate-300 p-2 rounded bg-slate-100">
        {grid.map((row, i) => (
          <div key={i} className="flex grow gap-1">
            {row.map((cell: { letter: string; color: string }, j: number) => (
              <div
                key={j}
                className={`w-full flex justify-center items-center text-2xl uppercase font-bold text-white min-h-[40px] rounded ${
                  customColors[cell.color] || "bg-slate-300"
                }`}
              >
                {cell.letter || null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
