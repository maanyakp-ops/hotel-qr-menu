import { useEffect, useState } from "react"
import { supabase } from "./supabase"

const DEMO_HOTEL_ID = "ef9da513-6e99-47f8-83c8-88c4e8d2fcfb"

export default function Demo() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [newOrderFlash, setNewOrderFlash] = useState(false)

  useEffect(() => {
    fetchOrders()
    const sub = supabase.channel("demo-orders-" + Date.now())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `hotel_id=eq.${DEMO_HOTEL_ID}` }, () => { fetchOrders(); setNewOrderFlash(true); setTimeout(() => setNewOrderFlash(false), 2000) })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `hotel_id=eq.${DEMO_HOTEL_ID}` }, () => { fetchOrders() })
      .subscribe()
    const interval = setInterval(fetchOrders, 5000)
    return () => { supabase.removeChannel(sub); clearInterval(interval) }
  }, [])

  async function fetchOrders() {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const { data } = await supabase.from("orders").select(`*, order_items(quantity, price, menu_items(name))`).eq("hotel_id", DEMO_HOTEL_ID).neq("status", "hold").gte("created_at", today.toISOString()).order("created_at", { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status, delivered_at: status === "delivered" ? new Date().toISOString() : null }).eq("id", id)
    fetchOrders()
  }

  const active = orders.filter(o => !["delivered", "cancelled", "rejected"].includes(o.status))
  const done = orders.filter(o => o.status === "delivered")

  return (
    <div style={d.page}>
      <div style={d.header}>
        <a href="/" style={d.backLink}>← Back</a>
        <div style={d.headerCenter}><span style={d.logo}>MenuQR</span><span style={d.demoBadge}>Live Demo</span></div>
        <div style={d.liveIndicator}><span style={{...d.liveDot, background: newOrderFlash ? "#f5a623" : "#6fcf97"}} /><span style={d.liveText}>{newOrderFlash ? "New Order!" : "Live"}</span></div>
      </div>
      <div style={d.hint}>👈 Place order from left · It appears on right 👉</div>
      <div style={d.panels}>
        <div style={d.leftPanel}>
          <div style={d.panelLabel}><span style={d.panelDot} /> Guest Menu</div>
          <iframe src={`/menu/${DEMO_HOTEL_ID}/101`} style={d.iframe} title="Menu" />
        </div>
        <div style={d.rightPanel}>
          <div style={d.panelLabel}><span style={{...d.panelDot, background: "#7eb3f5"}} /> Dashboard</div>
          <div style={d.dashboardPanel}>
            <div style={d.metrics}>
              <div style={d.metric}><div style={d.metricVal}>{orders.length}</div><div>Today</div></div>
              <div style={d.metric}><div style={d.metricVal}>{active.length}</div><div>Active</div></div>
              <div style={d.metric}><div style={d.metricVal}>₹{(orders.filter(o => !["cancelled","rejected"].includes(o.status)).reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0) / 1000).toFixed(1)}k</div><div>Revenue</div></div>
            </div>
            {loading && <p>Loading...</p>}
            {!loading && active.length === 0 && <div style={{textAlign: "center", padding: "40px", color: "#8a9bb0"}}>No orders yet</div>}
            {active.map(order => {
              const total = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
              return (
                <div key={order.id} style={d.orderCard}>
                  <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                    <div style={d.roomChip}>🚪 Room {order.room_id}</div>
                    <span style={d.badge}>{order.status}</span>
                  </div>
                  <div style={d.items}>{order.order_items.map((i, idx) => <div key={idx}>{i.menu_items?.name} x{i.quantity}</div>)}</div>
                  <div style={{display: "flex", justifyContent: "space-between", marginTop: 10}}>
                    <span>₹{total}</span>
                    <div style={{display: "flex", gap: 6}}>
                      {order.status === "pending" && <button style={d.btn} onClick={() => updateStatus(order.id, "preparing")}>Preparing</button>}
                      {order.status === "preparing" && <button style={d.btn} onClick={() => updateStatus(order.id, "on_the_way")}>On Way</button>}
                      {order.status === "on_the_way" && <button style={d.btn} onClick={() => updateStatus(order.id, "delivered")}>✓</button>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
  dashboardPanel: { flex: 1, overflowY: "auto", padding: "14px" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 },
  metric: { background: "#fff", borderRadius: 10, padding: "12px", textAlign: "center", border: "0.5px solid #e2e8f0", fontSize: 12, color: "#8a9bb0" },
  metricVal: { fontSize: 18, fontWeight: 600, color: "#1c2b3a" },
  orderCard: { background: "#fff", borderRadius: 12, padding: "12px", marginBottom: 8, border: "0.5px solid #e2e8f0" },
  roomChip: { display: "inline-block", background: "#f4f6f9", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#1c2b3a", fontWeight: 500 },
  badge: { background: "#fff3e0", color: "#b45309", borderRadius: 20, padding: "3px 8px", fontSize: 10, fontWeight: 500, textTransform: "capitalize" },
  items: { borderTop: "0.5px solid #e2e8f0", borderBottom: "0.5px solid #e2e8f0", padding: "6px 0", margin: "8px 0", fontSize: 12, color: "#8a9bb0" },
  btn: { background: "#1c2b3a", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 500 },
}