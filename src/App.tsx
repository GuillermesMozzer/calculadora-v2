import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { VersionProvider } from "@/contexts/VersionContext";
import AppGate from "@/pages/AppGate";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VersionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/app" element={<AppGate />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </VersionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
