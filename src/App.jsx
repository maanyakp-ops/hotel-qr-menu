import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "./supabase"
import Dashboard from "./Dashboard"
import Auth from "./Auth"


function App() {
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("menu")
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const { hotelId, roomNumber } = useParams()
  const resolvedHotelId = hotelId || "a5b9bed4-9c40-4856-b4ed-371e800beaf0"
  const resolvedRoom = roomNumber || "101"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
    })
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  const [hotelInfo, setHotelInfo] = useState(null)

useEffect(() => { fetchHotelAndMenu() }, [])

async function fetchHotelAndMenu() {
  const { data: hotelData } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", resolvedHotelId)
    .single()
  setHotelInfo(hotelData)

  if (!hotelData || hotelData.status === "disabled") {
    setLoading(false)
    return
  }

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
    const lastOrderTime = useRef(0)

async function placeOrder() {
  if (cart.length === 0) return
  
  const now = Date.now()
  if (now - lastOrderTime.current < 30000) {
    alert("Please wait before placing another order.")
    return
  }
  lastOrderTime.current = now

  // ... rest of placeOrder code
    if (cart.length === 0) return
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ hotel_id: resolvedHotelId, room_id: resolvedRoom, status: "pending", payment_method: "cash" })
      .select().single()
    if (orderError) { console.error(orderError); alert("Something went wrong."); return }
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(cart.map(item => ({ order_id: order.id, menu_item_id: item.id, quantity: item.qty, price: item.price })))
    if (itemsError) { console.error(itemsError); return }
    setOrderPlaced(true)
    setCart([])
    
  }

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const categories = [...new Set(menuItems.map(i => i.category))]

  if (!authChecked) return <div style={s.center}>Loading...</div>

  if (view === "dashboard") {
    if (!session) return <Auth onLogin={() => setView("dashboard")} />
    return <Dashboard onBack={() => setView("menu")} />
  }

  if (loading) return <div style={s.center}>Loading menu...</div>
  if (orderPlaced) return (
    <div style={s.confirmation}>
      <div style={s.confirmIcon}>🎉</div>
      <h2 style={s.confirmTitle}>Order Placed!</h2>
      <p style={s.confirmSub}>We'll deliver to Room {resolvedRoom} shortly.</p>
      <button style={s.confirmBtn} onClick={() => setOrderPlaced(false)}>
        Back to Menu
      </button>
    </div>
  )

  if (hotelInfo?.status === "disabled") return (
    <div style={s.center}>
      <p style={{ fontSize: 40, marginBottom: 16 }}>🚫</p>
      <p style={{ color: "#f2f2f2", fontSize: 16 }}>This menu is currently unavailable.</p>
    </div>
  )

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.eyebrow}>Room Service</p>
          <p style={s.hotelName}>{hotelInfo?.name || "Hotel"}</p>
          <p style={s.roomTag}>Room {resolvedRoom} &nbsp;·&nbsp; Available 24/7</p>
        </div>
      </div>

      {/* Menu */}
      <div style={s.body}>
        {menuItems.length === 0 && <p style={s.empty}>No items on the menu yet.</p>}

        {categories.map(cat => (
          <div key={cat}>
            <p style={s.catLabel}>{cat}</p>
            <div style={s.grid}>
              {menuItems.filter(i => i.category === cat).map(item => (
                <div key={item.id} style={s.card}>
                  {item.photo_url
                    ? <img src={item.photo_url} alt={item.name} style={s.cardImg} />
                    : <div style={s.cardImgPlaceholder}>🍽️</div>
                  }
                  <div style={s.cardBody}>
                    <p style={s.itemName}>{item.name}</p>
                    <p style={s.itemPrice}>₹{item.price}</p>
                    <button style={s.addBtn} onClick={() => addToCart(item)}>+ Add</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div style={s.cartBar}>
          <div>
            <p style={s.cartCount}>{cart.reduce((s, i) => s + i.qty, 0)} items added</p>
            <p style={s.cartTotal}>₹{total} total</p>
          </div>
          <div style={s.staffAccess}>
  <a href="/auth" style={s.staffLink}>Staff Login</a>
</div>
          <button style={s.placeBtn} onClick={placeOrder}>Place Order</button>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { background: "#1c1c1e", minHeight: "100vh", maxWidth: 480, margin: "0 auto", fontFamily: "-apple-system, sans-serif", paddingBottom: 100 },
  center: { color: "#f2f2f2", textAlign: "center", marginTop: 100, fontSize: 16 },
  header: { padding: "28px 20px 18px", borderBottom: "0.5px solid #2e2e30", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: { color: "#b8924a", fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 },
  hotelName: { color: "#f2f2f2", fontSize: 22, fontWeight: 500, margin: "0 0 4px" },
  roomTag: { color: "#6e6e73", fontSize: 12, margin: 0 },
  staffBtn: { background: "none", border: "0.5px solid #3a3a3c", color: "#6e6e73", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" },
  body: { padding: "8px 16px" },
  catLabel: { color: "#6e6e73", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", margin: "20px 0 10px", fontWeight: 500 },
  grid: { display: "flex", flexDirection: "column", gap: 8 },
  card: { background: "#2c2c2e", borderRadius: 14, display: "flex", overflow: "hidden", border: "0.5px solid #38383a" },
  cardImg: { width: 90, height: 90, objectFit: "cover", flexShrink: 0 },
  cardImgPlaceholder: { width: 90, height: 90, background: "#3a3a3c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 },
  cardBody: { padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" },
  itemName: { color: "#f2f2f2", fontSize: 14, fontWeight: 500, margin: "0 0 4px" },
  itemPrice: { color: "#b8924a", fontSize: 13, fontWeight: 500, margin: "0 0 10px" },
  addBtn: { alignSelf: "flex-start", background: "#b8924a", color: "#fff", border: "none", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  empty: { color: "#6e6e73", textAlign: "center", marginTop: 60 },
  cartBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#2c2c2e", borderTop: "0.5px solid #38383a", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" },
  cartCount: { color: "#f2f2f2", fontSize: 13, fontWeight: 500, margin: "0 0 2px" },
  cartTotal: { color: "#6e6e73", fontSize: 11, margin: 0 },
  placeBtn: { background: "#b8924a", color: "#fff", border: "none", borderRadius: 12, padding: "10px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  confirmation: { background: "#1c1c1e", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif", padding: 24 },
confirmIcon: { fontSize: 64, marginBottom: 20 },
confirmTitle: { color: "#f2f2f2", fontSize: 26, fontWeight: 600, margin: "0 0 10px" },
confirmSub: { color: "#8a9bb0", fontSize: 15, margin: "0 0 32px", textAlign: "center" },
confirmBtn: { background: "#b8924a", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 500, cursor: "pointer" },
staffAccess: { textAlign: "center", padding: "20px 0 40px" },
staffLink: { color: "#3a3a3c", fontSize: 11, textDecoration: "none" },
}

export default App