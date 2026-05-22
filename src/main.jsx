import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App"
import Landing from "./Landing"

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
  })
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/menu" element={<App />} />
        <Route path="/menu/:hotelId/:roomNumber" element={<App />} />
        <Route path="/signup" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)