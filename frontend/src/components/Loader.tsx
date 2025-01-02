import { PropagateLoader } from "react-spinners";

export const Loader = () => {
  return (
    <div className="w-full mt-96">
      <PropagateLoader color="#777" size={30} />
    </div>
  );
};
