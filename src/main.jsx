import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import App from "./App"
import Landing from "./Landing"
import Auth from "./Auth"
import Dashboard from "./Dashboard"

function AuthPage() {
  const navigate = useNavigate()
  return <Auth onLogin={() => navigate("/dashboard")} />
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/menu" element={<App />} />
        <Route path="/menu/:hotelId/:roomNumber" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)