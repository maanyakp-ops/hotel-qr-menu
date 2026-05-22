import { useState } from "react"
import { supabase } from "./supabase"

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [hotelName, setHotelName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    setLoading(true)
    setError("")

    if (mode === "signup") {
      const { data, error: signupError } = await supabase.auth.signUp({ email, password })
      if (signupError) { setError(signupError.message); setLoading(false); return }
      if (!data.user) { setError("Check your email to confirm your account, then login."); setLoading(false); return }

      const { error: hotelError } = await supabase
        .from("hotels")
        .insert({
            user_id: data.user.id,
            name: hotelName,
            owner_email: email
          })
      if (hotelError) { setError(hotelError.message); setLoading(false); return }

      onLogin()
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) { setError(loginError.message); setLoading(false); return }
      onLogin()
    }

    setLoading(false)
  }

  return (
    <div style={a.page}>
      <div style={a.card}>
        <p style={a.logo}>🏨</p>
        <p style={a.title}>{mode === "login" ? "Staff Login" : "Register Your Hotel"}</p>

        {mode === "signup" && (
          <input
            style={a.input}
            placeholder="Hotel name"
            value={hotelName}
            onChange={e => setHotelName(e.target.value)}
          />
        )}
        <input
          style={a.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={a.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p style={a.error}>{error}</p>}

        <button style={a.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>

        <p style={a.toggle}>
          {mode === "login" ? "New hotel? " : "Already registered? "}
          <span style={a.link} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  )
}

const a = {
  page: { background: "#1c1c1e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif" },
  card: { background: "#2c2c2e", borderRadius: 20, padding: "36px 28px", width: "100%", maxWidth: 340, border: "0.5px solid #38383a" },
  logo: { fontSize: 36, textAlign: "center", margin: "0 0 10px" },
  title: { color: "#f2f2f2", fontSize: 18, fontWeight: 500, textAlign: "center", margin: "0 0 24px" },
  input: { width: "100%", background: "#3a3a3c", border: "0.5px solid #48484a", borderRadius: 10, padding: "12px 14px", color: "#f2f2f2", fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" },
  btn: { width: "100%", background: "#b8924a", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 6 },
  error: { color: "#ff6b6b", fontSize: 12, margin: "0 0 10px", textAlign: "center" },
  toggle: { color: "#6e6e73", fontSize: 13, textAlign: "center", marginTop: 18 },
  link: { color: "#b8924a", cursor: "pointer" },
}