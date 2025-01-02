import { useNavigate } from "react-router-dom";
import { FAQIcon, LeaderboardIcon } from "./Icons";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-between px-40 p-2 border border-b-slate-300 bg-slate-100">
      <h1 className=" cursor-pointer text-2xl" onClick={() => navigate("/")}>
        Wordle
      </h1>
      <div className="flex gap-4">
        <LeaderboardIcon className="cursor-pointer" color={"#334155" /* text-slate-700 */} size={30} onClick={() => navigate("/leaderboard")} />
        <FAQIcon className="cursor-pointer" color={"#334155"} size={30} onClick={() => navigate("/faq")} />
      </div>
    </div>
  );
};
