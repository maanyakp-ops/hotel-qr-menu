import { useEffect, useState } from "react"
import { supabase } from "./supabase"

const hotelId = "00000000-0000-0000-0000-000000000001"

export default function Dashboard({ onBack }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    const sub = supabase.channel("orders-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, fetchOrders)
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items(quantity, price, menu_items(name))`)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
    if (error) console.error(error)
    else setOrders(data)
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id)
    fetchOrders()
  }

  const active = orders.filter(o => o.status !== "delivered")
  const done = orders.filter(o => o.status === "delivered")
  const revenue = orders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)

  if (loading) return <div style={d.center}>Loading orders...</div>

  return (
    <div style={d.page}>
      {/* Top bar */}
      <div style={d.topbar}>
        <button onClick={onBack} style={d.backBtn}>← Back</button>
        <span style={d.brand}>Hotel Dashboard</span>
        <span style={d.live}><span style={d.dot} />Live</span>
      </div>

      {/* Metrics */}
      <div style={d.metrics}>
        <div style={d.metric}><p style={d.metricVal}>{orders.length}</p><p style={d.metricLabel}>Orders today</p></div>
        <div style={d.metric}><p style={d.metricVal}>{active.length}</p><p style={d.metricLabel}>Active now</p></div>
        <div style={d.metric}><p style={d.metricVal}>₹{(revenue/1000).toFixed(1)}k</p><p style={d.metricLabel}>Revenue</p></div>
      </div>

      <div style={d.body}>
        {/* Active orders */}
        {active.length > 0 && (
          <>
            <p style={d.sectionLabel}>Active Orders</p>
            {active.map(order => {
              const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
              const mins = Math.floor((Date.now() - new Date(order.created_at)) / 60000)
              return (
                <div key={order.id} style={d.card}>
                  <div style={d.cardHeader}>
                    <span style={d.room}>Room {order.room_id}</span>
                    <span style={order.status === "pending" ? d.badgePending : d.badgePrep}>
                      {order.status === "pending" ? "Pending" : "Preparing"}
                    </span>
                  </div>
                  <div style={d.items}>
                    {order.order_items.map((item, i) => (
                      <div key={i} style={d.itemRow}>
                        <span>{item.menu_items?.name} x{item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div style={d.totalRow}><span>Total</span><span>₹{orderTotal}</span></div>
                  <div style={d.actions}>
                    {order.status === "pending" && (
                      <button style={d.btnPrepare} onClick={() => updateStatus(order.id, "preparing")}>Mark as Preparing</button>
                    )}
                    {order.status === "preparing" && (
                      <button style={d.btnDeliver} onClick={() => updateStatus(order.id, "delivered")}>Mark as Delivered</button>
                    )}
                    <span style={d.timeAgo}>{mins < 1 ? "Just now" : `${mins} min ago`}</span>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {active.length === 0 && <p style={d.empty}>No active orders. Waiting...</p>}

        {/* Delivered */}
        {done.length > 0 && (
          <>
            <p style={d.sectionLabel}>Delivered</p>
            {done.map(order => {
              const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
              return (
                <div key={order.id} style={{ ...d.card, opacity: 0.5 }}>
                  <div style={d.cardHeader}>
                    <span style={d.room}>Room {order.room_id}</span>
                    <span style={d.badgeDone}>✓ Delivered</span>
                  </div>
                  <div style={d.totalRow}><span>Total</span><span>₹{orderTotal}</span></div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

const d = {
  page: { background: "#f4f6f9", minHeight: "100vh", fontFamily: "-apple-system, sans-serif" },
  center: { textAlign: "center", marginTop: 100, color: "#333" },
  topbar: { background: "#1c2b3a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  backBtn: { background: "none", border: "none", color: "#7eb3f5", fontSize: 13, cursor: "pointer", padding: 0 },
  brand: { color: "#e8f0f8", fontSize: 15, fontWeight: 500 },
  live: { display: "flex", alignItems: "center", gap: 5, color: "#6fcf97", fontSize: 12 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#6fcf97", display: "inline-block" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: 14 },
  metric: { background: "#fff", borderRadius: 12, padding: "12px 10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  metricVal: { fontSize: 20, fontWeight: 600, color: "#1c2b3a", margin: "0 0 3px" },
  metricLabel: { fontSize: 10, color: "#8a9bb0", margin: 0 },
  body: { padding: "0 14px 40px" },
  sectionLabel: { fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8a9bb0", fontWeight: 500, margin: "16px 0 8px" },
  card: { background: "#fff", borderRadius: 14, padding: "14px", marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  room: { fontSize: 14, fontWeight: 600, color: "#1c2b3a" },
  badgePending: { background: "#fff3e0", color: "#b45309", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgePrep: { background: "#e0f2fe", color: "#0369a1", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgeDone: { background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  items: { marginBottom: 8 },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 4 },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#1c2b3a", borderTop: "0.5px solid #eee", paddingTop: 8, marginBottom: 10 },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  btnPrepare: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  btnDeliver: { background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  timeAgo: { fontSize: 11, color: "#8a9bb0" },
  empty: { textAlign: "center", color: "#8a9bb0", marginTop: 50, fontSize: 14 },
}