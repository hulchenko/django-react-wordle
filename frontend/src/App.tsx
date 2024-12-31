import { Outlet } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

function App() {
  return (
    <main className="w-full text-center bg-slate-200">
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
}

export default App;
