import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CalculatorPage from "@/pages/CalculatorPage";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/app" element={<CalculatorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
