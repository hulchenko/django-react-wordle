import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full mt-96 m-auto font-thin">
      <h1 className="text-3xl">404</h1>
      <p className="text-xl">Page not found</p>
      <button className="border p-2 bg-slate-600 text-white rounded mt-12" onClick={() => navigate("/")}>
        Home
      </button>
    </div>
  );
};
