import { useNavigate } from "react-router-dom";
import logo from "/logo.svg";

export const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-40 w-full flex flex-col items-center">
      <img src={logo} alt="wordle logo" className="w-56" />
      <p className="mt-10 w-56 text-lg font-bold">Get 6 chances to guess a 5-letter word.</p>
      <button className="border p-2 bg-emerald-600 text-white rounded outline-none mt-10" onClick={() => navigate("/game")}>
        New Game
      </button>
    </div>
  );
};
