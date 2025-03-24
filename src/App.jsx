import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login"
import Register from "../pages/Register/Register"
import ResetPassword from "../pages/ResetPassword/ResetPassword"
import Home from "../pages/Home/Home"

function App() {
  return (
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
  );
}

export default App;
