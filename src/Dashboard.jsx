import { useEffect, useState } from "react"
import { supabase } from "./supabase"

const hotelId = "00000000-0000-0000-0000-000000000001"

export default function Dashboard({ onBack }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()

    const subscription = supabase
      .channel("orders-channel")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "orders"
      }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          price,
          menu_items (name)
        )
      `)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })

    if (error) console.error(error)
    else setOrders(data)
    setLoading(false)
  }

  async function updateStatus(orderId, status) {
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
    fetchOrders()
  }

  const statusColor = {
    pending: "#e76f51",
    preparing: "#e9c46a",
    delivered: "#2a9d5c"
  }

  if (loading) return <div style={styles.center}>Loading orders...</div>

  return (
    <div style={styles.container}>
     <button onClick={onBack} style={styles.backBtn}>← Back to Menu</button>
     <h1 style={styles.title}>🏨 Hotel Dashboard</h1>
      <p style={styles.subtitle}>Orders update automatically</p>

      {orders.length === 0 && (
        <p style={styles.empty}>No orders yet. Waiting...</p>
      )}

      {orders.map(order => (
        <div key={order.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.room}>Room {order.room_id.slice(-4)}</span>
            <span style={{
              ...styles.badge,
              background: statusColor[order.status] || "#ccc"
            }}>
              {order.status.toUpperCase()}
            </span>
          </div>

          <div style={styles.items}>
            {order.order_items.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <span>{item.menu_items?.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={styles.total}>
            Total: ₹{order.order_items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
          </div>

          <div style={styles.time}>
            {new Date(order.created_at).toLocaleTimeString()}
          </div>

          <div style={styles.actions}>
            {order.status === "pending" && (
              <button
                style={{ ...styles.btn, background: "#e9c46a", color: "#000" }}
                onClick={() => updateStatus(order.id, "preparing")}
              >
                Mark as Preparing
              </button>
            )}
            {order.status === "preparing" && (
              <button
                style={{ ...styles.btn, background: "#2a9d5c" }}
                onClick={() => updateStatus(order.id, "delivered")}
              >
                Mark as Delivered
              </button>
            )}
            {order.status === "delivered" && (
              <p style={styles.done}>✅ Delivered</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: { maxWidth: 600, margin: "0 auto", padding: 16, fontFamily: "sans-serif", background: "#f0f0f0", minHeight: "100vh" },
  center: { textAlign: "center", marginTop: 100, fontSize: 18 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitle: { color: "#888", fontSize: 13, marginBottom: 20 },
  empty: { textAlign: "center", color: "#888", marginTop: 60 },
  card: { background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  room: { fontWeight: "bold", fontSize: 16 },
  badge: { color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold" },
  items: { borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "10px 0", marginBottom: 10 },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 },
  total: { fontWeight: "bold", fontSize: 15, marginBottom: 4 },
  time: { fontSize: 12, color: "#aaa", marginBottom: 12 },
  actions: { display: "flex", gap: 8 },
  btn: { flex: 1, padding: "10px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", color: "#fff", fontSize: 14 },
  done: { color: "#2a9d5c", fontWeight: "bold", margin: 0 },
backBtn: { background: "none", border: "1px solid #ccc", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginBottom: 12 },
}