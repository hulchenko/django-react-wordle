import { useNavigate } from "react-router-dom";
import { useIncognitoState } from "../context/IncognitoContext";
import logo from "/logo.svg";

export const Main = () => {
  const navigate = useNavigate();
  const isIncognito = useIncognitoState();
  console.log(`MAIN: `, isIncognito);

  return (
    <div className="mt-40 w-full flex flex-col items-center">
      <img src={logo} alt="wordle logo" className="w-56" />
      <p className="mt-10 w-56 text-lg font-bold">Get 6 chances to guess a 5-letter word.</p>
      <button
        className={`${isIncognito ? "bg-gray-500 line-through" : "bg-emerald-600"} border p-2  text-white rounded outline-none mt-10`}
        disabled={isIncognito}
        onClick={() => navigate("/game")}
      >
        New Game
      </button>
      {isIncognito && <p>Game cannot be run from a private browser window.</p>}
    </div>
  );
};
