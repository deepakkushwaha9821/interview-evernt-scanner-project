import { useState } from "react";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import MobileJoin from "./pages/MobileJoin";

function App() {
  const [page, setPage] = useState(
    window.location.pathname === "/mobile" ? "mobile" : "interview"
  );
  const [result, setResult] = useState(null);

  if (page === "mobile") return <MobileJoin />;
  if (page === "result") return <Result result={result} />;

  return <Interview setPage={setPage} setResult={setResult} />;
}

export default App;