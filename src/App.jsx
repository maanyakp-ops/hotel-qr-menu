import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "./supabase"
import Dashboard from "./Dashboard"
import Auth from "./Auth"

const themeConfigs = {
  'dark-gold': {
    pageBg: '#0D0C0A', heroBg: '#141310', heroBorder: '#2E2B22',
    accent: '#C9A84C', accentMuted: '#7A6230',
    textPrimary: '#EDE8DC', textSecondary: '#9A927E',
    tabsBg: '#141310', tabBorder: '#2E2B22',
    titleFont: "'Cormorant Garamond', serif", bodyFont: "'Jost', sans-serif",
    inputBg: '#1C1A16', inputBorder: '#2E2B22', inputColor: '#EDE8DC',
    cartBg: '#141310', cartBorder: '#2E2B22',
    btnBg: '#C9A84C', btnColor: '#0D0C0A',
    addBtnBg: 'none', addBtnBorder: '1px solid #7A6230', addBtnColor: '#C9A84C',
    qtyBtnBorder: '1px solid #2E2B22', qtyBtnColor: '#C9A84C',
    modalBg: '#141310', modalBorder: '#2E2B22',
    heroTitleColor: '#EDE8DC', heroSubColor: '#9A927E',
    itemBorderBottom: '1px solid #2E2B22', itemBg: 'transparent',
    itemRadius: 0, itemShadow: 'none', itemPadding: '1.1rem 2rem', itemMargin: 0,
    nameStyle: 'normal', nameWeight: 400, nameSize: 17,
    priceColor: '#C9A84C', cartTotalColor: '#C9A84C',
    cartCountColor: '#9A927E',
  },
  'cafe-warm': {
    pageBg: '#FAF6F0', heroBg: '#3D2B1F', heroBorder: '#D9C9B0',
    accent: '#3D2B1F', accentMuted: '#C4A882',
    textPrimary: '#3D2B1F', textSecondary: '#9B7D5A',
    tabsBg: '#FAF6F0', tabBorder: '#D9C9B0',
    titleFont: 'Georgia, serif', bodyFont: '-apple-system, sans-serif',
    inputBg: '#F0E8DC', inputBorder: '#D9C9B0', inputColor: '#3D2B1F',
    cartBg: '#3D2B1F', cartBorder: '#D9C9B0',
    btnBg: '#3D2B1F', btnColor: '#F5DEB3',
    addBtnBg: 'none', addBtnBorder: '1px solid #C4A882', addBtnColor: '#3D2B1F',
    qtyBtnBorder: '1px solid #C4A882', qtyBtnColor: '#3D2B1F',
    modalBg: '#FAF6F0', modalBorder: '#D9C9B0',
    heroTitleColor: '#F5DEB3', heroSubColor: 'rgba(245,222,179,0.6)',
    itemBorderBottom: '1px dashed #D9C9B0', itemBg: 'transparent',
    itemRadius: 0, itemShadow: 'none', itemPadding: '1.1rem 2rem', itemMargin: 0,
    nameStyle: 'italic', nameWeight: 400, nameSize: 17,
    priceColor: '#3D2B1F', cartTotalColor: '#F5DEB3',
    cartCountColor: 'rgba(245,222,179,0.6)',
  },
  'royal-emerald': {
    pageBg: '#0E1F18', heroBg: '#0A1912', heroBorder: '#1E3D2A',
    accent: '#B8963E', accentMuted: '#3D6B4A',
    textPrimary: '#E8D5A3', textSecondary: '#6B8F6B',
    tabsBg: '#0E1F18', tabBorder: '#1E3D2A',
    titleFont: 'Georgia, serif', bodyFont: '-apple-system, sans-serif',
    inputBg: '#0A1912', inputBorder: '#1E3D2A', inputColor: '#E8D5A3',
    cartBg: '#0A1912', cartBorder: '#B8963E',
    btnBg: '#B8963E', btnColor: '#0A1912',
    addBtnBg: 'none', addBtnBorder: '1px solid #B8963E', addBtnColor: '#B8963E',
    qtyBtnBorder: '1px solid #1E3D2A', qtyBtnColor: '#B8963E',
    modalBg: '#0A1912', modalBorder: '#1E3D2A',
    heroTitleColor: '#E8D5A3', heroSubColor: '#6B8F6B',
    itemBorderBottom: '1px solid #1A3323', itemBg: 'transparent',
    itemRadius: 0, itemShadow: 'none', itemPadding: '1.1rem 2rem', itemMargin: 0,
    nameStyle: 'normal', nameWeight: 400, nameSize: 17,
    priceColor: '#B8963E', cartTotalColor: '#B8963E',
    cartCountColor: '#6B8F6B',
  },
  'clean-app': {
    pageBg: '#F5F5F5', heroBg: '#FFFFFF', heroBorder: '#EEEEEE',
    accent: '#111111', accentMuted: '#888888',
    textPrimary: '#111111', textSecondary: '#777777',
    tabsBg: '#FFFFFF', tabBorder: '#EEEEEE',
    titleFont: '-apple-system, sans-serif', bodyFont: '-apple-system, sans-serif',
    inputBg: '#F0F0F0', inputBorder: '#E0E0E0', inputColor: '#111111',
    cartBg: '#111111', cartBorder: 'none',
    btnBg: '#111111', btnColor: '#FFFFFF',
    addBtnBg: '#111111', addBtnBorder: '1px solid #111111', addBtnColor: '#FFFFFF',
    qtyBtnBorder: '1px solid #DDDDDD', qtyBtnColor: '#111111',
    modalBg: '#FFFFFF', modalBorder: '#EEEEEE',
    heroTitleColor: '#111111', heroSubColor: '#888888',
    itemBorderBottom: 'none', itemBg: '#FFFFFF',
    itemRadius: 12, itemShadow: '0 1px 6px rgba(0,0,0,0.07)', itemPadding: '1rem', itemMargin: '0 0.75rem 0.5rem',
    nameStyle: 'normal', nameWeight: 600, nameSize: 14,
    priceColor: '#111111', cartTotalColor: '#FFFFFF',
    cartCountColor: 'rgba(255,255,255,0.6)',
  }
}

function getStyles(themeKey) {
  const t = themeConfigs[themeKey] || themeConfigs['dark-gold']
  const isClean = themeKey === 'clean-app'
  const isWarm = themeKey === 'cafe-warm'
  return {
    page: { background: t.pageBg, minHeight: "100vh", maxWidth: 680, margin: "0 auto", fontFamily: t.bodyFont, fontWeight: 300, paddingBottom: 100 },
    center: { color: t.textPrimary, textAlign: "center", marginTop: 100, fontSize: 16, background: t.pageBg, minHeight: "100vh", fontFamily: t.bodyFont },
    hero: { background: t.heroBg, borderBottom: `1px solid ${t.heroBorder}`, padding: "2.5rem 2rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" },
    heroGoldBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` },
    heroBadge: { display: "inline-block", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: isWarm ? '#F5DEB3' : t.accent, border: `1px solid ${t.accentMuted}`, padding: "4px 16px", marginBottom: "1rem", fontFamily: t.bodyFont },
    heroTitle: { fontFamily: t.titleFont, fontSize: isClean ? 30 : 42, fontWeight: isClean ? 700 : 300, letterSpacing: isClean ? -1 : 2, color: t.heroTitleColor, lineHeight: 1.1, margin: "0 0 0.5rem" },
    heroSub: { fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: t.heroSubColor, margin: 0 },
    heroOrnament: { color: t.accentMuted, fontSize: 16, letterSpacing: 8, marginTop: "1rem", opacity: 0.6 },
    tabs: { display: "flex", overflowX: "auto", background: t.tabsBg, borderBottom: `1px solid ${t.tabBorder}`, padding: "0 1rem", scrollbarWidth: "none", position: "sticky", top: 0, zIndex: 10 },
    tab: { background: "none", border: "none", color: t.textSecondary, fontFamily: t.bodyFont, fontSize: 11, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", padding: "1rem 1.2rem", cursor: "pointer", whiteSpace: "nowrap", borderBottom: "2px solid transparent" },
    tabActive: { background: "none", border: "none", color: t.accent, fontFamily: t.bodyFont, fontSize: 11, fontWeight: isClean ? 700 : 400, letterSpacing: 2, textTransform: "uppercase", padding: "1rem 1.2rem", cursor: "pointer", whiteSpace: "nowrap", borderBottom: `2px solid ${t.accent}` },
    body: { padding: isClean ? "0.5rem 0 1rem" : "0 0 1rem" },
    menuItem: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: t.itemPadding, borderBottom: t.itemBorderBottom, gap: "1rem", background: t.itemBg, borderRadius: t.itemRadius, boxShadow: t.itemShadow, margin: t.itemMargin },
    itemLeft: { flex: 1 },
    itemName: { fontFamily: t.titleFont, fontSize: t.nameSize, fontWeight: t.nameWeight, fontStyle: t.nameStyle, color: t.textPrimary, marginBottom: 3 },
    itemDesc: { fontSize: 12, color: t.textSecondary, lineHeight: 1.6, maxWidth: 340, marginBottom: 4, fontFamily: t.bodyFont, fontStyle: 'normal' },
    itemMeta: { fontSize: 11, color: t.accentMuted },
    itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 80 },
    itemPrice: { fontFamily: t.titleFont, fontSize: isClean ? 15 : 18, fontWeight: isClean ? 700 : 400, color: t.priceColor, whiteSpace: "nowrap" },
    addBtn: { background: t.addBtnBg, border: t.addBtnBorder, color: t.addBtnColor, borderRadius: isClean ? 20 : 2, padding: isClean ? "5px 14px" : "4px 12px", fontSize: 11, letterSpacing: 1, cursor: "pointer", fontFamily: t.bodyFont, whiteSpace: "nowrap" },
    qtyRow: { display: "flex", alignItems: "center", gap: 8 },
    qtyBtn: { background: isClean ? t.accent : 'none', border: t.qtyBtnBorder, color: isClean ? '#fff' : t.qtyBtnColor, borderRadius: isClean ? "50%" : 2, width: 26, height: 26, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    qtyNum: { color: t.textPrimary, fontSize: 14, fontWeight: 400, minWidth: 16, textAlign: "center" },
    outOfStock: { color: t.textSecondary, fontSize: 11, fontStyle: "italic" },
    emptyState: { textAlign: "center", padding: "60px 24px" },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { color: t.textPrimary, fontFamily: t.titleFont, fontSize: 22, fontWeight: 300, margin: "0 0 8px" },
    emptyText: { color: t.textSecondary, fontSize: 13, lineHeight: 1.6, margin: 0 },
    menuFooter: { textAlign: "center", padding: "2rem 2rem 1rem", borderTop: `1px solid ${t.heroBorder}` },
    footerNote: { fontSize: 11, color: t.accentMuted, marginTop: 16, lineHeight: 1.8 },
    staffLink: { color: t.heroBorder, fontSize: 11, textDecoration: "none", display: "block", marginBottom: 8 },
    viewOrderBtn: { background: "none", border: `1px solid ${t.heroBorder}`, color: t.textSecondary, borderRadius: isClean ? 8 : 2, padding: "6px 16px", fontSize: 11, cursor: "pointer", marginBottom: 12, letterSpacing: 1, fontFamily: t.bodyFont },
    cartBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680, background: t.cartBg, borderTop: `1px solid ${t.cartBorder}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" },
    cartCount: { color: t.cartCountColor, fontSize: 12, letterSpacing: 1, margin: "0 0 2px", fontFamily: t.bodyFont },
    cartTotal: { color: t.cartTotalColor, fontFamily: t.titleFont, fontSize: 20, margin: 0 },
    placeBtn: { background: t.btnBg, color: t.btnColor, border: "none", borderRadius: isClean ? 10 : 2, padding: "10px 24px", fontSize: 12, fontWeight: 500, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", fontFamily: t.bodyFont },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 },
    modal: { background: t.modalBg, borderTop: `1px solid ${t.modalBorder}`, padding: "28px 24px 40px", width: "100%", maxWidth: 680 },
    modalTitle: { color: t.textPrimary, fontFamily: t.titleFont, fontSize: 24, fontWeight: isClean ? 700 : 300, margin: "0 0 4px" },
    modalSub: { color: t.textSecondary, fontSize: 12, letterSpacing: 1, margin: "0 0 20px" },
    modalInput: { width: "100%", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: isClean ? 8 : 0, padding: "12px 14px", color: t.inputColor, fontSize: 13, marginBottom: 10, boxSizing: "border-box", outline: "none", fontFamily: t.bodyFont },
    modalBtn: { width: "100%", background: t.btnBg, color: t.btnColor, border: "none", padding: "13px", fontSize: 12, fontWeight: 500, cursor: "pointer", marginBottom: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: t.bodyFont, borderRadius: isClean ? 10 : 0 },
    modalCancel: { width: "100%", background: "none", color: t.textSecondary, border: "none", padding: "10px", fontSize: 12, cursor: "pointer", letterSpacing: 1, fontFamily: t.bodyFont },
    confirmation: { background: t.pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: t.bodyFont, padding: 24 },
    confirmIcon: { fontSize: 64, marginBottom: 20 },
    confirmTitle: { color: t.textPrimary, fontFamily: t.titleFont, fontSize: 32, fontWeight: isClean ? 700 : 300, margin: "0 0 10px" },
    confirmSub: { color: t.textSecondary, fontSize: 13, letterSpacing: 1, margin: "0 0 24px", textAlign: "center" },
    statusContainer: { display: "flex", alignItems: "center", width: "100%", maxWidth: 320, marginBottom: 24, padding: "0 8px" },
    statusStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
    statusDotActive: { width: 12, height: 12, borderRadius: "50%", background: t.accent },
    statusDotInactive: { width: 12, height: 12, borderRadius: "50%", background: t.heroBorder, border: `1px solid ${t.tabBorder}` },
    statusDotDone: { width: 12, height: 12, borderRadius: "50%", background: "#6DB96D" },
    statusLine: { flex: 1, height: 1, background: t.heroBorder, marginBottom: 18 },
    statusLineActive: { flex: 1, height: 1, background: t.accent, marginBottom: 18 },
    statusLabel: { fontSize: 10, color: t.textSecondary, margin: 0, whiteSpace: "nowrap", letterSpacing: 1 },
    prepTimeBox: { border: `1px solid ${t.heroBorder}`, padding: "10px 24px", marginBottom: 24 },
    prepTimeText: { color: t.accent, fontSize: 12, letterSpacing: 1, margin: 0, fontFamily: t.bodyFont },
    orderSummary: { border: `1px solid ${t.heroBorder}`, padding: 20, width: "100%", maxWidth: 360, marginBottom: 24 },
    summaryTitle: { color: t.textSecondary, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px" },
    summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
    summaryItem: { color: t.textPrimary, fontFamily: t.titleFont, fontSize: 15 },
    summaryPrice: { color: t.accent, fontFamily: t.titleFont, fontSize: 15 },
    summaryTotal: { display: "flex", justifyContent: "space-between", borderTop: `1px solid ${t.heroBorder}`, paddingTop: 12, marginTop: 8, color: t.textPrimary, fontFamily: t.titleFont, fontSize: 18 },
    confirmBtn: { background: t.btnBg, color: t.btnColor, border: "none", padding: "12px 32px", fontSize: 11, fontWeight: 500, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", fontFamily: t.bodyFont, borderRadius: isClean ? 10 : 0 },
    cancelOrderBtn: { background: "none", border: "1px solid #8B2020", color: "#E07070", padding: "10px 28px", fontSize: 11, cursor: "pointer", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase", fontFamily: t.bodyFont },
    specialsHeader: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "1.5rem 2rem 1rem" },
    specialsGold: { color: t.accent, fontSize: 10, opacity: 0.6 },
    specialsTitle: { fontFamily: t.titleFont, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: t.accent },
    specialItem: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: isClean ? t.itemPadding : "1.6rem 2rem 1.1rem", borderBottom: t.itemBorderBottom, gap: "1rem", background: t.itemBg || t.heroBg, position: "relative", borderRadius: t.itemRadius, margin: t.itemMargin, boxShadow: t.itemShadow },
    specialBadge: { position: "absolute", top: 10, left: 20, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: t.accent, opacity: 0.7 },
    specialsDivider: { height: 1, background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`, margin: "0.5rem 2rem 1.5rem", opacity: 0.3 },
  }
}

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
  const [vegOnly, setVegOnly] = useState(false)
  const [holdCountdown, setHoldCountdown] = useState(60)
  const [holdActive, setHoldActive] = useState(false)
  const countdownRef = useRef(null)
  const hasLastOrder = !!localStorage.getItem("lastOrder")
  const lastOrderTime = useRef(0)
  const { hotelId, roomNumber } = useParams()
  const resolvedHotelId = hotelId || "a5b9bed4-9c40-4856-b4ed-371e800beaf0"
  const resolvedRoom = roomNumber || "101"
  const s = getStyles(hotelInfo?.theme || 'dark-gold')
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  
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
          if (payload.new.status === "rejected") {
            setPlacedOrder(prev => ({ ...prev, reject_reason: payload.new.reject_reason }))
          }
        })
        .subscribe()
    } catch (e) {
      console.log("Realtime not available", e)
    }
  
    // Poll every 8 seconds as fallback
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from("orders")
        .select("status, reject_reason")
        .eq("id", orderId)
        .single()
      if (data) {
        setOrderStatus(data.status)
        if (data.status === "rejected") {
          setPlacedOrder(prev => ({ ...prev, reject_reason: data.reject_reason }))
        }
        if (data.status === "delivered" || data.status === "cancelled" || data.status === "rejected") {
          clearInterval(pollInterval)
        }
      }
    }, 8000)
  }

  async function cancelOrder(orderId) {
    if (!orderId) return
    clearInterval(countdownRef.current)
    setHoldActive(false)
    await supabase.from("orders").delete().eq("id", orderId)
    setOrderStatus("cancelled")
    localStorage.removeItem("lastOrder")
    forceUpdate(n => n + 1)
  }

  async function placeOrder() {
    if (cart.length === 0) return
    if (!guestName.trim()) { alert("Please enter your name."); return }
    if (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length !== 10) {
      alert("Please enter a valid 10-digit phone number.")
      return
    }

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
        status: "hold",
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
startHoldCountdown(order.id)
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
  const filteredItems = vegOnly ? menuItems.filter(i => i.is_veg !== false) : menuItems
  function startHoldCountdown(orderId) {
    setHoldCountdown(60)
    setHoldActive(true)
    let seconds = 60
    countdownRef.current = setInterval(async () => {
      seconds -= 1
      setHoldCountdown(seconds)
      if (seconds <= 0) {
        clearInterval(countdownRef.current)
        setHoldActive(false)
        await supabase.from("orders").update({ status: "pending" }).eq("id", orderId)
      }
    }, 1000)
  }
  
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
           orderStatus === "rejected" ? (placedOrder?.reject_reason ? `Rejected: ${placedOrder.reject_reason}` : "Sorry, the hotel couldn't accept your order.") :
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

        {holdActive && (
  <div style={{ textAlign: "center", marginBottom: 16 }}>
    <p style={{ color: s.prepTimeText?.color || "#C9A84C", fontSize: 13, marginBottom: 8, letterSpacing: 1 }}>
      Order confirms in {holdCountdown}s
    </p>
    <div style={{ width: 200, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, margin: "0 auto 16px" }}>
      <div style={{ width: `${(holdCountdown / 60) * 100}%`, height: "100%", background: "#C9A84C", borderRadius: 2, transition: "width 1s linear" }} />
    </div>
    <button style={s.cancelOrderBtn} onClick={() => cancelOrder(placedOrder.id)}>
      Cancel Order
    </button>
  </div>
)}

{orderStatus === "delivered" && !ratingSubmitted && (
  <div style={{ textAlign: "center", marginBottom: 24, width: "100%", maxWidth: 360 }}>
    <p style={{ color: s.textPrimary, fontSize: 13, letterSpacing: 1, marginBottom: 16 }}>
      How was your experience?
    </p>
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => setRating(star)}
          style={{
            background: "none",
            border: "none",
            fontSize: 36,
            cursor: "pointer",
            color: "#F5A623",
            opacity: star <= rating ? 1 : 0.25,
            transition: "opacity 0.15s",
            padding: "0 4px",
            lineHeight: 1
          }}
        >
          ★
        </button>
      ))}
    </div>
    {rating > 0 && rating < 3 && (
      <textarea
        style={{ ...s.modalInput, height: 80, resize: "none", marginBottom: 12 }}
        placeholder="What went wrong? We'd love to know..."
        value={ratingComment}
        onChange={e => setRatingComment(e.target.value)}
      />
    )}
    {rating > 0 && (
      <button
        style={{ ...s.confirmBtn, width: "100%" }}
        onClick={async () => {
          await supabase.from("orders").update({
            rating,
            rating_comment: ratingComment || null
          }).eq("id", placedOrder.id)
          setRatingSubmitted(true)
        }}
      >
        Submit Rating
      </button>
    )}
  </div>
)}

{ratingSubmitted && (
  <p style={{ color: s.textSecondary, fontSize: 13, marginBottom: 24, letterSpacing: 1 }}>
    ✓ Thanks for your feedback!
  </p>
)}

<button style={s.confirmBtn} onClick={() => {
  setOrderPlaced(false)
  setPlacedOrder(null)
  setRating(0)
  setRatingComment("")
  setRatingSubmitted(false)
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
            <input
  style={s.modalInput}
  placeholder="Phone number *"
  type="tel"
  inputMode="numeric"
  maxLength={10}
  value={guestPhone}
  onChange={e => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
/>
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

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1rem", marginBottom: "0.5rem", background: s.tabsBg, padding: "8px 0" }}>
  <button
    style={{
      background: vegOnly ? "#2e7d32" : "none",
      border: "1px solid #2e7d32",
      color: vegOnly ? "#fff" : "#2e7d32",
      borderRadius: 20,
      padding: "5px 16px",
      fontSize: 11,
      cursor: "pointer",
      fontFamily: s.bodyFont,
      letterSpacing: 1,
    }}
    onClick={() => setVegOnly(!vegOnly)}
  >
    🟢 Veg Only
  </button>
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

{menuItems.filter(i => i.is_special).length > 0 && (
  <div>
    <div style={s.specialsHeader}>
      <span style={s.specialsGold}>✦</span>
      <span style={s.specialsTitle}>Our Specials</span>
      <span style={s.specialsGold}>✦</span>
    </div>
    {menuItems.filter(i => i.is_special).map(item => {
      const cartItem = cart.find(i => i.id === item.id)
      return (
        <div key={item.id} style={s.specialItem}>
          <div style={s.specialBadge}>Chef's Special</div>
          <div style={s.itemLeft}>
          <div style={{ ...s.itemName, display: "flex", alignItems: "center", gap: 6 }}>
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.is_veg !== false ? "#2e7d32" : "#c0392b", display: "inline-block", flexShrink: 0 }} />
  {item.name}
</div>
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
    <div style={s.specialsDivider} />
  </div>
)}

{filteredItems.filter(i => i.category === activeTab).map(item => {
          const cartItem = cart.find(i => i.id === item.id)
          return (
            <div key={item.id} style={s.menuItem}>
              <div style={s.itemLeft}>
              <div style={{ ...s.itemName, display: "flex", alignItems: "center", gap: 6 }}>
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.is_veg !== false ? "#2e7d32" : "#c0392b", display: "inline-block", flexShrink: 0 }} />
  {item.name}
</div>
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



export default App