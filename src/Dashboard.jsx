import { useEffect, useState } from "react"
import { supabase } from "./supabase"

export default function Dashboard({ onBack }) {
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("orders")
  const [newItem, setNewItem] = useState({ name: "", category: "", price: "", photo_url: "" })
  const [adding, setAdding] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [allHotels, setAllHotels] = useState([])

  useEffect(() => { loadHotel() }, [])

  async function loadHotel() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: hotelData } = await supabase
      .from("hotels")
      .select("*")
      .eq("user_id", user.id)
      .single()
    setHotel(hotelData)
    setIsAdmin(hotelData?.is_admin || false)

    fetchOrders(hotelData.id)
    fetchMenu(hotelData.id)

    if (hotelData?.is_admin) fetchAllHotels()

    const sub = supabase.channel("orders-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" },
        () => fetchOrders(hotelData.id))
      .subscribe()
    return () => supabase.removeChannel(sub)
  }

  async function fetchOrders(hotelId) {
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items(quantity, price, menu_items(name))`)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
    if (error) console.error(error)
    else setOrders(data)
    setLoading(false)
  }

  async function fetchMenu(hotelId) {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("category")
    if (data) setMenuItems(data)
  }

  async function fetchAllHotels() {
    const { data } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setAllHotels(data)
  }

  async function updateHotel(id, updates) {
    await supabase.from("hotels").update(updates).eq("id", id)
    fetchAllHotels()
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id)
    fetchOrders(hotel.id)
  }

  async function toggleAvailable(item) {
    await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id)
    fetchMenu(hotel.id)
  }

  async function deleteItem(id) {
    if (!confirm("Delete this item?")) return
    await supabase.from("menu_items").delete().eq("id", id)
    fetchMenu(hotel.id)
  }

  async function addItem() {
    if (!newItem.name || !newItem.category || !newItem.price) return
    setAdding(true)
    await supabase.from("menu_items").insert({
      hotel_id: hotel.id,
      name: newItem.name,
      category: newItem.category,
      price: parseFloat(newItem.price),
      photo_url: newItem.photo_url || null,
      available: true
    })
    setNewItem({ name: "", category: "", price: "", photo_url: "" })
    fetchMenu(hotel.id)
    setAdding(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onBack()
  }

  const active = orders.filter(o => o.status !== "delivered")
  const done = orders.filter(o => o.status === "delivered")
  const revenue = orders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)

  if (loading) return <div style={d.center}>Loading...</div>

  return (
    <div style={d.page}>
      {/* Topbar */}
      <div style={d.topbar}>
        <button onClick={onBack} style={d.backBtn}>← Back</button>
        <span style={d.brand}>{isAdmin ? "⚡ Admin Panel" : hotel?.name || "Dashboard"}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={d.live}><span style={d.dot} />Live</span>
          <button onClick={handleLogout} style={d.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Metrics */}
      <div style={d.metrics}>
        <div style={d.metric}><p style={d.metricVal}>{orders.length}</p><p style={d.metricLabel}>Orders today</p></div>
        <div style={d.metric}><p style={d.metricVal}>{active.length}</p><p style={d.metricLabel}>Active now</p></div>
        <div style={d.metric}><p style={d.metricVal}>₹{(revenue / 1000).toFixed(1)}k</p><p style={d.metricLabel}>Revenue</p></div>
      </div>

      {/* Tabs */}
      <div style={d.tabs}>
        <button style={tab === "orders" ? d.tabActive : d.tab} onClick={() => setTab("orders")}>Orders</button>
        <button style={tab === "menu" ? d.tabActive : d.tab} onClick={() => setTab("menu")}>Menu</button>
        {isAdmin && <button style={tab === "admin" ? d.tabActive : d.tab} onClick={() => setTab("admin")}>Hotels</button>}
      </div>

      <div style={d.body}>

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <>
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
          </>
        )}

        {/* MENU TAB */}
        {tab === "menu" && (
          <>
            <p style={d.sectionLabel}>Add New Item</p>
            <div style={d.form}>
              <input style={d.input} placeholder="Item name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
              <input style={d.input} placeholder="Category (e.g. Starter, Main Course)" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
              <input style={d.input} placeholder="Price (₹)" type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
              <input style={d.input} placeholder="Photo URL (optional)" value={newItem.photo_url} onChange={e => setNewItem({ ...newItem, photo_url: e.target.value })} />
              <button style={d.addBtn} onClick={addItem} disabled={adding}>
                {adding ? "Adding..." : "+ Add Item"}
              </button>
            </div>
            <p style={d.sectionLabel}>Your Menu ({menuItems.length} items)</p>
            {menuItems.length === 0 && <p style={d.empty}>No items yet. Add one above.</p>}
            {menuItems.map(item => (
              <div key={item.id} style={d.menuCard}>
                {item.photo_url
                  ? <img src={item.photo_url} alt={item.name} style={d.menuImg} />
                  : <div style={d.menuImgPlaceholder}>🍽️</div>
                }
                <div style={d.menuInfo}>
                  <p style={d.menuName}>{item.name}</p>
                  <p style={d.menuMeta}>{item.category} · ₹{item.price}</p>
                </div>
                <div style={d.menuActions}>
                  <button style={item.available ? d.btnOn : d.btnOff} onClick={() => toggleAvailable(item)}>
                    {item.available ? "On" : "Off"}
                  </button>
                  <button style={d.btnDelete} onClick={() => deleteItem(item.id)}>🗑</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ADMIN TAB */}
        {tab === "admin" && isAdmin && (
          <>
            <p style={d.sectionLabel}>All Hotels ({allHotels.length})</p>
            {allHotels.map(h => (
              <div key={h.id} style={d.card}>
                <div style={d.cardHeader}>
                  <div>
                    <p style={{ ...d.room, marginBottom: 2 }}>{h.name}</p>
                    <p style={d.timeAgo}>{h.owner_email || "No email"}</p>
                  </div>
                  <span style={
                    h.status === "active" ? d.badgeDone :
                    h.status === "disabled" ? d.badgePending : d.badgePrep
                  }>
                    {h.status || "pending"}
                  </span>
                </div>

                <div style={d.adminRow}>
                  <span style={d.adminLabel}>Rooms allowed</span>
                  <input
                    style={d.roomInput}
                    type="number"
                    defaultValue={h.room_count || 0}
                    onBlur={e => updateHotel(h.id, { room_count: parseInt(e.target.value) })}
                  />
                </div>

                <div style={d.adminRow}>
                  <span style={d.adminLabel}>Hotel ID (for QR)</span>
                  <span style={d.hotelId}>{h.id}</span>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {h.status !== "active" && (
                    <button style={d.btnDeliver} onClick={() => updateHotel(h.id, { status: "active" })}>
                      ✓ Approve
                    </button>
                  )}
                  {h.status === "active" && !h.is_admin && (
                    <button style={d.btnPrepare} onClick={() => updateHotel(h.id, { status: "disabled" })}>
                      Disable
                    </button>
                  )}
                  {h.status === "disabled" && (
                    <button style={d.btnDeliver} onClick={() => updateHotel(h.id, { status: "active" })}>
                      Re-enable
                    </button>
                  )}
                </div>
              </div>
            ))}
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
  logoutBtn: { background: "none", border: "0.5px solid #3a3a3c", color: "#6e6e73", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: 14 },
  metric: { background: "#fff", borderRadius: 12, padding: "12px 10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  metricVal: { fontSize: 20, fontWeight: 600, color: "#1c2b3a", margin: "0 0 3px" },
  metricLabel: { fontSize: 10, color: "#8a9bb0", margin: 0 },
  tabs: { display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fff", padding: "0 14px" },
  tab: { padding: "12px 20px", fontSize: 13, color: "#8a9bb0", background: "none", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontWeight: 500 },
  tabActive: { padding: "12px 20px", fontSize: 13, color: "#1c2b3a", background: "none", border: "none", borderBottom: "2px solid #1c2b3a", cursor: "pointer", fontWeight: 600 },
  body: { padding: "0 14px 40px" },
  sectionLabel: { fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8a9bb0", fontWeight: 500, margin: "16px 0 8px" },
  card: { background: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  room: { fontSize: 14, fontWeight: 600, color: "#1c2b3a", margin: 0 },
  badgePending: { background: "#fff3e0", color: "#b45309", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgePrep: { background: "#e0f2fe", color: "#0369a1", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgeDone: { background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  items: { marginBottom: 8 },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 4 },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#1c2b3a", borderTop: "0.5px solid #eee", paddingTop: 8, marginBottom: 10 },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  btnPrepare: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  btnDeliver: { background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
  timeAgo: { fontSize: 11, color: "#8a9bb0", margin: 0 },
  empty: { textAlign: "center", color: "#8a9bb0", marginTop: 30, fontSize: 14 },
  form: { background: "#fff", borderRadius: 14, padding: 14, marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 8 },
  input: { background: "#f4f6f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#1c2b3a", outline: "none" },
  addBtn: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  menuCard: { background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 },
  menuImg: { width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 },
  menuImgPlaceholder: { width: 52, height: 52, borderRadius: 8, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 13, fontWeight: 600, color: "#1c2b3a", margin: "0 0 3px" },
  menuMeta: { fontSize: 11, color: "#8a9bb0", margin: 0 },
  menuActions: { display: "flex", alignItems: "center", gap: 8 },
  btnOn: { background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnOff: { background: "#fce4e4", color: "#c0392b", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnDelete: { background: "none", border: "none", fontSize: 16, cursor: "pointer" },
  adminRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  adminLabel: { fontSize: 12, color: "#8a9bb0" },
  roomInput: { width: 60, background: "#f4f6f9", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", fontSize: 13, textAlign: "center" },
  hotelId: { fontSize: 10, color: "#8a9bb0", fontFamily: "monospace", background: "#f4f6f9", padding: "3px 8px", borderRadius: 6 },
}