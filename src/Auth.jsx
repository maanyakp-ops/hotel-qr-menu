import { useState } from "react"
import { supabase } from "./supabase"

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login") // "login" | "signup" | "details"
  const [step1, setStep1] = useState({ email: "", password: "", hotelName: "" })
  const [details, setDetails] = useState({
    business_type: "hotel",
    pin_code: "",
    gst_number: "",
    owner_phone: "",
    contact_phone: "",
    room_count: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin() {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({
      email: step1.email,
      password: step1.password,
    })
    if (error) setError(error.message)
    else onLogin()
    setLoading(false)
  }

  async function handleStep1() {
    if (!step1.email || !step1.password || !step1.hotelName) {
      setError("Please fill in all fields.")
      return
    }
    if (step1.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setError("")
    setMode("details")
  }

  async function handleSignup() {
    if (!details.owner_phone || !details.contact_phone || !details.pin_code) {
      setError("Please fill in all required fields.")
      return
    }
    setLoading(true)
    setError("")

    const { data, error: signupError } = await supabase.auth.signUp({
      email: step1.email,
      password: step1.password,
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }

    const user = data.user
    const { error: hotelError } = await supabase.from("hotels").insert({
      user_id: user.id,
      name: step1.hotelName,
      status: "pending",
      theme: "dark-gold",
      room_count: parseInt(details.room_count) || 0,
      business_type: details.business_type,
      pin_code: details.pin_code,
      gst_number: details.gst_number || null,
      owner_phone: details.owner_phone,
      contact_phone: details.contact_phone,
    })
    if (hotelError) { setError(hotelError.message); setLoading(false); return }

    onLogin()
    setLoading(false)
  }

  const isHotel = details.business_type === "hotel"

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* LOGO / BRAND */}
        <div style={s.brand}>
          <div style={s.brandIcon}>🏨</div>
          <h1 style={s.brandTitle}>MenuQR</h1>
          <p style={s.brandSub}>Digital room service for modern hotels</p>
        </div>

        {/* LOGIN */}
        {mode === "login" && (
          <>
            <p style={s.heading}>Welcome back</p>
            {error && <p style={s.error}>{error}</p>}
            <input style={s.input} placeholder="Email" type="email" value={step1.email}
              onChange={e => setStep1(p => ({ ...p, email: e.target.value }))} />
            <input style={s.input} placeholder="Password" type="password" value={step1.password}
              onChange={e => setStep1(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <button style={s.btn} onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p style={s.switch}>
              New here?{" "}
              <span style={s.link} onClick={() => { setMode("signup"); setError("") }}>
                Create an account
              </span>
            </p>
          </>
        )}

        {/* SIGNUP STEP 1 — Basic details */}
        {mode === "signup" && (
          <>
            <div style={s.stepRow}>
              <div style={s.stepActive}>1</div>
              <div style={s.stepLine} />
              <div style={s.stepInactive}>2</div>
            </div>
            <p style={s.heading}>Create your account</p>
            <p style={s.subheading}>Start with the basics</p>
            {error && <p style={s.error}>{error}</p>}
            <input style={s.input} placeholder="Hotel / Restaurant name *" value={step1.hotelName}
              onChange={e => setStep1(p => ({ ...p, hotelName: e.target.value }))} />
            <input style={s.input} placeholder="Email address *" type="email" value={step1.email}
              onChange={e => setStep1(p => ({ ...p, email: e.target.value }))} />
            <input style={s.input} placeholder="Password (min 6 characters) *" type="password" value={step1.password}
              onChange={e => setStep1(p => ({ ...p, password: e.target.value }))} />
            <button style={s.btn} onClick={handleStep1}>Continue →</button>
            <p style={s.switch}>
              Already registered?{" "}
              <span style={s.link} onClick={() => { setMode("login"); setError("") }}>Sign in</span>
            </p>
          </>
        )}

        {/* SIGNUP STEP 2 — Business details */}
        {mode === "details" && (
          <>
            <div style={s.stepRow}>
              <div style={s.stepDone}>✓</div>
              <div style={{ ...s.stepLine, background: "#1c2b3a" }} />
              <div style={s.stepActive}>2</div>
            </div>
            <p style={s.heading}>Tell us about your business</p>
            <p style={s.subheading}>This info helps guests and keeps your account verified</p>
            {error && <p style={s.error}>{error}</p>}

            {/* Business type toggle */}
            <p style={s.label}>Type of business *</p>
            <div style={s.toggleRow}>
              <button
                style={details.business_type === "hotel" ? s.toggleActive : s.toggleInactive}
                onClick={() => setDetails(p => ({ ...p, business_type: "hotel" }))}
              >
                🏨 Hotel
              </button>
              <button
                style={details.business_type === "restaurant" ? s.toggleActive : s.toggleInactive}
                onClick={() => setDetails(p => ({ ...p, business_type: "restaurant" }))}
              >
                🍽️ Restaurant
              </button>
            </div>

            <p style={s.label}>{isHotel ? "Number of rooms *" : "Number of tables *"}</p>
            <input style={s.input} placeholder={isHotel ? "e.g. 40" : "e.g. 20"} type="number"
              value={details.room_count}
              onChange={e => setDetails(p => ({ ...p, room_count: e.target.value }))} />

            <p style={s.label}>Owner's phone number *</p>
            <input style={s.input} placeholder="10-digit mobile number" type="tel" inputMode="numeric"
              maxLength={10} value={details.owner_phone}
              onChange={e => setDetails(p => ({ ...p, owner_phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />

            <p style={s.label}>Contact number for guests *</p>
            <p style={s.hint}>Shown on the menu in case guests need help</p>
            <input style={s.input} placeholder="Reception / front desk number" type="tel" inputMode="numeric"
              maxLength={10} value={details.contact_phone}
              onChange={e => setDetails(p => ({ ...p, contact_phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />

            <p style={s.label}>PIN code *</p>
            <input style={s.input} placeholder="6-digit area PIN code" type="tel" inputMode="numeric"
              maxLength={6} value={details.pin_code}
              onChange={e => setDetails(p => ({ ...p, pin_code: e.target.value.replace(/\D/g, "").slice(0, 6) }))} />

            <p style={s.label}>GST number <span style={{ color: "#8a9bb0", fontWeight: 400 }}>(optional)</span></p>
            <input style={s.input} placeholder="e.g. 27ABCDE1234F1Z5"
              value={details.gst_number}
              onChange={e => setDetails(p => ({ ...p, gst_number: e.target.value.toUpperCase() }))} />

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button style={s.backBtn} onClick={() => { setMode("signup"); setError("") }}>← Back</button>
              <button style={{ ...s.btn, flex: 1 }} onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

const s = {
  page: { minHeight: "100vh", background: "#0a1219", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "-apple-system, sans-serif" },
  card: { background: "#111f2c", borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 420, boxShadow: "0 4px 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: 10, border: "0.5px solid #1c2b3a" },
  brand: { textAlign: "center", marginBottom: 8 },
  brandIcon: { fontSize: 40, marginBottom: 6 },
  brandTitle: { fontSize: 24, fontWeight: 700, color: "#e8f0f8", margin: "0 0 4px" },
  brandSub: { fontSize: 12, color: "#4a6a8a", margin: 0 },
  heading: { fontSize: 18, fontWeight: 600, color: "#e8f0f8", margin: "4px 0 0", textAlign: "center" },
  subheading: { fontSize: 12, color: "#4a6a8a", margin: "-4px 0 4px", textAlign: "center" },
  label: { fontSize: 12, fontWeight: 600, color: "#7eb3f5", margin: "4px 0 -4px" },
  hint: { fontSize: 11, color: "#4a6a8a", margin: "-8px 0 -4px" },
  input: { background: "#0a1219", border: "1px solid #1c2b3a", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#e8f0f8", outline: "none", width: "100%", boxSizing: "border-box" },
  btn: { background: "#7eb3f5", color: "#0a1219", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" },
  backBtn: { background: "#0a1219", color: "#7eb3f5", border: "1px solid #1c2b3a", borderRadius: 10, padding: "13px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  error: { background: "rgba(192,57,43,0.15)", color: "#e57373", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, margin: "0" },
  switch: { textAlign: "center", fontSize: 13, color: "#4a6a8a", margin: "4px 0 0" },
  link: { color: "#7eb3f5", fontWeight: 600, cursor: "pointer", textDecoration: "underline" },
  stepRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0, margin: "4px 0 8px" },
  stepActive: { width: 32, height: 32, borderRadius: "50%", background: "#7eb3f5", color: "#0a1219", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  stepInactive: { width: 32, height: 32, borderRadius: "50%", background: "#1c2b3a", color: "#4a6a8a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  stepDone: { width: 32, height: 32, borderRadius: "50%", background: "rgba(111,207,151,0.15)", color: "#6fcf97", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  stepLine: { flex: 1, height: 2, background: "#1c2b3a", maxWidth: 60 },
  toggleRow: { display: "flex", gap: 10 },
  toggleActive: { flex: 1, background: "#7eb3f5", color: "#0a1219", border: "none", borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  toggleInactive: { flex: 1, background: "#0a1219", color: "#4a6a8a", border: "1px solid #1c2b3a", borderRadius: 10, padding: "11px", fontSize: 13, cursor: "pointer" },
}