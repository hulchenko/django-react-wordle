import { useEffect } from "react";
import { Error } from "../components/Error";
import { Loader } from "../components/Loader";
import { ScoreModal } from "../components/ScoreModal";
import { COLORS } from "../constants/contstants";
import { useWordleGame } from "../hooks/useWordleGame";

export const Game = () => {
  const { grid, gameInfo, isLoading, error, keyPressHandler, restartGame } = useWordleGame();

  useEffect(() => {
    const press = (e: KeyboardEvent) => keyPressHandler(e.key.toUpperCase());
    document.addEventListener("keyup", press);
    return () => document.removeEventListener("keyup", press);
  }, [keyPressHandler]);

  if (isLoading) return <Loader marginTop={96} size={30} />;
  if (error) return <Error />;

  return (
    <>
      {gameInfo.over && <ScoreModal victory={gameInfo.victory} restart={restartGame} score={gameInfo.score} target={gameInfo.target} />}
      {!gameInfo.over && (
        <div className="max-w-[600px] h-[600px] m-auto flex flex-col gap-1 mt-40 border border-slate-300 p-2 rounded bg-slate-100 animate-fade-in">
          {grid.map((row, i) => (
            <div key={i} className="flex grow gap-1">
              {row.map((cell, j: number) => (
                <div
                  key={j}
                  className={`w-full flex justify-center items-center text-2xl uppercase font-bold text-white min-h-[40px] rounded 
                  ${cell.letter && "animate-boop"}
                  ${cell && !cell.local && "animate-flip"}
                  ${COLORS[cell.color] || "bg-slate-300"}`}
                >
                  {cell.letter || null}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
