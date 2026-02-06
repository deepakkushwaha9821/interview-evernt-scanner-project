import { Routes, Route } from "react-router-dom";
import Interview from "./pages/Interview";
import MobileJoin from "./pages/MobileJoin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Interview />} />
      <Route path="/mobile" element={<MobileJoin />} />
    <Route path="/result" element={<Result />} /> 
    </Routes>
  );
}

export default App;
