import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import App from "./App"
import Landing from "./Landing"
import Auth from "./Auth"
import Dashboard from "./Dashboard"
import { lazy, Suspense } from "react"

const Demo = lazy(() => import("./Demo"))

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check for password recovery hash
  const hash = window.location.hash
  const isReset = hash.includes("type=recovery")
  
  const initialMode = isReset ? "reset" : location.pathname === "/signup" ? "signup" : "login"
  return <Auth onLogin={() => navigate("/dashboard")} initialMode={initialMode} />
}

function DashboardPage() {
  const navigate = useNavigate()
  return <Dashboard onBack={() => navigate("/")} />
}

function RootPage() {
  const navigate = useNavigate()
  const hash = window.location.hash
  
  if (hash.includes("type=recovery")) {
    return <Auth onLogin={() => navigate("/dashboard")} initialMode="reset" />
  }
  
  return <Landing />
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/menu" element={<App />} />
        <Route path="/menu/:hotelId/:roomNumber" element={<App />} />
        <Route path="/demo" element={<Suspense fallback={<div style={{padding: '20px'}}>Loading...</div>}><Demo /></Suspense>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)