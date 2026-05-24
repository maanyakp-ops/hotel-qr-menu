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
  const [guestInstructions, setGuestInstructions] = useState("")
  const [orderStatus, setOrderStatus] = useState(null)
  const [activeTab, setActiveTab] = useState(null)
  const [, forceUpdate] = useState(0)
  const hasLastOrder = !!localStorage.getItem("lastOrder")
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
    else {
      setMenuItems(data)
      const cats = [...new Set(data.map(i => i.category))]
      if (cats.length > 0) setActiveTab(cats[0])
    }
    setLoading(false)
  }

  async function watchOrderStatus(orderId) {
    try {
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
    } catch (e) {
      console.log("Realtime not available", e)
    }
  }

  async function cancelOrder(orderId) {
    if (!orderId) return
    await supabase.from("orders").update({
      status: "cancelled",
      cancelled_at: new Date().toISOString()
    }).eq("id", orderId)
    setOrderStatus("cancelled")
    localStorage.removeItem("lastOrder")
    forceUpdate(n => n + 1)
  }

  async function placeOrder() {
    if (cart.length === 0) return
    if (!guestName.trim()) { alert("Please enter your name."); return }
    if (!guestPhone.trim()) { alert("Please enter your phone number."); return }

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
        guest_phone: guestPhone,
        special_instructions: guestInstructions || null
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

    const orderData = { ...order, items: cart, prepTime: maxPrepTime }
    setPlacedOrder(orderData)
    setOrderStatus("pending")
    setOrderPlaced(true)
    setShowGuestForm(false)
    setCart([])
    localStorage.setItem("lastOrder", JSON.stringify({ orderId: order.id, items: cart, room: resolvedRoom, prepTime: maxPrepTime }))
    forceUpdate(n => n + 1)
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
      <p style={{ color: "#EDE8DC", fontSize: 16 }}>This menu is currently unavailable.</p>
    </div>
  )

  if (orderPlaced && placedOrder) {
    const orderAge = Date.now() - new Date(placedOrder.created_at).getTime()
    const canCancel = orderAge < 60000 && orderStatus === "pending"

    return (
      <div style={s.confirmation}>
        <div style={s.confirmIcon}>
          {orderStatus === "cancelled" ? "❌" : orderStatus === "rejected" ? "🚫" : "🎉"}
        </div>
        <h2 style={s.confirmTitle}>
          {orderStatus === "cancelled" ? "Order Cancelled" : orderStatus === "rejected" ? "Order Rejected" : "Order Placed!"}
        </h2>
        <p style={s.confirmSub}>
          {orderStatus === "cancelled" ? "Your order has been cancelled." :
           orderStatus === "rejected" ? "Sorry, the hotel couldn't accept your order. Please call reception." :
           `We'll deliver to Room ${resolvedRoom} shortly.`}
        </p>

        {orderStatus !== "cancelled" && orderStatus !== "rejected" && (
          <>
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
            <div style={s.prepTimeBox}>
              <p style={s.prepTimeText}>⏱ Estimated time: {placedOrder.prepTime || maxPrepTime} minutes</p>
            </div>
          </>
        )}

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

        {canCancel && (
          <button style={s.cancelOrderBtn} onClick={() => cancelOrder(placedOrder.id)}>
            Cancel Order
          </button>
        )}

        <button style={s.confirmBtn} onClick={() => {
          setOrderPlaced(false)
          setPlacedOrder(null)
        }}>
          Back to Menu
        </button>
      </div>
    )
  }

  return (
    <div style={s.page}>
      {/* Guest form modal */}
      {showGuestForm && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>Almost there!</p>
            <p style={s.modalSub}>Enter your details to place the order</p>
            <input style={s.modalInput} placeholder="Your name *" value={guestName} onChange={e => setGuestName(e.target.value)} />
            <input style={s.modalInput} placeholder="Phone number *" type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
            <textarea style={{ ...s.modalInput, height: 80, resize: "none" }} placeholder="Special instructions — e.g. less spicy, no onion" value={guestInstructions} onChange={e => setGuestInstructions(e.target.value)} />
            <button style={s.modalBtn} onClick={placeOrder}>Confirm Order</button>
            <button style={s.modalCancel} onClick={() => setShowGuestForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Hero header */}
      <div style={s.hero}>
        <div style={s.heroGoldBar} />
        <div style={s.heroBadge}>Room Service</div>
        <h1 style={s.heroTitle}>{hotelInfo?.name || "Hotel"}</h1>
        <p style={s.heroSub}>Room {resolvedRoom} &nbsp;·&nbsp; Available 24/7</p>
        <div style={s.heroOrnament}>✦ &nbsp; ✦ &nbsp; ✦</div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div style={s.tabs}>
          {categories.map(cat => (
            <button
              key={cat}
              style={activeTab === cat ? s.tabActive : s.tab}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu items */}
      <div style={s.body}>
        {menuItems.length === 0 && (
          <div style={s.emptyState}>
            <p style={s.emptyIcon}>🍽️</p>
            <p style={s.emptyTitle}>Menu coming soon</p>
            <p style={s.emptyText}>We're still setting up our menu. Please check back shortly or call reception.</p>
          </div>
        )}

        {menuItems.filter(i => i.category === activeTab).map(item => {
          const cartItem = cart.find(i => i.id === item.id)
          return (
            <div key={item.id} style={s.menuItem}>
              <div style={s.itemLeft}>
                <div style={s.itemName}>{item.name}</div>
                {item.description && <div style={s.itemDesc}>{item.description}</div>}
                <div style={s.itemMeta}>⏱ {item.prep_time || 15} min</div>
              </div>
              <div style={s.itemRight}>
                <div style={s.itemPrice}>₹ {item.price}</div>
                {item.out_of_stock ? (
                  <span style={s.outOfStock}>Out of Stock</span>
                ) : cartItem ? (
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

      {/* Footer */}
      <div style={s.menuFooter}>
        {hasLastOrder && (
          <button style={s.viewOrderBtn} onClick={async () => {
            const last = JSON.parse(localStorage.getItem("lastOrder"))
            const { data } = await supabase.from("orders").select("status").eq("id", last.orderId).single()
            setPlacedOrder({ items: last.items, room_id: last.room, prepTime: last.prepTime })
            setOrderStatus(data?.status || "pending")
            setOrderPlaced(true)
            watchOrderStatus(last.orderId)
          }}>View My Last Order</button>
        )}
        <a href="/auth" style={s.staffLink}>Staff Login</a>
        <p style={s.footerNote}>All prices inclusive of taxes · Please inform staff of any allergies</p>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div style={s.cartBar}>
          <div>
            <p style={s.cartCount}>{cart.reduce((s, i) => s + i.qty, 0)} items · ⏱ ~{maxPrepTime} min</p>
            <p style={s.cartTotal}>₹ {total}</p>
          </div>
          <button style={s.placeBtn} onClick={() => setShowGuestForm(true)}>Place Order</button>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { background: "#0D0C0A", minHeight: "100vh", maxWidth: 680, margin: "0 auto", fontFamily: "'Jost', sans-serif", fontWeight: 300, paddingBottom: 100 },
  center: { color: "#EDE8DC", textAlign: "center", marginTop: 100, fontSize: 16, background: "#0D0C0A", minHeight: "100vh", fontFamily: "'Jost', sans-serif" },

  // Hero
  hero: { background: "#141310", borderBottom: "1px solid #2E2B22", padding: "2.5rem 2rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" },
  heroGoldBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" },
  heroBadge: { display: "inline-block", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#C9A84C", border: "1px solid #7A6230", padding: "4px 16px", marginBottom: "1rem", fontFamily: "'Jost', sans-serif" },
  heroTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, letterSpacing: 2, color: "#EDE8DC", lineHeight: 1.1, margin: "0 0 0.5rem" },
  heroSub: { fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#9A927E", margin: 0 },
  heroOrnament: { color: "#7A6230", fontSize: 16, letterSpacing: 8, marginTop: "1rem", opacity: 0.6 },

  // Tabs
  tabs: { display: "flex", overflowX: "auto", background: "#141310", borderBottom: "1px solid #2E2B22", padding: "0 1rem", scrollbarWidth: "none", position: "sticky", top: 0, zIndex: 10 },
  tab: { background: "none", border: "none", color: "#9A927E", fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", padding: "1rem 1.2rem", cursor: "pointer", whiteSpace: "nowrap", borderBottom: "2px solid transparent" },
  tabActive: { background: "none", border: "none", color: "#C9A84C", fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", padding: "1rem 1.2rem", cursor: "pointer", whiteSpace: "nowrap", borderBottom: "2px solid #C9A84C" },

  // Menu items
  body: { padding: "0 0 1rem" },
  menuItem: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1.1rem 2rem", borderBottom: "1px solid #2E2B22", gap: "1rem" },
  itemLeft: { flex: 1 },
  itemName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 400, color: "#EDE8DC", marginBottom: 3 },
  itemDesc: { fontSize: 12, color: "#9A927E", lineHeight: 1.6, maxWidth: 340, marginBottom: 4 },
  itemMeta: { fontSize: 11, color: "#7A6230" },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 80 },
  itemPrice: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: "#C9A84C", whiteSpace: "nowrap" },
  addBtn: { background: "none", border: "1px solid #7A6230", color: "#C9A84C", borderRadius: 2, padding: "4px 12px", fontSize: 11, letterSpacing: 1, cursor: "pointer", fontFamily: "'Jost', sans-serif", whiteSpace: "nowrap" },
  qtyRow: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: { background: "none", border: "1px solid #2E2B22", color: "#C9A84C", borderRadius: 2, width: 26, height: 26, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyNum: { color: "#EDE8DC", fontSize: 14, fontWeight: 400, minWidth: 16, textAlign: "center" },
  outOfStock: { color: "#9A927E", fontSize: 11, fontStyle: "italic" },

  // Empty state
  emptyState: { textAlign: "center", padding: "60px 24px" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: "#EDE8DC", fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, margin: "0 0 8px" },
  emptyText: { color: "#9A927E", fontSize: 13, lineHeight: 1.6, margin: 0 },

  // Footer
  menuFooter: { textAlign: "center", padding: "2rem 2rem 1rem", borderTop: "1px solid #2E2B22" },
  footerNote: { fontSize: 11, color: "#7A6230", marginTop: 16, lineHeight: 1.8 },
  staffLink: { color: "#2E2B22", fontSize: 11, textDecoration: "none", display: "block", marginBottom: 8 },
  viewOrderBtn: { background: "none", border: "1px solid #2E2B22", color: "#9A927E", borderRadius: 2, padding: "6px 16px", fontSize: 11, cursor: "pointer", marginBottom: 12, letterSpacing: 1, fontFamily: "'Jost', sans-serif" },

  // Cart bar
  cartBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680, background: "#141310", borderTop: "1px solid #2E2B22", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" },
  cartCount: { color: "#9A927E", fontSize: 12, letterSpacing: 1, margin: "0 0 2px", fontFamily: "'Jost', sans-serif" },
  cartTotal: { color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", fontSize: 20, margin: 0 },
  placeBtn: { background: "#C9A84C", color: "#0D0C0A", border: "none", borderRadius: 2, padding: "10px 24px", fontSize: 12, fontWeight: 500, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Jost', sans-serif" },

  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 },
  modal: { background: "#141310", borderTop: "1px solid #2E2B22", padding: "28px 24px 40px", width: "100%", maxWidth: 680 },
  modalTitle: { color: "#EDE8DC", fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, margin: "0 0 4px" },
  modalSub: { color: "#9A927E", fontSize: 12, letterSpacing: 1, margin: "0 0 20px" },
  modalInput: { width: "100%", background: "#1C1A16", border: "1px solid #2E2B22", borderRadius: 0, padding: "12px 14px", color: "#EDE8DC", fontSize: 13, marginBottom: 10, boxSizing: "border-box", outline: "none", fontFamily: "'Jost', sans-serif" },
  modalBtn: { width: "100%", background: "#C9A84C", color: "#0D0C0A", border: "none", padding: "13px", fontSize: 12, fontWeight: 500, cursor: "pointer", marginBottom: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Jost', sans-serif" },
  modalCancel: { width: "100%", background: "none", color: "#9A927E", border: "none", padding: "10px", fontSize: 12, cursor: "pointer", letterSpacing: 1, fontFamily: "'Jost', sans-serif" },

  // Confirmation
  confirmation: { background: "#0D0C0A", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Jost', sans-serif", padding: 24 },
  confirmIcon: { fontSize: 64, marginBottom: 20 },
  confirmTitle: { color: "#EDE8DC", fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, margin: "0 0 10px" },
  confirmSub: { color: "#9A927E", fontSize: 13, letterSpacing: 1, margin: "0 0 24px", textAlign: "center" },
  statusContainer: { display: "flex", alignItems: "center", width: "100%", maxWidth: 320, marginBottom: 24, padding: "0 8px" },
  statusStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  statusDotActive: { width: 12, height: 12, borderRadius: "50%", background: "#C9A84C" },
  statusDotInactive: { width: 12, height: 12, borderRadius: "50%", background: "#2E2B22", border: "1px solid #3E3B32" },
  statusDotDone: { width: 12, height: 12, borderRadius: "50%", background: "#6DB96D" },
  statusLine: { flex: 1, height: 1, background: "#2E2B22", marginBottom: 18 },
  statusLineActive: { flex: 1, height: 1, background: "#C9A84C", marginBottom: 18 },
  statusLabel: { fontSize: 10, color: "#9A927E", margin: 0, whiteSpace: "nowrap", letterSpacing: 1 },
  prepTimeBox: { border: "1px solid #2E2B22", padding: "10px 24px", marginBottom: 24 },
  prepTimeText: { color: "#C9A84C", fontSize: 12, letterSpacing: 1, margin: 0, fontFamily: "'Jost', sans-serif" },
  orderSummary: { border: "1px solid #2E2B22", padding: 20, width: "100%", maxWidth: 360, marginBottom: 24 },
  summaryTitle: { color: "#9A927E", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px" },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  summaryItem: { color: "#EDE8DC", fontFamily: "'Cormorant Garamond', serif", fontSize: 15 },
  summaryPrice: { color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", fontSize: 15 },
  summaryTotal: { display: "flex", justifyContent: "space-between", borderTop: "1px solid #2E2B22", paddingTop: 12, marginTop: 8, color: "#EDE8DC", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 },
  confirmBtn: { background: "#C9A84C", color: "#0D0C0A", border: "none", padding: "12px 32px", fontSize: 11, fontWeight: 500, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Jost', sans-serif" },
  cancelOrderBtn: { background: "none", border: "1px solid #8B2020", color: "#E07070", padding: "10px 28px", fontSize: 11, cursor: "pointer", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Jost', sans-serif" },
}

export default App