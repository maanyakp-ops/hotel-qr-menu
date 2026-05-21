import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "./supabase"
import Dashboard from "./Dashboard"

function App() {
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("menu")

  const { hotelId, roomNumber } = useParams()
  const resolvedHotelId = hotelId || "00000000-0000-0000-0000-000000000001"
  const resolvedRoom = roomNumber || "101"

  useEffect(() => {
    fetchMenu()
  }, [])

  async function fetchMenu() {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("hotel_id", resolvedHotelId)
      .eq("available", true)

    if (error) console.error(error)
    else setMenuItems(data)
    setLoading(false)
  }

  async function placeOrder() {
    if (cart.length === 0) return

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        hotel_id: resolvedHotelId,
        room_id: resolvedRoom,
        status: "pending",
        payment_method: "cash"
      })
      .select()
      .single()

    if (orderError) {
      console.error(orderError)
      alert("Something went wrong. Try again.")
      return
    }

    const orderItems = cart.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.qty,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error(itemsError)
      return
    }

    alert("Order placed! We'll deliver to your room shortly.")
    setCart([])
  }

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  if (view === "dashboard") return <Dashboard onBack={() => setView("menu")} />
  if (loading) return <div style={styles.center}>Loading menu...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🍽️ Room Service Menu</h1>
        <button onClick={() => setView("dashboard")} style={styles.switchBtn}>
          Staff Dashboard →
        </button>
      </div>

      <p style={styles.roomTag}>Room {resolvedRoom}</p>

      {menuItems.length === 0 && (
        <p style={styles.empty}>No items on the menu yet.</p>
      )}

      <div style={styles.grid}>
        {menuItems.map(item => (
          <div key={item.id} style={styles.card}>
            {item.photo_url && (
              <img src={item.photo_url} alt={item.name} style={styles.img} />
            )}
            <div style={styles.cardBody}>
              <p style={styles.itemName}>{item.name}</p>
              <p style={styles.category}>{item.category}</p>
              <p style={styles.price}>₹{item.price}</p>
              <button style={styles.btn} onClick={() => addToCart(item)}>
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={styles.cart}>
          <h2 style={styles.cartTitle}>Your Order</h2>
          {cart.map(i => (
            <div key={i.id} style={styles.cartRow}>
              <span>{i.name} x{i.qty}</span>
              <span>₹{i.price * i.qty}</span>
            </div>
          ))}
          <div style={styles.total}>Total: ₹{total}</div>
          <button style={styles.orderBtn} onClick={placeOrder}>Place Order</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: 480, margin: "0 auto", padding: 16, fontFamily: "sans-serif", background: "#f9f9f9", minHeight: "100vh" },
  center: { textAlign: "center", marginTop: 100, fontSize: 18 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1a1a1a", margin: 0 },
  switchBtn: { background: "none", border: "1px solid #ccc", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 },
  roomTag: { fontSize: 13, color: "#888", marginBottom: 16 },
  empty: { color: "#888", textAlign: "center", marginTop: 40 },
  grid: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex" },
  img: { width: 100, height: 100, objectFit: "cover" },
  cardBody: { padding: 12, flex: 1 },
  itemName: { fontWeight: "bold", fontSize: 15, margin: "0 0 4px" },
  category: { fontSize: 12, color: "#888", margin: "0 0 4px" },
  price: { fontSize: 14, color: "#2a9d5c", fontWeight: "bold", margin: "0 0 8px" },
  btn: { background: "#2a9d5c", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 },
  cart: { marginTop: 24, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  cartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  cartRow: { display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 },
  total: { fontWeight: "bold", fontSize: 15, borderTop: "1px solid #eee", paddingTop: 10, marginTop: 8 },
  orderBtn: { width: "100%", marginTop: 12, background: "#e76f51", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 16, cursor: "pointer", fontWeight: "bold" },
}

export default App