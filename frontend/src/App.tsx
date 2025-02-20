import { Outlet } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Toaster } from "react-hot-toast";
import { IncognitoStateProvider } from "./context/IncognitoContext";

function App() {
  return (
    <main className="w-full min-h-screen text-center bg-slate-200 text-slate-700 select-none font-mono">
      <Toaster position="top-center" />
      <Header />
      <IncognitoStateProvider>
        <Outlet />
      </IncognitoStateProvider>
      <Footer />
    </main>
  );
}

export default App;
