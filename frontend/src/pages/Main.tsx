import { useNavigate } from "react-router-dom";
import logo from "/logo.svg";

export const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-40 w-full flex flex-col items-center">
      <img src={logo} alt="wordle logo" className="w-56" />
      <button className="border p-2 bg-emerald-600 text-white rounded outline-none mt-16" onClick={() => navigate("/game")}>
        New Game
      </button>
    </div>
  );
};
