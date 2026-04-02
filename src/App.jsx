// import { useState } from "react";
// import Interview from "./pages/Interview";
// import Result from "./pages/Result";
// import MobileJoin from "./pages/MobileJoin";

// function App() {
//   const [page, setPage] = useState(
//     window.location.pathname === "/mobile" ? "mobile" : "interview"
//   );
//   const [result, setResult] = useState(null);

//   if (page === "mobile") return <MobileJoin />;
//   if (page === "result") return <Result result={result} />;

//   return <Interview setPage={setPage} setResult={setResult} />;
// }

// export default App;




import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";

import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";

import AdminDashboard from "./pages/AdminDashboard";

import Interview from "./pages/Interview";
import MobileJoin from "./pages/MobileJoin";
import Result from "./pages/Result";

function App() {

  return (

    <Routes>

      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* USER */}

      <Route path="/user-login" element={<UserLogin />} />
      <Route path="/user-register" element={<UserRegister />} />

      {/* ADMIN */}

      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* INTERVIEW */}

      <Route path="/interview" element={<Interview />} />
      <Route path="/mobile" element={<MobileJoin />} />
      <Route path="/interview/mobile" element={<MobileJoin />} />
      <Route path="/result" element={<Result />} />

    </Routes>

  );
}

export default App;