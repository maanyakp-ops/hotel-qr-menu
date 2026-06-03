import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import App from "./App"
import Landing from "./Landing"
import Auth from "./Auth"
import Dashboard from "./Dashboard"
import Demo from "./Demo"

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialMode = location.pathname === "/signup" ? "signup" : "login"
  return <Auth onLogin={() => navigate("/dashboard")} initialMode={initialMode} />
}

function DashboardPage() {
  const navigate = useNavigate()
  return <Dashboard onBack={() => navigate("/")} />
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/menu" element={<App />} />
        <Route path="/menu/:hotelId/:roomNumber" element={<App />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)