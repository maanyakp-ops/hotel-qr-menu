import { useState } from "react"
import { supabase } from "./supabase"
import { useEffect } from "react"




export default function Auth({ onLogin, initialMode }) {
  const [mode, setMode] = useState(initialMode || "login")
  const [newPassword, setNewPassword] = useState("")
  const [step1, setStep1] = useState({ email: "", password: "", hotelName: "" })
  const [details, setDetails] = useState({
    
    business_type: "hotel",
    owner_name: "",
    address: "",
    pin_code: "",
    gst_number: "",
    fssai_number: "",
    owner_phone: "",
    contact_phone: "",
    room_count: "",
  })

  useEffect(() => {
  const hash = window.location.hash
  if (hash.includes("type=recovery")) {
    setMode("reset")
  }
}, [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

    useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@400;500;600&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }, [])

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
    if (
      !details.owner_name ||
      !details.address ||
      !details.owner_phone ||
      !details.contact_phone ||
      !details.pin_code
    ) {
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
      owner_name: details.owner_name,
      address: details.address,
      pin_code: details.pin_code,
      gst_number: details.gst_number || null,
      fssai_number: details.fssai_number || null,
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
          <h1 style={s.brandTitle}>StayDine</h1>
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
              <p style={{ textAlign: "right", margin: "-4px 0 0" }}>
  <span
    style={{ fontSize: 11, color: "#C9A84C", cursor: "pointer" }}
    onClick={async () => {
      if (!step1.email) { setError("Enter your email first."); return }
      const { error } = await supabase.auth.resetPasswordForEmail(step1.email, {
        redirectTo: "https://hotel-qr-menu-gamma.vercel.app/"
      })
      if (error) setError(error.message)
      else setError("")
      alert("Password reset email sent! Check your inbox.")
    }}
  >
    Forgot password?
  </span>
</p>
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

        {mode === "reset" && (
  <>
    <p style={s.heading}>Set New Password</p>
    {error && <p style={s.error}>{error}</p>}
    <input
      style={s.input}
      placeholder="New password (min 6 characters)"
      type="password"
      value={newPassword}
      onChange={e => setNewPassword(e.target.value)}
    />
    <button
      style={s.btn}
      onClick={async () => {
        if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return }
        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) { setError(error.message); setLoading(false); return }
        alert("Password updated successfully!")
        window.location.hash = ""
        setMode("login")
        setLoading(false)
      }}
      disabled={loading}
    >
      {loading ? "Updating..." : "Update Password"}
    </button>
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
<p style={s.label}>Owner's name *</p>
<input
  style={s.input}
  placeholder="Owner's full name"
  value={details.owner_name}
  onChange={e =>
    setDetails(p => ({ ...p, owner_name: e.target.value }))
  }
/>

<p style={s.label}>
  {isHotel ? "Hotel address *" : "Restaurant address *"}
</p>
<textarea
  style={{
    ...s.input,
    minHeight: 80,
    resize: "vertical"
  }}
  placeholder="Enter complete address"
  value={details.address}
  onChange={e =>
    setDetails(p => ({ ...p, address: e.target.value }))
  }
/>
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

            <p style={s.label}>FSSAI Number <span style={{ color: "#8a9bb0", fontWeight: 400 }}>(optional)</span></p>
            <input style={s.input} placeholder="14 digit FSSAI number" 
              value={details.fssai_number}
              onChange={e => setDetails(p => ({ ...p, fssai_number: e.target.value.toUpperCase() }))} />  

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
  page: { minHeight: "100vh", background: "#0D0C0A", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Jost', -apple-system, sans-serif", position: "relative" },
  card: { background: "#141310", borderRadius: 4, padding: "36px 32px", width: "100%", maxWidth: 420, border: "1px solid #2E2B22", display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 },
  brand: { textAlign: "center", marginBottom: 8 },
  brandIcon: { fontSize: 36, marginBottom: 8 },
  brandTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#EDE8DC", margin: "0 0 4px", letterSpacing: 2 },
  brandSub: { fontSize: 11, color: "#7A6230", margin: 0, letterSpacing: 1 },
  heading: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#EDE8DC", margin: "4px 0 0", textAlign: "center", letterSpacing: 1 },
  subheading: { fontSize: 11, color: "#7A6230", margin: "-4px 0 4px", textAlign: "center", letterSpacing: 0.5 },
  label: { fontSize: 10, fontWeight: 600, color: "#C9A84C", margin: "4px 0 -6px", letterSpacing: 2, textTransform: "uppercase" },
  hint: { fontSize: 11, color: "#7A6230", margin: "-6px 0 -4px" },
  input: { background: "#0D0C0A", border: "1px solid #2E2B22", borderRadius: 2, padding: "12px 14px", fontSize: 13, color: "#EDE8DC", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Jost', sans-serif" },
  btn: { background: "#C9A84C", color: "#0D0C0A", border: "none", borderRadius: 2, padding: "14px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", letterSpacing: 1, fontFamily: "'Jost', sans-serif" },
  backBtn: { background: "none", color: "#9A927E", border: "1px solid #2E2B22", borderRadius: 2, padding: "14px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Jost', sans-serif" },
  error: { background: "rgba(192,57,43,0.1)", color: "#e57373", border: "1px solid rgba(192,57,43,0.25)", borderRadius: 2, padding: "10px 14px", fontSize: 12, margin: "0", letterSpacing: 0.3 },
  switch: { textAlign: "center", fontSize: 12, color: "#7A6230", margin: "4px 0 0" },
  link: { color: "#C9A84C", fontWeight: 600, cursor: "pointer", textDecoration: "none" },
  stepRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0, margin: "4px 0 8px" },
  stepActive: { width: 32, height: 32, borderRadius: "50%", background: "none", border: "1px solid #C9A84C", color: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0, fontFamily: "'Cormorant Garamond', serif" },
  stepInactive: { width: 32, height: 32, borderRadius: "50%", background: "none", border: "1px solid #2E2B22", color: "#7A6230", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 },
  stepDone: { width: 32, height: 32, borderRadius: "50%", background: "none", border: "1px solid #C9A84C33", color: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 },
  stepLine: { flex: 1, height: 1, background: "#2E2B22", maxWidth: 60 },
  toggleRow: { display: "flex", gap: 8 },
  toggleActive: { flex: 1, background: "#C9A84C", color: "#0D0C0A", border: "none", borderRadius: 2, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Jost', sans-serif" },
  toggleInactive: { flex: 1, background: "none", color: "#9A927E", border: "1px solid #2E2B22", borderRadius: 2, padding: "12px", fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" },
  pricingNote: { textAlign: "center", fontSize: 11, color: "#7A6230", margin: "4px 0 0", letterSpacing: 0.5 },
}