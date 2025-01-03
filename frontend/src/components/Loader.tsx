import { PropagateLoader } from "react-spinners";
import { LoaderProps } from "../interfaces/LoaderProps";

export const Loader = ({ marginTop, size }: LoaderProps) => {
  return (
    <div className={`w-full mt-${marginTop}`}>
      <PropagateLoader color="#777" size={size} />
    </div>
  );
};
