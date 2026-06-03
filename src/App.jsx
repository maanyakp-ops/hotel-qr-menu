import {
  Receipt,
  ChefHat,
  Bike,
  CheckCircle2,
  XCircle,
  Ban,
  Clock3,
  PackageCheck
} from "lucide-react";
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
    addBtnBg: '#C9A84C', addBtnBorder: '1px solid #C9A84C', addBtnColor: '#0D0C0A',
    qtyBtnBorder: '1px solid #2E2B22', qtyBtnColor: '#C9A84C',
    modalBg: '#141310', modalBorder: '#2E2B22',
    heroTitleColor: '#EDE8DC', heroSubColor: '#9A927E',
    itemBorderBottom: '1px solid #2E2B22', itemBg: 'transparent',
    itemRadius: 0, itemShadow: 'none', itemPadding: '1.1rem 2rem', itemMargin: 0,
    nameStyle: 'normal', nameWeight: 400, nameSize: 17,
    priceColor: '#C9A84C', cartTotalColor: '#C9A84C',
    cartCountColor: '#9A927E',
  },
  'la-belle': {
    pageBg: '#fffaf8', heroBg: '#ffffff', heroBorder: '#f0e7e4',
    accent: '#e88d95', accentMuted: '#f5c4cb',
    textPrimary: '#2c2c2c', textSecondary: '#888888',
    tabsBg: '#ffffff', tabBorder: '#f0e7e4',
    titleFont: "'Cormorant Garamond', serif", bodyFont: "'Inter', sans-serif",
    inputBg: '#fff5f6', inputBorder: '#f0e7e4', inputColor: '#2c2c2c',
    cartBg: '#ffffff', cartBorder: '#f0e7e4',
    btnBg: '#e88d95', btnColor: '#ffffff',
    addBtnBg: '#e88d95', addBtnBorder: '1px solid #e88d95', addBtnColor: '#ffffff',
    qtyBtnBorder: '1px solid #f0e7e4', qtyBtnColor: '#e88d95',
    modalBg: '#ffffff', modalBorder: '#f0e7e4',
    heroTitleColor: '#2c2c2c', heroSubColor: '#888888',
    itemBorderBottom: 'none', itemBg: '#ffffff',
    itemRadius: 16, itemShadow: '0 2px 12px rgba(0,0,0,0.06)', itemPadding: '1rem', itemMargin: '0 0.75rem 0.75rem',
    nameStyle: 'normal', nameWeight: 600, nameSize: 14,
    priceColor: '#2c2c2c', cartTotalColor: '#2c2c2c',
    cartCountColor: '#888888',
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
    body: { padding: (isClean || themeKey === 'la-belle') ? "0.5rem 0 1rem" : "0 0 1rem" },
    menuItem: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: t.itemPadding, borderBottom: t.itemBorderBottom, gap: "1rem", background: t.itemBg, borderRadius: t.itemRadius, boxShadow: t.itemShadow, margin: t.itemMargin },
    itemLeft: { flex: 1 },
    itemName: { fontFamily: t.titleFont, fontSize: t.nameSize, fontWeight: t.nameWeight, fontStyle: t.nameStyle, color: t.textPrimary, marginBottom: 3 },
    itemDesc: { fontSize: 12, color: t.textSecondary, lineHeight: 1.6, maxWidth: 340, marginBottom: 4, fontFamily: t.bodyFont, fontStyle: 'normal' },
    itemMeta: { fontSize: 11, color: t.accentMuted },
    itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 80 },
    itemPrice: { fontFamily: t.titleFont, fontSize: isClean ? 15 : 18, fontWeight: isClean ? 700 : 400, color: t.priceColor, whiteSpace: "nowrap" },
    itemGst: { fontSize: 9, color: t.textSecondary, letterSpacing: 0.5, whiteSpace: "nowrap", marginTop: -6 },
    addBtn: { background: t.addBtnBg, border: t.addBtnBorder, color: t.addBtnColor, borderRadius: (isClean || themeKey === 'la-belle') ? 20 : 2, padding: isClean ? "5px 14px" : "4px 12px", fontSize: 11, letterSpacing: 1, cursor: "pointer", fontFamily: t.bodyFont, whiteSpace: "nowrap" },
    qtyRow: { display: "flex", alignItems: "center", gap: 8 },
    qtyBtn: { background: (isClean || themeKey === 'la-belle') ? t.accent : 'none', border: t.qtyBtnBorder, color: (isClean || themeKey === 'la-belle') ? '#fff' : t.qtyBtnColor, borderRadius: (isClean || themeKey === 'la-belle') ? "50%" : 2, width: 26, height: 26, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
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
    cartGstNote: { color: t.textSecondary, fontSize: 10, margin: "0", letterSpacing: 0.5 },
    placeBtn: { background: t.btnBg, color: t.btnColor, border: "none", borderRadius: isClean ? 10 : 2, padding: "10px 24px", fontSize: 12, fontWeight: 500, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", fontFamily: t.bodyFont },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 },
    modal: { background: t.modalBg, borderTop: `1px solid ${t.modalBorder}`, padding: "28px 24px 40px", width: "100%", maxWidth: 680 },
    modalTitle: { color: t.textPrimary, fontFamily: t.titleFont, fontSize: 24, fontWeight: isClean ? 700 : 300, margin: "0 0 4px" },
    modalSub: { color: t.textSecondary, fontSize: 12, letterSpacing: 1, margin: "0 0 20px" },
    modalInput: { width: "100%", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: isClean ? 8 : 0, padding: "12px 14px", color: t.inputColor, fontSize: 13, marginBottom: 10, boxSizing: "border-box", outline: "none", fontFamily: t.bodyFont },
    modalBtn: { width: "100%", background: t.btnBg, color: t.btnColor, border: "none", padding: "13px", fontSize: 12, fontWeight: 500, cursor: "pointer", marginBottom: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: t.bodyFont, borderRadius: isClean ? 10 : 0 },
    modalCancel: { width: "100%", background: "none", color: t.textSecondary, border: "none", padding: "10px", fontSize: 12, cursor: "pointer", letterSpacing: 1, fontFamily: t.bodyFont },
    // Cart summary inside modal
    cartSummaryBox: { background: t.inputBg, border: `1px solid ${t.inputBorder}`, padding: "14px 16px", marginBottom: 16, borderRadius: isClean ? 8 : 2 },
    cartSummaryTitle: { color: t.textSecondary, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" },
    cartSummaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 },
    cartSummaryItemName: { color: t.textPrimary, fontFamily: t.titleFont, flex: 1 },
    cartSummaryItemPrice: { color: t.textSecondary, fontSize: 11, marginLeft: 8 },
    cartSummaryItemGst: { color: t.accentMuted, fontSize: 10, marginLeft: 4 },
    cartDivider: { height: 1, background: t.heroBorder, margin: "10px 0" },
    cartSummarySubtotal: { display: "flex", justifyContent: "space-between", fontSize: 12, color: t.textSecondary, marginBottom: 4 },
    cartSummaryGst: { display: "flex", justifyContent: "space-between", fontSize: 12, color: t.accentMuted, marginBottom: 4 },
    cartSummaryGrandTotal: { display: "flex", justifyContent: "space-between", fontSize: 16, color: t.textPrimary, fontFamily: t.titleFont, marginTop: 6 },
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
    summaryDivider: { height: 1, background: t.heroBorder, margin: "8px 0" },
    summarySubRow: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: t.textSecondary },
    summaryGstRow: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: t.accentMuted },
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

// ─── GST HELPERS ────────────────────────────────────────────────────────────

/** Returns the GST amount for a single cart item (base price × qty × rate) */
function itemGstAmount(item) {
  const rate = item.gst_rate || 0
  return Math.round(item.price * item.qty * (rate / 100) * 100) / 100
}

/** Returns the GST amount for a stored order item (price already × qty) */
function orderItemGst(item) {
  const rate = item.gst_rate || 0
  return Math.round(item.price * item.quantity * (rate / 100) * 100) / 100
}

/** Summarise GST breakdown from cart: { subtotal, gstLines: [{rate, amount}], totalGst, grandTotal } */
function calcCartGst(cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const byRate = {}
  cart.forEach(i => {
    const rate = i.gst_rate || 0
    if (!byRate[rate]) byRate[rate] = 0
    byRate[rate] += Math.round(i.price * i.qty * (rate / 100) * 100) / 100
  })
  const gstLines = Object.entries(byRate)
    .filter(([, amt]) => amt > 0)
    .map(([rate, amount]) => ({ rate: Number(rate), amount }))
  const totalGst = gstLines.reduce((s, l) => s + l.amount, 0)
  return { subtotal, gstLines, totalGst, grandTotal: Math.round((subtotal + totalGst) * 100) / 100 }
}

/** Same but from stored order_items (have .quantity and .gst_rate) */
function calcOrderGst(orderItems) {
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const byRate = {}
  orderItems.forEach(i => {
    const rate = i.gst_rate || 0
    if (!byRate[rate]) byRate[rate] = 0
    byRate[rate] += Math.round(i.price * i.quantity * (rate / 100) * 100) / 100
  })
  const gstLines = Object.entries(byRate)
    .filter(([, amt]) => amt > 0)
    .map(([rate, amount]) => ({ rate: Number(rate), amount }))
  const totalGst = gstLines.reduce((s, l) => s + l.amount, 0)
  return { subtotal, gstLines, totalGst, grandTotal: Math.round((subtotal + totalGst) * 100) / 100 }
}

// ────────────────────────────────────────────────────────────────────────────

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
  const [guestEmail, setGuestEmail] = useState("")
  const [guestInstructions, setGuestInstructions] = useState("")
  const [orderStatus, setOrderStatus] = useState(null)
  const [activeTab, setActiveTab] = useState(null)
  const [, forceUpdate] = useState(0)
  const [vegOnly, setVegOnly] = useState(false)
  const [holdCountdown, setHoldCountdown] = useState(60)
  const [holdActive, setHoldActive] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [showOrdersList, setShowOrdersList] = useState(false)
  const [roomOrders, setRoomOrders] = useState([])
  const countdownRef = useRef(null)
  const lastOrderTime = useRef(0)
  const pollRef = useRef(null)
  const channelRef = useRef(null)
  const { hotelId, roomNumber } = useParams()
  const resolvedHotelId = hotelId || "a5b9bed4-9c40-4856-b4ed-371e800beaf0"
  const resolvedRoom = roomNumber || "101"
  const hasLastOrder = !!localStorage.getItem(`lastOrder_${resolvedRoom}`)
  const s = getStyles(hotelInfo?.theme || 'dark-gold')
  const t = themeConfigs[hotelInfo?.theme || 'dark-gold'] || themeConfigs['dark-gold']
  const fontScale = hotelInfo?.font_size === "small" ? 0.85 : hotelInfo?.font_size === "large" ? 1.2 : 1

  // GST summary for current cart
  const gstSummary = calcCartGst(cart)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
    })
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  useEffect(() => { fetchHotelAndMenu() }, [])

  useEffect(() => {
    if (orderStatus === "delivered") {
      const layer = document.getElementById("confetti-layer")
      if (!layer) return
      layer.innerHTML = ""
      const colors = ["#C9A84C","#2e7d32","#0369a1","#b45309","#5e35b1"]
      for (let i = 0; i < 24; i++) {
        const dot = document.createElement("div")
        const tx = (Math.random() - 0.5) * 300
        const ty = -(Math.random() * 120 + 40)
        dot.style.cssText = `
          position: absolute;
          left: ${40 + Math.random() * 20}%;
          top: 0;
          width: ${6 + Math.random() * 6}px;
          height: ${6 + Math.random() * 6}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
          --tx: ${tx}px; --ty: ${ty}px;
          animation: flyDot ${0.6 + Math.random() * 0.6}s ease-out ${Math.random() * 0.3}s forwards;
          pointer-events: none;
        `
        layer.appendChild(dot)
      }
    }
  }, [orderStatus])

  useEffect(() => {
  if (orderPlaced && placedOrder?.id) {
    const expiry = Number(localStorage.getItem(`holdExpiry_${placedOrder.id}`))
    if (expiry && Date.now() < expiry) {
      const remaining = Math.ceil((expiry - Date.now()) / 1000)
      setHoldCountdown(remaining)
      setHoldActive(true)
      
      const interval = setInterval(() => {
        const exp = Number(localStorage.getItem(`holdExpiry_${placedOrder.id}`))
        const rem = Math.max(0, Math.ceil((exp - Date.now()) / 1000))
        setHoldCountdown(rem)
        
        if (rem <= 0) {
          clearInterval(interval)
          supabase.from("orders").update({ status: "pending" }).eq("id", placedOrder.id)
          localStorage.removeItem(`holdExpiry_${placedOrder.id}`)
          setHoldActive(false)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }
}, [orderPlaced, placedOrder?.id])

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

  async function fetchRoomOrders() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from("orders")
      .select(`*, order_items(quantity, price, gst_rate, menu_items(name))`)
      .eq("hotel_id", resolvedHotelId)
      .eq("room_id", resolvedRoom)
      .or(`status.neq.hold,created_at.gte.${new Date(Date.now() - 2 * 60 * 1000).toISOString()}`)
      .gte("created_at", threeDaysAgo)
      .order("created_at", { ascending: false })
      .limit(10)
    if (data) setRoomOrders(data)
  }

  async function watchOrderStatus(orderId) {
    if (pollRef.current) clearInterval(pollRef.current)
    if (channelRef.current) supabase.removeChannel(channelRef.current)
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
      channelRef.current = sub
    } catch (e) {
      console.log("Realtime not available", e)
    }
    pollRef.current = setInterval(async () => {
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
          clearInterval(pollRef.current)
          supabase.removeChannel(channelRef.current)
        }
      }
    }, 8000)
  }

  async function cancelOrder(orderId) {
    if (!orderId) return
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = null
    setHoldActive(false)
    await supabase.from("orders").delete().eq("id", orderId)
    setOrderStatus("cancelled")
    localStorage.removeItem(`lastOrder_${resolvedRoom}`)
    forceUpdate(n => n + 1)
  }

  async function placeOrder() {
    if (cart.length === 0) return
    if (!guestName.trim()) { alert("Please enter your name."); return }
    if (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length !== 10) {
      alert("Please enter a valid 10-digit phone number.")
      return
    }
    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      alert("Please enter a valid email address.")
      return
    }
    const holdExpiresAt = Date.now() + 60000
    const { data: existingOrders } = await supabase

      .from("orders")
      .select("id, status")
      .eq("hotel_id", resolvedHotelId)
      .eq("room_id", resolvedRoom)
      .in("status", ["pending", "hold"])
    if (existingOrders && existingOrders.length > 0) {
      alert("You already have an active order. Please wait for it to be Marked as Preparing before placing a new one.")
      return
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        hotel_id: resolvedHotelId,
        room_id: resolvedRoom,
        status: "hold",
        payment_method: "cash",
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail || null,
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
        price: item.price,
        gst_rate: item.gst_rate || 0   // ← store GST rate per line item
      })))
    if (itemsError) { console.error(itemsError); return }

    const orderData = { ...order, items: cart, prepTime: maxPrepTime }
    setPlacedOrder(orderData)
    setOrderStatus("pending")
    setOrderPlaced(true)
    setShowGuestForm(false)
    setCart([])
    localStorage.setItem(`lastOrder_${resolvedRoom}`, JSON.stringify({ orderId: order.id, items: cart, room: resolvedRoom, prepTime: maxPrepTime }))
    forceUpdate(n => n + 1)
    localStorage.setItem(`holdExpiry_${order.id}`, holdExpiresAt.toString())
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

 function startHoldCountdown(orderId, startSeconds = 60) {
  const holdExpiry = Date.now() + (startSeconds * 1000)
  localStorage.setItem(`holdExpiry_${orderId}`, holdExpiry.toString())
  
  const updateCountdown = () => {
    const expiry = Number(localStorage.getItem(`holdExpiry_${orderId}`))
    const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
    setHoldCountdown(remaining)
    setHoldActive(remaining > 0)
    
    if (remaining <= 0) {
      supabase.from("orders").update({ status: "pending" }).eq("id", orderId)
      localStorage.removeItem(`holdExpiry_${orderId}`)
    }
  }
  
  updateCountdown() // Update immediately
  const interval = setInterval(updateCountdown, 1000)
  
  // Cleanup on unmount
  return () => clearInterval(interval)
}

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const categories = [...new Set(menuItems.map(i => i.category))]
  const maxPrepTime = cart.length > 0 ? Math.max(...cart.map(i => i.prep_time || 15)) : 15
  const filteredItems = vegOnly ? menuItems.filter(i => i.is_veg !== false) : menuItems

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

  // ─── MY ORDERS LIST ──────────────────────────────────────────────────────
  if (showOrdersList) {
    return (
      <div style={{ ...s.page, padding: 0 }}>
        <div style={{ background: t.heroBg, padding: "1.5rem 1.5rem 1rem", borderBottom: `1px solid ${t.heroBorder}` }}>
          <button
            onClick={() => setShowOrdersList(false)}
            style={{ background: "none", border: "none", color: t.accent, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12 }}
          >
            ← Back to Menu
          </button>
          <h2 style={{ color: t.textPrimary, fontFamily: t.titleFont, fontSize: 24, fontWeight: 300, margin: 0 }}>
            My Orders
          </h2>
          <p style={{ color: t.textSecondary, fontSize: 12, margin: "4px 0 0" }}>Room {resolvedRoom}</p>
        </div>
        <div style={{ padding: "1rem" }}>
          {roomOrders.length === 0 && (
            <p style={{ color: t.textSecondary, textAlign: "center", marginTop: 40 }}>No orders found.</p>
          )}
          {roomOrders.map(order => {
            const { grandTotal } = calcOrderGst(order.order_items)
            const time = new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            const date = new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            const statusColor = order.status === "delivered" ? "#2e7d32" : order.status === "cancelled" || order.status === "rejected" ? "#c0392b" : order.status === "preparing" || order.status === "on_the_way" ? "#0369a1" : "#b45309"
            return (
              <div
                key={order.id}
                onClick={() => {
                  setPlacedOrder({ ...order, items: order.order_items.map(i => ({ ...i, name: i.menu_items?.name, qty: i.quantity })), prepTime: 15 })
                  setOrderStatus(order.status)
                  if (order.rating || localStorage.getItem(`rated_${order.id}`)) setRatingSubmitted(true)
                  else setRatingSubmitted(false)
                  const expiry = Number(localStorage.getItem(`holdExpiry_${order.id}`))
                  const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
                  if (order.status === "hold" && remaining > 0) {
                    setHoldCountdown(remaining)
                    setHoldActive(true)
                    startHoldCountdown(order.id, remaining)
                  } else {
                    setHoldActive(false)
                  }
                  setOrderPlaced(true)
                  setShowOrdersList(false)
                  watchOrderStatus(order.id)
                }}
                style={{ background: t.heroBg, border: `1px solid ${t.heroBorder}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: t.textPrimary, fontFamily: t.titleFont, fontSize: 16 }}>₹{grandTotal}</span>
                  <span style={{ fontSize: 11, color: statusColor, fontWeight: 500, textTransform: "capitalize" }}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <div style={{ color: t.textSecondary, fontSize: 12, marginBottom: 6 }}>
                  {order.order_items.map(i => `${i.menu_items?.name} x${i.quantity}`).join(", ")}
                </div>
                <div style={{ color: t.accentMuted, fontSize: 11 }}>{date} · {time}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── ORDER CONFIRMATION ──────────────────────────────────────────────────
  if (orderPlaced && placedOrder) {
    // Build GST summary from placed order items
    const placedItems = placedOrder.items || []
    // Items may be cart-style {price, qty, gst_rate} or order_items-style {price, quantity, gst_rate}
    const normalised = placedItems.map(i => ({ ...i, qty: i.qty || i.quantity || 1 }))
    const placedGst = calcCartGst(normalised)

    return (
      <div style={s.confirmation}>
        <div style={s.confirmIcon}>
  {orderStatus === "cancelled" ? (
    <XCircle size={52} strokeWidth={1.5} />
  ) : orderStatus === "rejected" ? (
    <Ban size={52} strokeWidth={1.5} />
  ) : (
    <CheckCircle2 size={52} strokeWidth={1.5} />
  )}
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
          <div style={{ width: "100%", maxWidth: 420, marginBottom: 28, position: "relative" }}>
            <div id="confetti-layer" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0, overflow: "visible", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              {[
  {
    key: "pending",
    icon: <Receipt size={18} strokeWidth={1.75} />,
    label: "Received"
  },
  {
    key: "preparing",
    icon: <ChefHat size={18} strokeWidth={1.75} />,
    label: "Preparing"
  },
  {
    key: "onway",
    icon: <Bike size={18} strokeWidth={1.75} />,
    label: "On the Way"
  },
  {
    key: "done",
    icon: <CheckCircle2 size={18} strokeWidth={1.75} />,
    label: "Delivered"
  }
].map((step, idx) => {
                const currentIdx = orderStatus === "delivered" ? 3 : orderStatus === "on_the_way" ? 2 : orderStatus === "preparing" ? 1 : 0
                const isDone = idx < currentIdx
                const isActive = idx === currentIdx
                return (
                  <div key={step.key} style={{ display: "flex", alignItems: "flex-start", flex: idx < 3 ? "1" : "0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 72, flexShrink: 0 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: isDone ? "#e8f5e9" : isActive ? "#1c2b3a" : "rgba(255,255,255,0.07)",
                        border: isDone ? "2px solid #2e7d32" : isActive ? "2px solid #C9A84C" : "2px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22,
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                        opacity: idx > currentIdx ? 0.4 : 1,
                        position: "relative",
                      }}>
                        {isActive && (
                          <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid #C9A84C", animation: "pulseRing 1.5s ease-out infinite" }} />
                        )}
                        <div
  style={{
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isDone
      ? "rgba(46,125,50,0.12)"
      : "rgba(201,168,76,0.12)",
    color: isDone ? "#2e7d32" : "#C9A84C",
    animation: isActive
      ? "bounceIcon 0.8s ease infinite alternate"
      : isDone
      ? "popIcon 0.4s cubic-bezier(0.34,1.56,0.64,1)"
      : "none",
  }}
>
  {isDone ? <CheckCircle2 size={18} strokeWidth={2} /> : step.icon}
</div>
                      </div>
                      <p style={{ fontSize: 11, textAlign: "center", margin: "6px 0 0", color: isDone ? "#2e7d32" : isActive ? "#C9A84C" : s.textSecondary, fontWeight: (isDone || isActive) ? 500 : 400, lineHeight: 1.3, whiteSpace: "nowrap", transition: "color 0.3s" }}>
                        {step.label}
                      </p>
                    </div>
                    {idx < 3 && (
                      <div style={{ flex: 1, height: 3, marginTop: 27, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #2e7d32, #C9A84C)", width: isDone ? "100%" : isActive ? "40%" : "0%", transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <style>{`
              @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(1.5); opacity: 0; } }
              @keyframes bounceIcon { from { transform: translateY(0px); } to { transform: translateY(-4px); } }
              @keyframes popIcon { 0% { transform: scale(0.5); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
              @keyframes flyDot { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
            `}</style>
          </div>
        )}

        {/* ── ORDER SUMMARY WITH GST ── */}
        <div style={s.orderSummary}>
          <p style={s.summaryTitle}>Your Order</p>
          {normalised.map((item, i) => (
            <div key={i} style={s.summaryRow}>
              <span style={s.summaryItem}>{item.name} ×{item.qty}</span>
              <span style={s.summaryPrice}>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div style={s.summaryDivider} />
          <div style={s.summarySubRow}>
            <span>Subtotal</span>
            <span>₹{placedGst.subtotal}</span>
          </div>
          {placedGst.gstLines.map(line => (
            <div key={line.rate} style={s.summaryGstRow}>
              <span>GST @ {line.rate}%</span>
              <span>₹{line.amount.toFixed(2)}</span>
            </div>
          ))}
          {placedGst.totalGst === 0 && (
            <div style={s.summaryGstRow}>
              <span>GST</span>
              <span>₹0</span>
            </div>
          )}
          <div style={s.summaryTotal}>
            <span>Total</span>
            <span>₹{placedGst.grandTotal}</span>
          </div>
        </div>

        {holdActive && holdCountdown > 0 && orderStatus !== "delivered" && orderStatus !== "cancelled" && orderStatus !== "rejected" && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <p style={{ color: "#C9A84C", fontSize: 13, marginBottom: 8, letterSpacing: 1 }}>
              Order confirms in {holdCountdown}s
            </p>
            <div style={{ width: 200, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, margin: "0 auto 16px" }}>
              <div style={{ width: `${(holdCountdown / 60) * 100}%`, height: "100%", background: "#C9A84C", borderRadius: 2, transition: "width 1s linear" }} />
            </div>
            <button style={s.cancelOrderBtn} onClick={() => cancelOrder(placedOrder.id)}>Cancel Order</button>
          </div>
        )}

        {orderStatus === "delivered" && !ratingSubmitted && (
          <div style={{ textAlign: "center", marginBottom: 24, width: "100%", maxWidth: 360 }}>
            <p style={{ color: s.textPrimary, fontSize: 13, letterSpacing: 1, marginBottom: 16 }}>How was your experience?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} style={{ background: "none", border: "none", fontSize: 36, cursor: "pointer", color: "#F5A623", opacity: star <= rating ? 1 : 0.25, transition: "opacity 0.15s", padding: "0 4px", lineHeight: 1 }}>★</button>
              ))}
            </div>
            {rating > 0 && rating < 3 && (
              <textarea style={{ ...s.modalInput, height: 80, resize: "none", marginBottom: 12 }} placeholder="What went wrong? We'd love to know..." value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
            )}
            {rating > 0 && (
              <button style={{ ...s.confirmBtn, width: "100%" }} onClick={async () => {
                await supabase.from("orders").update({ rating, rating_comment: ratingComment || null }).eq("id", placedOrder.id)
                setRatingSubmitted(true)
                localStorage.setItem(`rated_${placedOrder.id}`, "true")
              }}>Submit Rating</button>
            )}
          </div>
        )}

        {ratingSubmitted && (
          <p style={{ color: "#ffffff", fontSize: 13, marginBottom: 24, letterSpacing: 1 }}>✓ Thanks for your feedback!</p>
        )}

        <button style={s.confirmBtn} onClick={() => {
          setOrderPlaced(false)
          setPlacedOrder(null)
          setRating(0)
          setRatingComment("")
          setRatingSubmitted(false)
        }}>Back to Menu</button>
      </div>
    )
  }

  // ─── MAIN MENU VIEW ──────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* ── GUEST FORM MODAL WITH CART SUMMARY ── */}
      {showGuestForm && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, maxHeight: "90vh", overflowY: "auto" }}>
            <p style={s.modalTitle}>Almost there!</p>
            <p style={s.modalSub}>Enter your details to place the order</p>

            {/* Cart summary with GST */}
            <div style={s.cartSummaryBox}>
              <p style={s.cartSummaryTitle}>Order Summary</p>
              {cart.map((item, i) => {
                const gstAmt = itemGstAmount(item)
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                    <span style={{ ...s.cartSummaryItemName, fontSize: 13 }}>
                      {item.name} ×{item.qty}
                    </span>
                    <span style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ color: t.textPrimary, fontSize: 13 }}>₹{item.price * item.qty}</span>
                      {item.gst_rate > 0 && (
                        <span style={{ color: t.accentMuted, fontSize: 10, marginLeft: 4 }}>+₹{gstAmt.toFixed(2)} GST</span>
                      )}
                    </span>
                  </div>
                )
              })}
              <div style={s.cartDivider} />
              <div style={s.cartSummarySubtotal}>
                <span>Subtotal</span>
                <span>₹{gstSummary.subtotal}</span>
              </div>
              {gstSummary.gstLines.map(line => (
                <div key={line.rate} style={s.cartSummaryGst}>
                  <span>GST @ {line.rate}%</span>
                  <span>₹{line.amount.toFixed(2)}</span>
                </div>
              ))}
              {gstSummary.totalGst === 0 && (
                <div style={s.cartSummaryGst}>
                  <span>GST</span>
                  <span>₹0</span>
                </div>
              )}
              <div style={s.cartSummaryGrandTotal}>
                <span>Grand Total</span>
                <span>₹{gstSummary.grandTotal}</span>
              </div>
            </div>

            <input style={s.modalInput} placeholder="Your name *" value={guestName} onChange={e => setGuestName(e.target.value)} />
            <input style={s.modalInput} placeholder="Phone number *" type="tel" inputMode="numeric" maxLength={10} value={guestPhone} onChange={e => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            <input style={s.modalInput} placeholder="Email (optional)" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
            <textarea style={{ ...s.modalInput, height: 80, resize: "none" }} placeholder="Special instructions — e.g. less spicy, no onion" value={guestInstructions} onChange={e => setGuestInstructions(e.target.value)} />
            <button style={s.modalBtn} onClick={placeOrder}>Confirm Order · ₹{gstSummary.grandTotal}</button>
            <button style={s.modalCancel} onClick={() => setShowGuestForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.hero}>
        <div style={s.heroGoldBar} />
        <div style={s.heroBadge}>Room Service</div>
        <h1 style={s.heroTitle}>{hotelInfo?.name || "Hotel"}</h1>
        <p style={s.heroSub}>Room {resolvedRoom} &nbsp;·&nbsp; Available 24/7</p>
        <div style={s.heroOrnament}>✦ &nbsp; ✦ &nbsp; ✦</div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: "1rem", marginBottom: "0.5rem", background: s.tabsBg, padding: "8px 0" }}>
        <button
          style={{ background: vegOnly ? "#2e7d32" : "none", border: "1px solid #2e7d32", color: vegOnly ? "#fff" : "#2e7d32", borderRadius: 20, padding: "5px 16px", fontSize: 11, cursor: "pointer", fontFamily: s.bodyFont, letterSpacing: 1 }}
          onClick={() => setVegOnly(!vegOnly)}
        >
          🟢 Veg Only
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: t.accent, fontWeight: 700 }}>A−</span>
          <div
            onClick={async () => {
              const sizeOrder = ["small", "medium", "large"]
              const current = hotelInfo?.font_size || "medium"
              const next = sizeOrder[(sizeOrder.indexOf(current) + 1) % sizeOrder.length]
              await supabase.from("hotels").update({ font_size: next }).eq("id", resolvedHotelId)
              setHotelInfo(prev => ({ ...prev, font_size: next }))
            }}
            style={{ width: 40, height: 20, borderRadius: 10, background: t.accent, cursor: "pointer", position: "relative" }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: "50%", background: '#fff',
              position: "absolute", top: 2,
              left: hotelInfo?.font_size === "large" ? 22 : hotelInfo?.font_size === "small" ? 2 : 12,
              transition: "left 0.2s"
            }} />
          </div>
          <span style={{ fontSize: 17, color: t.accent, fontWeight: 700 }}>A+</span>
        </div>
      </div>

      {categories.length > 0 && (
        <div style={s.tabs}>
          {categories.map(cat => (
            <button key={cat} style={activeTab === cat ? { ...s.tabActive, fontSize: 11 * fontScale } : { ...s.tab, fontSize: 11 * fontScale }} onClick={() => setActiveTab(cat)}>{cat}</button>
          ))}
        </div>
      )}

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
                  {item.image_url && (
                    <img src={item.image_url} style={{ width: 72, height: 72, borderRadius: t.itemRadius || 8, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={s.itemLeft}>
                    <div style={{ ...s.itemName, fontSize: (t.nameSize || 17) * fontScale, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.is_veg !== false ? "#2e7d32" : "#c0392b", display: "inline-block", flexShrink: 0 }} />
                      {item.name}
                    </div>
                    {item.description && <div style={{ ...s.itemDesc, fontSize: 12 * fontScale }}>{item.description}</div>}
                    <div style={s.itemMeta}>⏱ {item.prep_time || 15} min</div>
                  </div>
                  <div style={s.itemRight}>
                    <div style={{ ...s.itemPrice, fontSize: s.itemPrice.fontSize * fontScale }}>₹{item.price}</div>
                    {item.gst_rate > 0 && (
                      <div style={s.itemGst}>+{item.gst_rate}% GST</div>
                    )}
                    {item.out_of_stock ? (
                      <span style={s.outOfStock}>Out of Stock</span>
                    ) : cartItem ? (
                      <div style={s.qtyRow}>
                        <button style={s.qtyBtn} onClick={() => removeFromCart(item)}>−</button>
                        <span style={s.qtyNum}>{cartItem.qty}</span>
                        <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
                      </div>
                    ) : (
                      <button style={{ ...s.addBtn, fontSize: 11 * fontScale }} onClick={() => addToCart(item)}>+ Add</button>
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
              {item.image_url && (
                <img src={item.image_url} style={{ width: 72, height: 72, borderRadius: t.itemRadius || 8, objectFit: "cover", flexShrink: 0 }} />
              )}
              <div style={s.itemLeft}>
                <div style={{ ...s.itemName, fontSize: (t.nameSize || 17) * fontScale, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.is_veg !== false ? "#2e7d32" : "#c0392b", display: "inline-block", flexShrink: 0 }} />
                  {item.name}
                </div>
                {item.description && <div style={{ ...s.itemDesc, fontSize: 12 * fontScale }}>{item.description}</div>}
                <div style={s.itemMeta}>⏱ {item.prep_time || 15} min</div>
              </div>
              <div style={s.itemRight}>
                <div style={{ ...s.itemPrice, fontSize: s.itemPrice.fontSize * fontScale }}>₹{item.price}</div>
                {item.gst_rate > 0 && (
                  <div style={s.itemGst}>+{item.gst_rate}% GST</div>
                )}
                {item.out_of_stock ? (
                  <span style={s.outOfStock}>Out of Stock</span>
                ) : cartItem ? (
                  <div style={s.qtyRow}>
                    <button style={s.qtyBtn} onClick={() => removeFromCart(item)}>−</button>
                    <span style={s.qtyNum}>{cartItem.qty}</span>
                    <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
                  </div>
                ) : (
                  <button style={{ ...s.addBtn, fontSize: 11 * fontScale }} onClick={() => addToCart(item)}>+ Add</button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={s.menuFooter}>
        {hasLastOrder && (
          <button style={s.viewOrderBtn}
            onClick={async () => {
              setOrderPlaced(false)
              setPlacedOrder(null)
              setHoldActive(false)
              setHoldCountdown(0)
              await fetchRoomOrders()
              setShowOrdersList(true)
            }}
          >My Orders</button>
        )}
        <p style={s.footerNote}>All prices exclusive of GST · GST added at checkout · Please inform staff of any allergies</p>
      </div>

      {/* ── CART BAR WITH GST BREAKDOWN ── */}
      {cart.length > 0 && (
        <div style={s.cartBar}>
          <div>
            <p style={s.cartCount}>{cart.reduce((s, i) => s + i.qty, 0)} items · ⏱ ~{maxPrepTime} min</p>
            <p style={s.cartTotal}>₹{gstSummary.grandTotal}</p>
            <p style={s.cartGstNote}>
              ₹{gstSummary.subtotal} + GST ₹{gstSummary.totalGst.toFixed(2)}
            </p>
          </div>
          <button style={s.placeBtn} onClick={() => setShowGuestForm(true)}>Place Order</button>
        </div>
      )}
    </div>
  )
}

export default App