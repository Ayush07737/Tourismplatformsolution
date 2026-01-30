import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/*" element={<ProtectedRoute><App /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
  