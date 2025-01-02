import { PropagateLoader } from "react-spinners";

export const Loader = ({ marginTop, size }: { marginTop: number; size: number }) => {
  return (
    <div className={`w-full mt-${marginTop}`}>
      <PropagateLoader color="#777" size={size} />
    </div>
  );
};
