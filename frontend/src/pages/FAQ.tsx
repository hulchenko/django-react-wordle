export const FAQ = () => {
  return (
    <div className="mt-40 text-lg border border-slate-300 bg-slate-100 w-[600px] m-auto p-4 rounded">
      <h1 className="uppercase font-bold text-3xl">How to play</h1>
      <h5>Guess the word in 6 tries.</h5>
      <hr className="my-6 shadow-black" />
      <ul className="block text-start">
        <li>1. Each guess word must be unique.</li>
        <li>2. Guess cannot be less than 5 characters.</li>
        <li>3. The color of the tiles will change to show how close your guess was to the word:</li>
        <ul className="pl-4">
          <li>
            <span className="font-bold text-green-600">Green</span> - letter is in the correct spot.
          </li>
          <li>
            <span className="font-bold text-yellow-500">Yellow</span> - letter is in the word, but in the wrong spot.
          </li>
          <li>
            <span className="font-bold text-slate-600">Gray</span> - letter is not in the word.
          </li>
        </ul>
      </ul>
      <p className="mt-8">Good luck!🤞</p>
    </div>
  );
};
