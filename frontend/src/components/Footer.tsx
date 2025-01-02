export const Footer = () => {
  return (
    <div className="w-full absolute bottom-0 border border-t-slate-300 font-thin text-sm bg-slate-100">
      Created by{" "}
      <a href="https://github.com/hulchenko" target="_blank" className="font-bold hover:underline">
        hulchenko
      </a>{" "}
      inspired by Josh Wardle's{" "}
      <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" className="font-bold hover:underline">
        Wordle
      </a>
      .
    </div>
  );
};
