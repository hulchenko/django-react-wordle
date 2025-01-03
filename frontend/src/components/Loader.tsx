import { PropagateLoader } from "react-spinners";

interface LoaderProps {
  marginTop: number;
  size: number;
}

export const Loader = ({ marginTop, size }: LoaderProps) => {
  return (
    <div className={`w-full mt-${marginTop}`}>
      <PropagateLoader color="#777" size={size} />
    </div>
  );
};
