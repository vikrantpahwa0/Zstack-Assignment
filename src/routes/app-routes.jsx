import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Wallet from "../pages/wallet"

export default function AppRoutes() {
  return (
    <Routes> 
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="*" element={<Navigate to="/wallet" replace />} />
    </Routes>
  );
}
