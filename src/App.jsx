import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login"
import Register from "../pages/Register/Register"
import ResetPassword from "../pages/ResetPassword/ResetPassword"

function App() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
  );
}

export default App;
