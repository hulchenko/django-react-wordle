import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader } from "./Loader";
import { useLocalUser } from "../hooks/useLocalUser";
import { ScoreModalProps } from "../interfaces/ScoreModalProps";

export const ScoreModal = ({ victory, restart, score, target }: ScoreModalProps) => {
  const [localUser, setLocalUser] = useLocalUser();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const navigate = useNavigate();
  const restartBtn = useRef<HTMLButtonElement>(null);

  const submitScore = useMutation({
    mutationFn: async () => {
      try {
        const userObj = {
          user_name: nickname || localUser.nickname,
          user_email: email || localUser.email,
          score: Math.ceil(score || 0),
        };
        const response = await fetch("https://django-react-wordle.vercel.app/api/leaderboard/submit-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userObj),
        });

        if (!response.ok) {
          throw "Failed to submit the score.";
        }
        setLocalUser({
          nickname: userObj.user_name,
          email: userObj.user_email,
        });
      } catch (error) {
        toast.error(error as string);
        throw error;
      }
    },
    onSuccess: () => {
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(false);
    },
  });

  useEffect(() => {
    if (restartBtn.current) {
      // focus on the restart button for quick restart with Enter
      restartBtn.current.focus();
    }
  }, []);

  const leaderBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitScore.mutate();
  };

  return (
    <>
      <div className="w-full h-full fixed bg-slate-200 font-thin animate-fade-in">
        <div className="border border-slate-300 bg-slate-100 rounded mt-40 max-w-[600px] m-auto p-4">
          {victory ? (
            <div>
              <h1 className="text-2xl text-emerald-600">Congratulations!</h1>
              <p className="mt-4 text-lg">You won!🏆</p>
              <p className="mt-2">
                Final score: <span className="font-bold">{Math.ceil(score || 0)}</span>
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl text-pink-600">Game over.</h1>
              <p className="mt-4 text-lg">Better luck next time!🕹️</p>
              <p className="mt-2">
                Hidden word: <span className="font-bold uppercase">{target}</span>
              </p>
            </div>
          )}
          <div className="flex flex-col gap-4 w-full justify-center items-center mt-8">
            <p>Play again?</p>
            <div className="flex gap-4">
              <button className="border p-2 bg-slate-600 text-white rounded" onClick={() => navigate("/")}>
                Home
              </button>
              <button ref={restartBtn} className="border p-2 bg-emerald-600 text-white rounded outline-none" onClick={restart}>
                Restart
              </button>
            </div>
          </div>
          {victory && (
            <>
              <hr className="my-6 shadow-black" />
              <div>
                <h1 className="mb-2">
                  Share your score on the{" "}
                  <a href="/leaderboard" target="_blank" className="text-amber-600 hover:underline cursor-pointer">
                    Leaderboard
                  </a>
                  !
                </h1>
                {submitScore.isPending && (
                  <div className="p-3">
                    <Loader marginTop={0} size={5} />
                  </div>
                )}
                {!submitScore.isPending && scoreSubmitted && <h5>Shared! ✅</h5>}
                {!submitScore.isPending && !scoreSubmitted && (
                  <form onSubmit={leaderBoardSubmit} className="flex gap-4 w-full justify-center">
                    <input
                      type="text"
                      required
                      placeholder="Your nickname"
                      className="p-2 rounded"
                      defaultValue={localUser.nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your email"
                      className="p-2 rounded"
                      defaultValue={localUser.email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="border p-2 border-slate-600 text-slate-600 rounded hover:bg-slate-600 hover:text-white">Submit</button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
