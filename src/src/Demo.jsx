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
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `hotel_id=eq.${DEMO_HOTEL_ID}`
      }, (payload) => {
        if (payload.new.status === "hold") return
        fetchOrders()
        setNewOrderFlash(true)
        setTimeout(() => setNewOrderFlash(false), 2000)
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `hotel_id=eq.${DEMO_HOTEL_ID}`
      }, (payload) => {
        if (payload.new.status === "hold") return
        fetchOrders()
        if (payload.new.status === "pending") {
          setNewOrderFlash(true)
          setTimeout(() => setNewOrderFlash(false), 2000)
        }
      })
      .subscribe()

    const interval = setInterval(fetchOrders, 5000)

    return () => {
      supabase.removeChannel(sub)
      clearInterval(interval)
    }
  }, [])

  async function fetchOrders() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from("orders")
      .select(`*, order_items(quantity, price, menu_items(name))`)
      .eq("hotel_id", DEMO_HOTEL_ID)
      .neq("status", "hold")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .limit(20)
    if (data) setOrders(data)
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const updates = { status }
    if (status === "delivered") updates.delivered_at = new Date().toISOString()
    await supabase.from("orders").update(updates).eq("id", id)
    fetchOrders()
  }

  const active = orders.filter(o => !["delivered", "cancelled", "rejected"].includes(o.status))
  const done = orders.filter(o => o.status === "delivered")

  return (
    <div style={d.page}>
      {/* Header */}
      <div style={d.header}>
        <a href="/" style={d.backLink}>← Back</a>
        <div style={d.headerCenter}>
          <span style={d.logo}>Hotel<span style={d.logoPlus}>+</span></span>
          <span style={d.demoBadge}>Live Demo</span>
        </div>
        <div style={d.liveIndicator}>
          <span style={{ ...d.liveDot, background: newOrderFlash ? "#f5a623" : "#6fcf97", transition: "background 0.3s" }} />
          <span style={d.liveText}>{newOrderFlash ? "New Order!" : "Live"}</span>
        </div>
      </div>

      <div style={d.hint}>
        <span>👈 Place an order from the guest menu</span>
        <span style={d.hintArrow}>→</span>
        <span>It appears here on the dashboard in real-time 👉</span>
      </div>

      {/* Two panel layout */}
      <div style={d.panels}>

        {/* LEFT — Guest menu */}
        <div style={d.leftPanel}>
          <div style={d.panelLabel}>
            <span style={d.panelDot} />
            Guest View · Room 101
          </div>
          <div style={d.iframeWrap}>
            <iframe
              src={`/menu/${DEMO_HOTEL_ID}/101`}
              style={d.iframe}
              title="Guest Menu Demo"
            />
          </div>
        </div>

        {/* RIGHT — Dashboard */}
        <div style={d.rightPanel}>
          <div style={d.panelLabel}>
            <span style={{ ...d.panelDot, background: "#7eb3f5" }} />
            Staff Dashboard · Live Orders
          </div>

          <div style={d.dashboardPanel}>
            {/* Metrics */}
            <div style={d.metrics}>
              <div style={d.metric}>
                <div style={d.metricVal}>{orders.length}</div>
                <div style={d.metricLabel}>Today</div>
              </div>
              <div style={d.metric}>
                <div style={d.metricVal}>{active.length}</div>
                <div style={d.metricLabel}>Active</div>
              </div>
              <div style={d.metric}>
                <div style={d.metricVal}>
                  ₹{(orders.filter(o => !["cancelled","rejected"].includes(o.status))
                    .reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0) / 1000).toFixed(1)}k
                </div>
                <div style={d.metricLabel}>Revenue</div>
              </div>
            </div>

            {/* Active orders */}
            <div style={d.sectionLabel}>
              {active.length > 0 ? `Active Orders (${active.length})` : "Active Orders"}
            </div>

            {loading && <p style={d.empty}>Loading...</p>}
            {!loading && active.length === 0 && (
              <div style={d.emptyState}>
                <div style={d.emptyIcon}>🛎️</div>
                <p style={d.emptyText}>No active orders yet.</p>
                <p style={d.emptyHint}>Place an order from the guest menu on the left — it'll appear here instantly.</p>
              </div>
            )}

            {active.map(order => {
              const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
              const mins = Math.floor((Date.now() - new Date(order.created_at)) / 60000)
              return (
                <div key={order.id} style={{ ...d.orderCard, animation: "slideIn 0.3s ease" }}>
                  <div style={d.cardTop}>
                    <div>
                      <div style={d.roomChip}>🚪 Room {order.room_id}</div>
                      {order.guest_name && (
                        <div style={d.guestInfo}>👤 {order.guest_name}{order.guest_phone ? ` · ${order.guest_phone}` : ""}</div>
                      )}
                      <div style={d.timeAgo}>🕐 {mins < 1 ? "Just now" : `${mins} min ago`}</div>
                    </div>
                    <span style={
                      order.status === "pending" ? d.badgePending :
                      order.status === "on_the_way" ? d.badgeOnWay : d.badgePrep
                    }>
                      {order.status === "pending" ? "Pending" : order.status === "on_the_way" ? "On the Way" : "Preparing"}
                    </span>
                  </div>

                  <div style={d.itemsList}>
                    {order.order_items.map((item, i) => (
                      <div key={i} style={d.itemRow}>
                        <span>{item.menu_items?.name} x{item.quantity}</span>
                        <span style={{ fontWeight: 500, color: "#1c2b3a" }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.special_instructions && (
                    <div style={d.specialNote}>📝 {order.special_instructions}</div>
                  )}

                  <div style={d.cardBottom}>
                    <span style={d.total}><span style={d.totalLabel}>Total</span> ₹{orderTotal}</span>
                    <div style={d.actions}>
                      {order.status === "pending" && (
                        <button style={d.btnPrepare} onClick={() => updateStatus(order.id, "preparing")}>
                          👨‍🍳 Preparing
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button style={d.btnOnWay} onClick={() => updateStatus(order.id, "on_the_way")}>
                          🛵 On the Way
                        </button>
                      )}
                      {order.status === "on_the_way" && (
                        <button style={d.btnDeliver} onClick={() => updateStatus(order.id, "delivered")}>
                          ✓ Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Delivered */}
            {done.length > 0 && (
              <>
                <div style={d.sectionLabel}>Delivered ({done.length})</div>
                {done.map(order => {
                  const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
                  return (
                    <div key={order.id} style={{ ...d.orderCard, opacity: 0.5 }}>
                      <div style={d.cardTop}>
                        <div style={d.roomChip}>🚪 Room {order.room_id}</div>
                        <span style={d.badgeDone}>✓ Delivered</span>
                      </div>
                      <div style={d.cardBottom}>
                        <span style={d.total}><span style={d.totalLabel}>Total</span> ₹{orderTotal}</span>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .demo-panels { flex-direction: column !important; }
          .demo-iframe-wrap { height: 500px !important; }
        }
      `}</style>
    </div>
  )
}

const d = {
  page: { minHeight: "100vh", background: "#0D0C0A", fontFamily: "'Jost', -apple-system, sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #1E1C18", background: "rgba(13,12,10,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
  backLink: { color: "#9A927E", fontSize: 13, textDecoration: "none" },
  headerCenter: { display: "flex", alignItems: "center", gap: 10 },
  logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#EDE8DC", fontWeight: 300, letterSpacing: 1 },
  logoPlus: { color: "#C9A84C" },
  demoBadge: { background: "#C9A84C22", color: "#C9A84C", border: "1px solid #C9A84C44", borderRadius: 20, padding: "3px 10px", fontSize: 11, letterSpacing: 1 },
  liveIndicator: { display: "flex", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  liveText: { fontSize: 12, color: "#6fcf97", fontWeight: 500 },
  hint: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "10px 24px", background: "#141310", borderBottom: "1px solid #1E1C18", fontSize: 12, color: "#9A927E" },
  hintArrow: { color: "#C9A84C", fontSize: 16 },
  panels: { display: "flex", gap: 0, height: "calc(100vh - 90px)" },
  leftPanel: { flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #1E1C18" },
  rightPanel: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  panelLabel: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#141310", borderBottom: "1px solid #1E1C18", fontSize: 11, color: "#9A927E", letterSpacing: 1, flexShrink: 0 },
  panelDot: { width: 8, height: 8, borderRadius: "50%", background: "#6fcf97", display: "inline-block" },
  iframeWrap: { flex: 1, overflow: "hidden" },
  iframe: { width: "100%", height: "100%", border: "none", background: "#0D0C0A" },
  dashboardPanel: { flex: 1, overflowY: "auto", padding: "14px", background: "#f4f6f9" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 },
  metric: { background: "#fff", borderRadius: 10, padding: "12px 10px", textAlign: "center", border: "0.5px solid #e2e8f0" },
  metricVal: { fontSize: 20, fontWeight: 600, color: "#1c2b3a", marginBottom: 2 },
  metricLabel: { fontSize: 10, color: "#8a9bb0" },
  sectionLabel: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a9bb0", fontWeight: 500, margin: "8px 0 10px" },
  emptyState: { textAlign: "center", padding: "40px 20px" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#1c2b3a", fontWeight: 500, margin: "0 0 8px" },
  emptyHint: { fontSize: 12, color: "#8a9bb0", lineHeight: 1.6, margin: 0 },
  empty: { textAlign: "center", color: "#8a9bb0", padding: 20 },
  orderCard: { background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 8, border: "0.5px solid #e2e8f0" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  roomChip: { display: "inline-flex", alignItems: "center", gap: 4, background: "#f4f6f9", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500, color: "#1c2b3a" },
  guestInfo: { fontSize: 11, color: "#8a9bb0", margin: "5px 0 2px" },
  timeAgo: { fontSize: 10, color: "#8a9bb0" },
  itemsList: { borderTop: "0.5px solid #e2e8f0", borderBottom: "0.5px solid #e2e8f0", padding: "8px 0", margin: "8px 0", display: "flex", flexDirection: "column", gap: 4 },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8a9bb0" },
  specialNote: { background: "#f4f6f9", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#8a9bb0", marginBottom: 8 },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  total: { fontSize: 15, fontWeight: 500, color: "#1c2b3a" },
  totalLabel: { fontSize: 11, color: "#8a9bb0", fontWeight: 400, marginRight: 4 },
  actions: { display: "flex", gap: 6 },
  btnPrepare: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  btnOnWay: { background: "#ede7f6", color: "#5e35b1", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  btnDeliver: { background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  badgePending: { background: "#fff3e0", color: "#b45309", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgePrep: { background: "#e0f2fe", color: "#0369a1", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgeOnWay: { background: "#ede7f6", color: "#5e35b1", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgeDone: { background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
}