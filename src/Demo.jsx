import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import Dashboard from "./Dashboard"

const DEMO_HOTEL_ID = "ef9da513-6e99-47f8-83c8-88c4e8d2fcfb"

export default function Demo() {
  const [newOrderFlash, setNewOrderFlash] = useState(false)
  const [hotelData, setHotelData] = useState(null)

  useEffect(() => {
    // Fetch demo hotel info
    const fetchHotel = async () => {
      const { data } = await supabase.from("hotels").select("*").eq("id", DEMO_HOTEL_ID).single()
      setHotelData(data)
    }
    fetchHotel()

    // Flash on new orders
    const sub = supabase.channel("demo-orders-" + Date.now())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `hotel_id=eq.${DEMO_HOTEL_ID}` }, () => { setNewOrderFlash(true); setTimeout(() => setNewOrderFlash(false), 2000) })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  return (
    <div style={d.page}>
      <div style={d.header}>
        <a href="/" style={d.backLink}>← Back</a>
        <div style={d.headerCenter}><span style={d.logo}>MenuQR</span><span style={d.demoBadge}>Live Demo</span></div>
        <div style={d.liveIndicator}><span style={{...d.liveDot, background: newOrderFlash ? "#f5a623" : "#6fcf97"}} /><span style={d.liveText}>{newOrderFlash ? "New Order!" : "Live"}</span></div>
      </div>
      <div style={d.hint}>👈 Place order from left menu · Dashboard controls on right 👉</div>
      <div style={d.panels}>
        <div style={d.leftPanel}>
          <div style={d.panelLabel}><span style={d.panelDot} /> Guest Menu · Room 101</div>
          <iframe src={`/menu/${DEMO_HOTEL_ID}/101`} style={d.iframe} title="Menu" />
        </div>
        <div style={d.rightPanel}>
          <div style={d.panelLabel}><span style={{...d.panelDot, background: "#7eb3f5"}} /> Staff Dashboard (Demo)</div>
          {hotelData ? (
            <div style={d.dashboardWrap}>
              <Dashboard demoMode={true} demoHotelId={DEMO_HOTEL_ID} onBack={() => {}} />
            </div>
          ) : (
            <div style={{padding: "20px", color: "#8a9bb0"}}>Loading dashboard...</div>
          )}
        </div>
      </div>
    </div>
  )
}

const d = {
  page: { minHeight: "100vh", background: "#f4f6f9", fontFamily: "-apple-system, sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #e2e8f0", background: "#fff", position: "sticky", top: 0, zIndex: 100 },
  backLink: { color: "#8a9bb0", textDecoration: "none", fontSize: 13 },
  headerCenter: { display: "flex", gap: 10, alignItems: "center" },
  logo: { fontSize: 16, fontWeight: 600, color: "#1c2b3a" },
  demoBadge: { background: "#fff3e0", color: "#b45309", border: "1px solid #fcd34d", borderRadius: 20, padding: "3px 10px", fontSize: 11 },
  liveIndicator: { display: "flex", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: "50%", transition: "background 0.3s" },
  liveText: { fontSize: 12, color: "#6fcf97", fontWeight: 500 },
  hint: { padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", textAlign: "center", fontSize: 13, color: "#8a9bb0" },
  panels: { display: "flex", height: "calc(100vh - 120px)" },
  leftPanel: { flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" },
  rightPanel: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  panelLabel: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0", fontSize: 11, color: "#8a9bb0", flexShrink: 0 },
  panelDot: { width: 8, height: 8, borderRadius: "50%", background: "#6fcf97" },
  iframe: { flex: 1, width: "100%", border: "none" },
  dashboardWrap: { flex: 1, overflowY: "auto", background: "#f4f6f9" },
}