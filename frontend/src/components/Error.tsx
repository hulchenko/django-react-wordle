export const Error = () => {
  return (
    <div className="w-full mt-96 m-auto font-thin">
      <h1 className="text-2xl">Server error.</h1>
      <button className="border p-2 bg-slate-600 text-white rounded mt-12" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  );
};
