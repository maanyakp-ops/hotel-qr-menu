import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "./supabase"
import Dashboard from "./Dashboard"
import Auth from "./Auth"

function App() {
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("menu")
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [hotelInfo, setHotelInfo] = useState(null)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [orderStatus, setOrderStatus] = useState(null)
  const lastOrderTime = useRef(0)

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

  async function watchOrderStatus(orderId) {
    const sub = supabase.channel("order-status-" + orderId)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`
      }, payload => {
        setOrderStatus(payload.new.status)
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }

  async function placeOrder() {
    if (cart.length === 0) return
    if (!guestName.trim()) { alert("Please enter your name."); return }

    const now = Date.now()
    if (now - lastOrderTime.current < 30000) {
      alert("Please wait 30 seconds before placing another order.")
      return
    }
    lastOrderTime.current = now

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        hotel_id: resolvedHotelId,
        room_id: resolvedRoom,
        status: "pending",
        payment_method: "cash",
        guest_name: guestName,
        guest_phone: guestPhone
      })
      .select().single()
    if (orderError) { console.error(orderError); alert("Something went wrong."); return }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.qty,
        price: item.price
      })))
    if (itemsError) { console.error(itemsError); return }

    const orderData = { ...order, items: cart }
    setPlacedOrder(orderData)
    setOrderStatus("pending")
    setOrderPlaced(true)
    setShowGuestForm(false)
    setCart([])
    localStorage.setItem("lastOrder", JSON.stringify({ orderId: order.id, items: cart, room: resolvedRoom, prepTime: maxPrepTime }))
watchOrderStatus(order.id)
  }

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function removeFromCart(item) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing.qty === 1) return prev.filter(i => i.id !== item.id)
      return prev.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i)
    })
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const categories = [...new Set(menuItems.map(i => i.category))]
  const maxPrepTime = cart.length > 0 ? Math.max(...cart.map(i => i.prep_time || 15)) : 15

  if (!authChecked) return <div style={s.center}>Loading...</div>

  if (view === "dashboard") {
    if (!session) return <Auth onLogin={() => setView("dashboard")} />
    return <Dashboard onBack={() => setView("menu")} />
  }

  if (loading) return <div style={s.center}>Loading menu...</div>

  if (hotelInfo?.status === "disabled") return (
    <div style={s.center}>
      <p style={{ fontSize: 40, marginBottom: 16 }}>🚫</p>
      <p style={{ color: "#f2f2f2", fontSize: 16 }}>This menu is currently unavailable.</p>
    </div>
  )

  if (orderPlaced && placedOrder) return (
    <div style={s.confirmation}>
      <div style={s.confirmIcon}>🎉</div>
      <h2 style={s.confirmTitle}>Order Placed!</h2>
      <p style={s.confirmSub}>We'll deliver to Room {resolvedRoom} shortly.</p>

      {/* Status */}
      <div style={s.statusContainer}>
  <div style={s.statusStep}>
    <div style={s.statusDotActive} />
    <p style={s.statusLabel}>Received</p>
  </div>
  <div style={orderStatus === "preparing" || orderStatus === "delivered" ? s.statusLineActive : s.statusLine} />
  <div style={s.statusStep}>
    <div style={orderStatus === "preparing" || orderStatus === "delivered" ? s.statusDotActive : s.statusDotInactive} />
    <p style={s.statusLabel}>Preparing</p>
  </div>
  <div style={orderStatus === "delivered" ? s.statusLineActive : s.statusLine} />
  <div style={s.statusStep}>
    <div style={orderStatus === "delivered" ? s.statusDotDone : s.statusDotInactive} />
    <p style={s.statusLabel}>Delivered</p>
  </div>
</div>

      {/* Prep time */}
      <div style={s.prepTimeBox}>
        <p style={s.prepTimeText}>⏱ Estimated time: {maxPrepTime} minutes</p>
      </div>

      {/* Order summary */}
      <div style={s.orderSummary}>
        <p style={s.summaryTitle}>Your Order</p>
        {placedOrder.items.map((item, i) => (
          <div key={i} style={s.summaryRow}>
            <span style={s.summaryItem}>{item.name} x{item.qty}</span>
            <span style={s.summaryPrice}>₹{item.price * item.qty}</span>
          </div>
        ))}
        <div style={s.summaryTotal}>
          <span>Total</span>
          <span>₹{placedOrder.items.reduce((sum, i) => sum + i.price * i.qty, 0)}</span>
        </div>
      </div>

      <button style={s.confirmBtn} onClick={() => { setOrderPlaced(false); setPlacedOrder(null) }}>
        Back to Menu
      </button>
    </div>
  )

  return (
    <div style={s.page}>
      {/* Guest form modal */}
      {showGuestForm && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>Almost there!</p>
            <p style={s.modalSub}>Enter your details to place the order</p>
            <input
              style={s.modalInput}
              placeholder="Your name *"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
            />
            <input
              style={s.modalInput}
              placeholder="Phone number (optional)"
              type="tel"
              value={guestPhone}
              onChange={e => setGuestPhone(e.target.value)}
            />
            <button style={s.modalBtn} onClick={placeOrder}>Confirm Order</button>
            <button style={s.modalCancel} onClick={() => setShowGuestForm(false)}>Cancel</button>
          </div>
        </div>
      )}

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
              {menuItems.filter(i => i.category === cat).map(item => {
                const cartItem = cart.find(i => i.id === item.id)
                return (
                  <div key={item.id} style={s.card}>
                    {item.photo_url
                      ? <img src={item.photo_url} alt={item.name} style={s.cardImg} />
                      : <div style={s.cardImgPlaceholder}>🍽️</div>
                    }
                    <div style={s.cardBody}>
                      <p style={s.itemName}>{item.name}</p>
                      <p style={s.itemPrep}>⏱ {item.prep_time || 15} min</p>
                      <p style={s.itemPrice}>₹{item.price}</p>
                      {cartItem ? (
                        <div style={s.qtyRow}>
                          <button style={s.qtyBtn} onClick={() => removeFromCart(item)}>−</button>
                          <span style={s.qtyNum}>{cartItem.qty}</span>
                          <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
                        </div>
                      ) : (
                        <button style={s.addBtn} onClick={() => addToCart(item)}>+ Add</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Staff login */}
      <div style={s.staffAccess}>
        {localStorage.getItem("lastOrder") && (
          <button style={s.viewOrderBtn} onClick={() => {
            const last = JSON.parse(localStorage.getItem("lastOrder"))
            setPlacedOrder({ items: last.items, room_id: last.room })
            setOrderStatus(null)
            setOrderPlaced(true)
            watchOrderStatus(last.orderId)
          }}>View My Last Order</button>
        )}
        <a href="/auth" style={s.staffLink}>Staff Login</a>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div style={s.cartBar}>
          <div>
            <p style={s.cartCount}>{cart.reduce((s, i) => s + i.qty, 0)} items · ⏱ ~{maxPrepTime} min</p>
            <p style={s.cartTotal}>₹{total} total</p>
          </div>
          <button style={s.placeBtn} onClick={() => setShowGuestForm(true)}>Place Order</button>
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
  body: { padding: "8px 16px" },
  catLabel: { color: "#6e6e73", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", margin: "20px 0 10px", fontWeight: 500 },
  grid: { display: "flex", flexDirection: "column", gap: 8 },
  card: { background: "#2c2c2e", borderRadius: 14, display: "flex", overflow: "hidden", border: "0.5px solid #38383a" },
  cardImg: { width: 90, height: 90, objectFit: "cover", flexShrink: 0 },
  cardImgPlaceholder: { width: 90, height: 90, background: "#3a3a3c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 },
  cardBody: { padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" },
  itemName: { color: "#f2f2f2", fontSize: 14, fontWeight: 500, margin: "0 0 2px" },
  itemPrep: { color: "#6e6e73", fontSize: 11, margin: "0 0 4px" },
  itemPrice: { color: "#b8924a", fontSize: 13, fontWeight: 500, margin: "0 0 10px" },
  addBtn: { alignSelf: "flex-start", background: "#b8924a", color: "#fff", border: "none", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  qtyRow: { display: "flex", alignItems: "center", gap: 10 },
  qtyBtn: { background: "#3a3a3c", color: "#f2f2f2", border: "none", borderRadius: 6, width: 28, height: 28, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyNum: { color: "#f2f2f2", fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" },
  empty: { color: "#6e6e73", textAlign: "center", marginTop: 60 },
  staffAccess: { position: "fixed", bottom: 12, left: 0, right: 0, textAlign: "center", zIndex: 10 },
  staffLink: { color: "#3a3a3c", fontSize: 11, textDecoration: "none" },
  cartBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#2c2c2e", borderTop: "0.5px solid #38383a", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" },
  cartCount: { color: "#f2f2f2", fontSize: 13, fontWeight: 500, margin: "0 0 2px" },
  cartTotal: { color: "#6e6e73", fontSize: 11, margin: 0 },
  placeBtn: { background: "#b8924a", color: "#fff", border: "none", borderRadius: 12, padding: "10px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 },
  modal: { background: "#2c2c2e", borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480 },
  modalTitle: { color: "#f2f2f2", fontSize: 18, fontWeight: 600, margin: "0 0 4px" },
  modalSub: { color: "#6e6e73", fontSize: 13, margin: "0 0 20px" },
  modalInput: { width: "100%", background: "#3a3a3c", border: "0.5px solid #48484a", borderRadius: 10, padding: "12px 14px", color: "#f2f2f2", fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" },
  modalBtn: { width: "100%", background: "#b8924a", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 500, cursor: "pointer", marginBottom: 10 },
  modalCancel: { width: "100%", background: "none", color: "#6e6e73", border: "none", borderRadius: 12, padding: "10px", fontSize: 14, cursor: "pointer" },
  confirmation: { background: "#1c1c1e", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif", padding: 24 },
  confirmIcon: { fontSize: 64, marginBottom: 20 },
  confirmTitle: { color: "#f2f2f2", fontSize: 26, fontWeight: 600, margin: "0 0 10px" },
  confirmSub: { color: "#8a9bb0", fontSize: 15, margin: "0 0 24px", textAlign: "center" },
  statusContainer: { display: "flex", alignItems: "center", width: "100%", maxWidth: 320, marginBottom: 24, padding: "0 8px" },
  statusStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  statusDotActive: { width: 14, height: 14, borderRadius: "50%", background: "#b8924a", boxShadow: "0 0 0 3px rgba(184,146,74,0.2)" },
  statusDotInactive: { width: 14, height: 14, borderRadius: "50%", background: "#3a3a3c", border: "1.5px solid #48484a" },
  statusDotDone: { width: 14, height: 14, borderRadius: "50%", background: "#6fcf97", boxShadow: "0 0 0 3px rgba(111,207,151,0.2)" },
  statusLine: { flex: 1, height: 1.5, background: "#3a3a3c", marginBottom: 20 },
  statusLineActive: { flex: 1, height: 1.5, background: "#b8924a", marginBottom: 20 },
  statusLabel: { fontSize: 10, color: "#8a9bb0", margin: 0, whiteSpace: "nowrap" },
  prepTimeBox: { background: "#2c2c2e", borderRadius: 10, padding: "10px 20px", marginBottom: 20 },
  prepTimeText: { color: "#b8924a", fontSize: 13, fontWeight: 500, margin: 0 },
  orderSummary: { background: "#2c2c2e", borderRadius: 14, padding: 16, width: "100%", maxWidth: 340, marginBottom: 24 },
  summaryTitle: { color: "#f2f2f2", fontSize: 13, fontWeight: 600, margin: "0 0 12px" },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  summaryItem: { color: "#8a9bb0", fontSize: 13 },
  summaryPrice: { color: "#f2f2f2", fontSize: 13 },
  summaryTotal: { display: "flex", justifyContent: "space-between", borderTop: "0.5px solid #3a3a3c", paddingTop: 10, marginTop: 8, color: "#f2f2f2", fontSize: 14, fontWeight: 600 },
  confirmBtn: { background: "#b8924a", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 500, cursor: "pointer" },
  viewOrderBtn: { background: "none", border: "0.5px solid #3a3a3c", color: "#8a9bb0", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", marginBottom: 8, display: "block", margin: "0 auto 8px" },
}

export default App