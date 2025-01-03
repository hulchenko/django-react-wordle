import { useQuery } from "@tanstack/react-query";
import { Loader } from "../components/Loader";
import { Error } from "../components/Error";

const fetchLeaderboardData = () => fetch("/api/leaderboard/").then((res) => res.json());

export const Leaderboard = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["leaderboardData"],
    queryFn: fetchLeaderboardData,
  });

  interface UserInfo {
    id: number;
    user_name: string;
    user_email: string;
    score: number;
    score_date: string;
    wins: number;
  }

  const dateDisplay = (date: string) => {
    if (!date) {
      return null;
    }
    const month = new Date(date).toLocaleString("en-CA", { month: "long" });
    const day = new Date(date).getDate();
    let hours: string | number = new Date(date).getHours();
    let minutes: string | number = new Date(date).getMinutes();

    if (hours >= 0 && hours <= 9) {
      hours = "0" + hours;
    }
    if (minutes >= 0 && minutes <= 9) {
      minutes = "0" + minutes;
    }

    return `${month} ${day}, ${hours}:${minutes}`;
  };

  const scoreDisplay = (score: number) => {
    if (score === 0) return 0;
    if (!score) return "N/A";
    return score;
  };

  if (isPending) return <Loader marginTop={96} size={30} />;
  if (error) return <Error />;

  return (
    <div className="mt-40">
      <h1 className="mb-4 text-2xl font-bold">Leaderboard 🏆</h1>
      <table className="m-auto bg-white border border-slate-300 text-start inline-block max-h-[600px] overflow-y-auto">
        <thead>
          <tr className="bg-slate-100">
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Score</th>
            <th className="py-2 px-4 border-b">Submitted On</th>
            <th className="py-2 px-4 border-b">Wins</th>
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? (
            data.map((item: UserInfo) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="py-2 px-4 border-b max-w-96 overflow-hidden text-ellipsis">{item.user_name || "N/A"}</td>
                <td className="py-2 px-4 border-b max-w-96 overflow-hidden text-ellipsis">{item.user_email || "N/A"}</td>
                <td className="py-2 px-4 border-b">{scoreDisplay(item.score)}</td>
                <td className="py-2 px-4 border-b">{dateDisplay(item.score_date) || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.wins || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-4 text-center">
                Nothing here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
