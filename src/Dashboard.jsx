import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import { QRCodeSVG as QRCode } from "qrcode.react"


export default function Dashboard({ onBack }) {
  const today = new Date().toISOString().split("T")[0]
  const [darkMode, setDarkMode] = useState(false)
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("orders")
  const [newItem, setNewItem] = useState({ name: "", category: "", price: "", prep_time: "15", description: "" })
  const [adding, setAdding] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [allHotels, setAllHotels] = useState([])
  const [editItem, setEditItem] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [savingTheme, setSavingTheme] = useState(false)
  const [themeSaved, setThemeSaved] = useState(false)
  const [rejectingOrder, setRejectingOrder] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [roomSummaryNumber, setRoomSummaryNumber] = useState("")
  const [roomSummaryOrders, setRoomSummaryOrders] = useState(null)
  const [roomSummaryLoading, setRoomSummaryLoading] = useState(false)
  const [roomCheckIn, setRoomCheckIn] = useState(today)
  const [roomCheckOut, setRoomCheckOut] = useState(today)
  const [guestSearchPhone, setGuestSearchPhone] = useState("")
  function playOrderSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }

  function showBadge() {
    const original = document.title
    let count = 0
    const interval = setInterval(() => {
      document.title = count % 2 === 0 ? "🔔 New Order!" : original
      count++
      if (count > 10) { clearInterval(interval); document.title = original }
    }, 500)
  }

  function downloadQR(roomNumber) {
    const svgEl = document.getElementById(`qr-${roomNumber}`)
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas2 = document.createElement("canvas")
    canvas2.width = 300
    canvas2.height = 300
    const ctx = canvas2.getContext("2d")
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, 300, 300)
      ctx.drawImage(img, 0, 0, 300, 300)
      const a = document.createElement("a")
      a.download = `Room-${roomNumber}-QR.png`
      a.href = canvas2.toDataURL("image/png")
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  useEffect(() => { loadHotel() }, [])
  
  useEffect(() => {
    if (hotel) fetchOrders(hotel.id, showAll)
  }, [showAll])

useEffect(() => {
  function handleVisibilityChange() {
    if (document.visibilityState === "visible" && hotel) {
      fetchOrders(hotel.id, showAll)
    }
  }
  document.addEventListener("visibilitychange", handleVisibilityChange)
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
}, [hotel, showAll])

  function suggestDescription(name, category, target) {
    if (!name) return
    const n = name.toLowerCase()
    const c = (category || "").toLowerCase()
  
    const templates = {
      starter: `Light and flavourful ${name}, the perfect way to begin your meal.`,
      soup: `Rich, slow-cooked ${name} served piping hot with fresh garnish.`,
      salad: `Crisp, fresh ${name} tossed in a house dressing.`,
      "main course": `A hearty serving of ${name}, cooked to perfection.`,
      main: `A hearty serving of ${name}, cooked to perfection.`,
      biryani: `Fragrant basmati rice slow-cooked with tender meat and aromatic spices.`,
      dessert: `Indulgent ${name} to end your meal on a sweet note.`,
      beverage: `Chilled and refreshing ${name}, served fresh.`,
      drink: `Chilled and refreshing ${name}, served fresh.`,
      breakfast: `A wholesome ${name} to start your day right.`,
      snack: `Light and crispy ${name}, perfect for any time of day.`,
    }
  
    const keywords = {
      chicken: `Tender, juicy chicken ${name} cooked in rich spices.`,
      paneer: `Soft paneer ${name} in a creamy, flavourful gravy.`,
      dal: `Slow-simmered lentils with a smoky tadka finish.`,
      rice: `Steamed, fluffy ${name} served hot.`,
      noodle: `Stir-fried ${name} tossed with vegetables and sauces.`,
      pasta: `${name} in a rich, creamy sauce with fresh herbs.`,
      pizza: `Stone-baked ${name} with a crispy crust and fresh toppings.`,
      burger: `Juicy ${name} stacked high with fresh toppings.`,
      sandwich: `Fresh ${name} on toasted bread with house sauces.`,
      chai: `Hot, aromatic ${name} brewed with ginger and spices.`,
      coffee: `Rich, freshly brewed ${name}.`,
      juice: `Freshly squeezed ${name}, chilled and served cold.`,
      cake: `Moist, decadent ${name} baked fresh daily.`,
      ice: `Cool, creamy ${name} to refresh your palate.`,
      egg: `Farm-fresh eggs prepared as ${name}.`,
      fish: `Fresh catch of the day served as ${name}.`,
      mutton: `Slow-cooked tender mutton in a bold, spiced gravy.`,
      prawn: `Succulent prawns in a tangy, aromatic preparation.`,
    }
  
    let desc = `A delicious serving of ${name}, freshly prepared by our kitchen.`
  
    for (const keyword in keywords) {
      if (n.includes(keyword)) { desc = keywords[keyword]; break }
    }
  
    for (const cat in templates) {
      if (c.includes(cat)) { desc = templates[cat]; break }
    }
  
    if (target === "new") setNewItem(prev => ({ ...prev, description: desc }))
    else setEditItem(prev => ({ ...prev, description: desc }))
  }

  const menuTemplates = {
    breakfast: {
      label: "Breakfast",
      emoji: "🍳",
      items: [
        { name: "Poha", category: "Breakfast", price: 60, prep_time: 10, description: "Light, fluffy flattened rice with mustard seeds and fresh coriander." },
        { name: "Upma", category: "Breakfast", price: 70, prep_time: 10, description: "Savory semolina porridge with vegetables and curry leaves." },
        { name: "Idli Sambhar", category: "Breakfast", price: 90, prep_time: 10, description: "Steamed rice cakes served with hot sambhar and coconut chutney." },
        { name: "Bread Toast", category: "Breakfast", price: 40, prep_time: 5, description: "Crispy toasted bread served with butter and jam." },
        { name: "Masala Omelette", is_veg: false, category: "Breakfast", price: 70, prep_time: 10, description: "Farm fresh eggs with onions, tomatoes and green chilli." },
        { name: "Aloo Paratha", category: "Breakfast", price: 80, prep_time: 15, description: "Stuffed whole wheat flatbread with spiced potato filling." },
        { name: "Continental Breakfast", category: "Breakfast", price: 250, prep_time: 15, description: "Croissant, toast, eggs, juice and coffee served together." },
        { name: "Fresh Fruit Platter", category: "Breakfast", price: 180, prep_time: 10, description: "Seasonal fresh fruits, elegantly arranged." },
        { name: "Pancakes", category: "Breakfast", price: 120, prep_time: 15, description: "Fluffy pancakes served with maple syrup and butter." },
      ]
    },
    starters: {
      label: "Starters",
      emoji: "🥗",
      items: [
        { name: "Paneer Tikka", category: "Starters", price: 220, prep_time: 20, description: "Tandoor-charred paneer with bell peppers and mint chutney." },
        { name: "Veg Spring Rolls", category: "Starters", price: 130, prep_time: 15, description: "Crispy rolls filled with stir-fried vegetables." },
        { name: "Samosa", category: "Starters", price: 50, prep_time: 5, description: "Crispy fried pastry filled with spiced potatoes." },
        { name: "Hara Bhara Kabab", category: "Starters", price: 160, prep_time: 15, description: "Soft spinach and pea patties with a crispy coating." },
        { name: "Chicken Tikka", is_veg: false, category: "Starters", price: 280, prep_time: 20, description: "Juicy chicken marinated in spices, grilled in tandoor." },
        { name: "Fish Fingers", is_veg: false, category: "Starters", price: 260, prep_time: 20, description: "Crispy battered fish fingers served with tartar sauce." },
        { name: "Veg Seekh Kabab", category: "Starters", price: 180, prep_time: 20, description: "Spiced vegetable skewers grilled to perfection." },
        { name: "Chilli Paneer", category: "Starters", price: 200, prep_time: 15, description: "Indo-Chinese style paneer tossed with peppers and sauces." },
      ]
    },
    maincourse: {
      label: "Main Course",
      emoji: "🍛",
      items: [
        { name: "Dal Makhani", category: "Main Course", price: 180, prep_time: 25, description: "Slow-cooked black lentils in a rich, buttery tomato gravy." },
        { name: "Paneer Butter Masala", category: "Main Course", price: 210, prep_time: 20, description: "Soft paneer in a velvety, spiced tomato-butter sauce." },
        { name: "Butter Chicken", is_veg: false, category: "Main Course", price: 280, prep_time: 25, description: "Tender chicken in a rich, aromatic tomato-butter gravy." },
        { name: "Veg Biryani", category: "Main Course", price: 220, prep_time: 30, description: "Fragrant basmati rice layered with spiced vegetables and saffron." },
        { name: "Chicken Biryani", is_veg: false, category: "Main Course", price: 280, prep_time: 30, description: "Aromatic basmati rice slow-cooked with tender chicken." },
        { name: "Dal Tadka", category: "Main Course", price: 140, prep_time: 20, description: "Yellow lentils tempered with cumin, garlic and dried chilli." },
        { name: "Butter Naan", category: "Main Course", price: 50, prep_time: 10, description: "Leavened bread baked in tandoor, finished with butter." },
        { name: "Garlic Naan", category: "Main Course", price: 60, prep_time: 10, description: "Tandoor-baked naan topped with roasted garlic and coriander." },
        { name: "Jeera Rice", category: "Main Course", price: 120, prep_time: 15, description: "Fragrant basmati rice tempered with cumin seeds." },
        { name: "Roti", category: "Main Course", price: 20, prep_time: 5, description: "Freshly made whole wheat flatbread." },
        { name: "Mutton Rogan Josh", is_veg: false, category: "Main Course", price: 360, prep_time: 35, description: "Slow-cooked mutton in a bold Kashmiri spiced gravy." },
      ]
    },
    soups: {
      label: "Soups & Salads",
      emoji: "🥣",
      items: [
        { name: "Tomato Soup", category: "Soups & Salads", price: 110, prep_time: 10, description: "Creamy, slow-cooked tomato soup with croutons." },
        { name: "Sweet Corn Soup", category: "Soups & Salads", price: 120, prep_time: 10, description: "Thick, comforting sweet corn soup with a hint of pepper." },
        { name: "Hot & Sour Soup", category: "Soups & Salads", price: 120, prep_time: 10, description: "Indo-Chinese style tangy and spicy broth with vegetables." },
        { name: "Manchow Soup", category: "Soups & Salads", price: 130, prep_time: 12, description: "Spicy noodle soup topped with crispy fried noodles." },
        { name: "Green Salad", category: "Soups & Salads", price: 90, prep_time: 5, description: "Fresh garden vegetables with lemon dressing." },
        { name: "Caesar Salad", category: "Soups & Salads", price: 160, prep_time: 10, description: "Crisp romaine, croutons and parmesan with Caesar dressing." },
        { name: "Fruit Salad", category: "Soups & Salads", price: 120, prep_time: 5, description: "Seasonal fresh fruits with a squeeze of lime." },
      ]
    },
    beverages: {
      label: "Beverages",
      emoji: "☕",
      items: [
        { name: "Masala Chai", category: "Beverages", price: 40, prep_time: 5, description: "Hot, aromatic tea brewed with ginger and spices." },
        { name: "Coffee", category: "Beverages", price: 50, prep_time: 5, description: "Freshly brewed hot coffee." },
        { name: "Cold Coffee", category: "Beverages", price: 90, prep_time: 5, description: "Chilled blended coffee with ice cream." },
        { name: "Fresh Lime Soda", category: "Beverages", price: 70, prep_time: 3, description: "Freshly squeezed lime with soda, sweet or salted." },
        { name: "Fresh Orange Juice", category: "Beverages", price: 120, prep_time: 5, description: "Freshly squeezed orange juice, served chilled." },
        { name: "Mango Lassi", category: "Beverages", price: 90, prep_time: 5, description: "Thick, creamy yogurt blended with fresh mango pulp." },
        { name: "Buttermilk", category: "Beverages", price: 50, prep_time: 3, description: "Chilled spiced buttermilk with curry leaves and ginger." },
        { name: "Cold Drink", category: "Beverages", price: 50, prep_time: 2, description: "Chilled soft drink of your choice." },
        { name: "Mineral Water", category: "Beverages", price: 30, prep_time: 1, description: "500ml chilled mineral water bottle." },
        { name: "Mocktail of the Day", category: "Beverages", price: 160, prep_time: 8, description: "Chef's special non-alcoholic blend, served chilled." },
      ]
    },
    snacks: {
      label: "Snacks",
      emoji: "🍟",
      items: [
        { name: "French Fries", category: "Snacks", price: 100, prep_time: 12, description: "Golden, crispy fries served with ketchup." },
        { name: "Veg Sandwich", category: "Snacks", price: 90, prep_time: 10, description: "Grilled sandwich with fresh vegetables and cheese." },
        { name: "Bread Pakoda", category: "Snacks", price: 60, prep_time: 10, description: "Golden fried bread stuffed with spiced filling." },
        { name: "Pav Bhaji", category: "Snacks", price: 110, prep_time: 15, description: "Spiced mashed vegetable curry served with buttered pav." },
        { name: "Veg Burger", category: "Snacks", price: 120, prep_time: 12, description: "Crispy veg patty with fresh toppings in a soft bun." },
        { name: "Chicken Sandwich", is_veg: false, category: "Snacks", price: 150, prep_time: 12, description: "Grilled chicken with lettuce and sauce in toasted bread." },
        { name: "Nachos with Salsa", category: "Snacks", price: 130, prep_time: 8, description: "Crispy nachos served with fresh tomato salsa and sour cream." },
      ]
    },
    desserts: {
      label: "Desserts",
      emoji: "🍮",
      items: [
        { name: "Gulab Jamun", category: "Desserts", price: 100, prep_time: 5, description: "Soft milk dumplings soaked in rose-scented sugar syrup." },
        { name: "Chocolate Brownie", category: "Desserts", price: 160, prep_time: 8, description: "Warm dark chocolate brownie served with vanilla ice cream." },
        { name: "Ice Cream", category: "Desserts", price: 120, prep_time: 3, description: "Choice of vanilla, chocolate or strawberry, served with wafer." },
        { name: "Rasgulla", category: "Desserts", price: 90, prep_time: 5, description: "Soft spongy cottage cheese balls in light sugar syrup." },
        { name: "Kheer", category: "Desserts", price: 110, prep_time: 5, description: "Creamy rice pudding with cardamom and dry fruits." },
        { name: "Gajar Halwa", category: "Desserts", price: 120, prep_time: 8, description: "Slow-cooked carrot pudding with ghee and nuts." },
        { name: "Cheesecake", category: "Desserts", price: 180, prep_time: 5, description: "Creamy baked cheesecake with a buttery biscuit base." },
      ]
    },
  }
  
  function openTemplatePreview(templateKey) {
    setPreviewTemplate(templateKey)
    setSelectedItems(menuTemplates[templateKey].items.map((_, i) => i))
  }
  
  async function applyTemplate() {
    const items = selectedItems.map(i => ({
      ...menuTemplates[previewTemplate].items[i],
      hotel_id: hotel.id,
      available: true,
      is_special: false
    }))
    await supabase.from("menu_items").insert(items)
    fetchMenu(hotel.id)
    setPreviewTemplate(null)
    setShowTemplates(false)
  }

  async function loadHotel() {
    document.addEventListener("click", () => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ctx.resume()
    }, { once: true })

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
    
    

    const sub = supabase.channel("orders-channel-" + hotelData.id)
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "orders",
    filter: `hotel_id=eq.${hotelData.id}`
  }, (payload) => {
    if (payload.new.status === "hold") return
    fetchOrders(hotelData.id)
    playOrderSound()
    showBadge()
  })
  .on("postgres_changes", {
    event: "UPDATE",
    schema: "public",
    table: "orders",
    filter: `hotel_id=eq.${hotelData.id}`
  }, (payload) => {
    if (payload.new.status === "hold") return
    fetchOrders(hotelData.id)
    if (payload.new.status === "pending") {
      playOrderSound()
      showBadge()
    }
  })
  .subscribe()
    return () => supabase.removeChannel(sub)
  }

  async function fetchOrders(hotelId, all = false) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
  
    let query = supabase
  .from("orders")
  .select(`*, order_items(quantity, price, menu_item_id, menu_items!fk_menu_item(name))`)
  .eq("hotel_id", hotelId)
  .neq("status", "hold")
  .order("created_at", { ascending: false })
  
    if (!all) {
      query = query.gte("created_at", today.toISOString())
    }
  
    const { data, error } = await query
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
    const { data } = await supabase.rpc("get_all_hotels")
    if (data) setAllHotels(data)
  }

  async function updateHotel(id, updates) {
    await supabase.rpc("update_hotel", { hotel_id: id, updates: updates })
    fetchAllHotels()
  }

  async function updateStatus(id, status) {
    const updates = { status }
    if (status === "delivered") updates.delivered_at = new Date().toISOString()
    await supabase.from("orders").update(updates).eq("id", id)
    fetchOrders(hotel.id)
  }
  async function rejectOrder(id) {
    const reason = rejectReason === "custom" ? customReason : rejectReason
    await supabase.from("orders").update({ status: "rejected", reject_reason: reason }).eq("id", id)
    setRejectingOrder(null)
    setRejectReason("")
    setCustomReason("")
    fetchOrders(hotel.id)
  }
  async function toggleAvailable(item) {
    await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id)
    fetchMenu(hotel.id)
  }

  async function toggleStock(item) {
    await supabase.from("menu_items").update({ out_of_stock: !item.out_of_stock }).eq("id", item.id)
    fetchMenu(hotel.id)
  }

  async function saveEdit() {
    await supabase.from("menu_items").update({
      name: editItem.name,
      category: editItem.category,
      price: parseFloat(editItem.price),
      prep_time: parseInt(editItem.prep_time) || 15,
      description: editItem.description || null,
      is_special: editItem.is_special || false,
      is_veg: editItem.is_veg !== false ? true : false,
    }).eq("id", editItem.id)
    setEditItem(null)
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
      prep_time: parseInt(newItem.prep_time) || 15,
      description: newItem.description || null,
      is_special: newItem.is_special || false,
      available: true,
      is_veg: newItem.is_veg !== false ? true : false,
    })
    setNewItem({ name: "", category: "", price: "", prep_time: "15", description: "", is_special: false })
    fetchMenu(hotel.id)
    setAdding(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onBack()
  }

  

  
  
  const [reportDate, setReportDate] = useState(today)
  const [reportOrders, setReportOrders] = useState([])

  useEffect(() => {
    if (hotel && tab === "reports") fetchReportOrders()
  }, [reportDate, tab, hotel])

async function fetchReportOrders() {
  const start = new Date(reportDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(reportDate)
  end.setHours(23, 59, 59, 999)
  const { data } = await supabase
  .from("orders")
  .select(`*, delivered_at, order_items(quantity, price, menu_item_id, menu_items(name, prep_time))`)
    .eq("hotel_id", hotel.id)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: false })
  if (data) setReportOrders(data)
}

async function fetchRoomSummary() {
  if (!roomSummaryNumber && !guestSearchPhone) return
  setRoomSummaryLoading(true)
  const start = new Date(roomCheckIn)
  start.setHours(0, 0, 0, 0)
  const end = new Date(roomCheckOut)
  end.setHours(23, 59, 59, 999)

  let query = supabase
    .from("orders")
    .select(`*, order_items(quantity, price, menu_item_id, menu_items(name))`)
    .eq("hotel_id", hotel.id)
    .neq("status", "hold")
    .neq("status", "cancelled")
    .neq("status", "rejected")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: true })

  if (guestSearchPhone) query = query.eq("guest_phone", guestSearchPhone)
  else query = query.eq("room_id", roomSummaryNumber)

  const { data } = await query
  setRoomSummaryOrders(data || [])
  setRoomSummaryLoading(false)
}
function downloadCSV() {
  const rows = [["Time", "Room", "Guest", "Phone", "Items", "Total", "Status"]]
  reportOrders.forEach(o => {
    const time = new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    const items = o.order_items.map(i => `${i.menu_items?.name} x${i.quantity}`).join("; ")
    const total = o.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
    rows.push([time, o.room_id, o.guest_name || "", o.guest_phone || "", items, total, o.status])
  })
  const csv = rows.map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `report-${reportDate}.csv`
  a.click()
}

  // ─── THEME PICKER ───────────────────────────────────────────────
  const themes = [
    { key: "dark-gold",     label: "Dark Gold",     swatches: ["#0D0C0A", "#141310", "#C9A84C", "#EDE8DC"] },
    { key: "cafe-warm",     label: "Café Warm",     swatches: ["#FAF6F0", "#3D2B1F", "#C4A882", "#D9C9B0"] },
    { key: "royal-emerald", label: "Royal Emerald", swatches: ["#0E1F18", "#0A1912", "#B8963E", "#E8D5A3"] },
    { key: "clean-app",     label: "Clean App",     swatches: ["#F5F5F5", "#FFFFFF", "#111111", "#888888"] },
  ]

  async function saveTheme(themeKey) {
    setSavingTheme(true)
    await supabase.from("hotels").update({ theme: themeKey }).eq("id", hotel.id)
    setHotel(prev => ({ ...prev, theme: themeKey }))
    setSavingTheme(false)
    setThemeSaved(true)
    setTimeout(() => setThemeSaved(false), 2500)
  }
  // ────────────────────────────────────────────────────────────────

  const active = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "rejected")
  const done = orders.filter(o => o.status === "delivered")
  const cancelled = orders.filter(o => o.status === "cancelled" || o.status === "rejected")
  const revenue = orders.filter(o => o.status !== "cancelled" && o.status !== "rejected").reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)

  if (loading) return <div style={d.center}>Loading...</div>

  const tabContentStyle = { animation: "fadeSlide 0.2s ease" }

  return (
    <div style={{ ...d.page, background: darkMode ? "#0f1923" : "#f4f6f9", color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>
<div style={{ ...d.topbar, background: darkMode ? "#0a1219" : "#1c2b3a" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2d3f52", display: "flex", alignItems: "center", justifyContent: "center", color: "#7eb3f5", fontSize: 16 }}>🏨</div>
    <div>
      <div style={{ color: "#e8f0f8", fontSize: 14, fontWeight: 500 }}>{isAdmin ? "⚡ Admin Panel" : hotel?.name || "Dashboard"}</div>
      <div style={{ color: "#5a7a9a", fontSize: 11 }}>Dashboard</div>
    </div>
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(111,207,151,0.12)", border: "0.5px solid rgba(111,207,151,0.3)", borderRadius: 20, padding: "4px 10px" }}>
      <span style={d.dot} />
      <span style={{ color: "#6fcf97", fontSize: 11, fontWeight: 500 }}>Live</span>
    </div>
    <button onClick={handleLogout} style={d.logoutBtn}>Logout</button>
  </div>
</div>

{tab !== "reports" && (
<div style={{ ...d.metrics, gridTemplateColumns: "repeat(4,1fr)" }}>
  <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
    <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>{orders.length}</p>
    <p style={d.metricLabel}>Orders today</p>
  </div>
  <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
    <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>{active.length}</p>
    <p style={d.metricLabel}>Active now</p>
  </div>
  <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
    <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>₹{(revenue / 1000).toFixed(1)}k</p>
    <p style={d.metricLabel}>Revenue</p>
  </div>
  <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
    <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>
      {orders.filter(o => o.rating).length > 0
        ? (orders.reduce((sum, o) => sum + (o.rating || 0), 0) / orders.filter(o => o.rating).length).toFixed(1) + " ★"
        : "—"}
    </p>
    <p style={d.metricLabel}>Avg rating</p>
  </div>
</div>
)}

      <div style={{ ...d.tabs, background: darkMode ? "#111f2c" : "#fff", borderBottom: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
        <button style={tab === "orders"   ? d.tabActive : d.tab} onClick={() => setTab("orders")}>Orders</button>
        <button style={tab === "menu"     ? d.tabActive : d.tab} onClick={() => setTab("menu")}>Menu</button>
        <button style={tab === "reports"  ? d.tabActive : d.tab} onClick={() => setTab("reports")}>Reports</button>
        <button style={tab === "qr"       ? d.tabActive : d.tab} onClick={() => setTab("qr")}>QR Codes</button>
        <button style={tab === "settings" ? d.tabActive : d.tab} onClick={() => setTab("settings")}>Settings</button>
        {isAdmin && <button style={tab === "admin" ? d.tabActive : d.tab} onClick={() => setTab("admin")}>Hotels</button>}
      </div>

<div style={{ ...d.body, background: darkMode ? "#0f1923" : "#f4f6f9" }}>
  <style>{`@keyframes fadeSlide { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* ORDERS TAB */}
        {tab === "orders" && (
        <div style={tabContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 8px" }}>
              <p style={{ ...d.sectionLabel, margin: 0 }}>
                {showAll ? "All Orders" : "Today's Orders"}
              </p>
              <button style={d.toggleBtn} onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show Today" : "Show All"}
              </button>
              {rejectingOrder && (
  <div style={d.modalOverlay}>
    <div style={d.modal}>
      <p style={d.modalTitle}>Reason for Rejection</p>
      <p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
        This will be shown to the guest on their order screen.
      </p>
      {[
        "Item currently unavailable",
        "Kitchen is closed",
        "Too many orders at the moment",
        "Outside delivery hours",
        "custom"
      ].map(reason => (
        <button
          key={reason}
          onClick={() => setRejectReason(reason)}
          style={{
            background: rejectReason === reason ? "#1c2b3a" : "#f4f6f9",
            color: rejectReason === reason ? "#7eb3f5" : "#1c2b3a",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
            marginBottom: 6,
          }}
        >
          {reason === "custom" ? "✏️ Write custom reason..." : reason}
        </button>
      ))}
      {rejectReason === "custom" && (
        <textarea
          style={{ ...d.input, height: 80, resize: "none", marginTop: 4 }}
          placeholder="Type your reason here..."
          value={customReason}
          onChange={e => setCustomReason(e.target.value)}
        />
      )}
      <button
        style={{ ...d.saveBtn, marginTop: 8, opacity: (!rejectReason || (rejectReason === "custom" && !customReason.trim())) ? 0.4 : 1 }}
        disabled={!rejectReason || (rejectReason === "custom" && !customReason.trim())}
        onClick={() => rejectOrder(rejectingOrder)}
      >
        Confirm Rejection
      </button>
      <button style={d.cancelBtn} onClick={() => setRejectingOrder(null)}>Cancel</button>
    </div>
  </div>
)}
            </div>

            {active.length > 0 && (
              <>
                <p style={d.sectionLabel}>Active Orders</p>
{active.map(order => {
  const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
  const mins = Math.floor((Date.now() - new Date(order.created_at)) / 60000)
  return (
    <div key={order.id} style={{ ...d.card, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
      <div style={d.cardHeader}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f4f6f9", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 500, color: "#1c2b3a" }}>
            🚪 Room {order.room_id}
          </div>
          {order.guest_name && (
            <p style={{ fontSize: 12, color: "#8a9bb0", margin: "6px 0 2px", display: "flex", alignItems: "center", gap: 4 }}>
              👤 {order.guest_name}{order.guest_phone ? ` · ${order.guest_phone}` : ""}
            </p>
          )}
          <p style={{ fontSize: 11, color: "#8a9bb0", margin: 0 }}>
            🕐 {mins < 1 ? "Just now" : `${mins} min ago`}
          </p>
        </div>
        <span style={order.status === "pending" ? d.badgePending : order.status === "on_the_way" ? d.badgeOnWay : d.badgePrep}>
          {order.status === "pending" ? "Pending" : order.status === "on_the_way" ? "On the Way" : "Preparing"}
        </span>
      </div>
      <div style={{ borderTop: "0.5px solid #e2e8f0", borderBottom: "0.5px solid #e2e8f0", padding: "10px 0", margin: "10px 0", display: "flex", flexDirection: "column", gap: 5 }}>
        {order.order_items.map((item, i) => (
          <div key={i} style={d.itemRow}>
            <span>{item.menu_items?.name} x{item.quantity}</span>
            <span style={{ color: "#1c2b3a", fontWeight: 500 }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      {order.special_instructions && (
        <div style={{ background: "#f4f6f9", borderRadius: 8, padding: "7px 10px", marginBottom: 10, fontSize: 12, color: "#8a9bb0", display: "flex", gap: 6 }}>
          📝 {order.special_instructions}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1c2b3a" }}>
          <span style={{ fontSize: 12, color: "#8a9bb0", fontWeight: 400, marginRight: 4 }}>Total</span>
          ₹{orderTotal}
        </span>
        <div style={d.actions}>
          {order.status === "pending" && (
            <>
              <button style={d.btnPrepare} onClick={() => updateStatus(order.id, "preparing")}>👨‍🍳 Mark Preparing</button>
              <button style={d.btnReject} onClick={() => { setRejectingOrder(order.id); setRejectReason("") }}>✕ Reject</button>
            </>
          )}
          {order.status === "preparing" && (
            <button style={d.btnOnWay} onClick={() => updateStatus(order.id, "on_the_way")}>🛵 On the Way</button>
          )}
          {order.status === "on_the_way" && (
            <button style={d.btnDeliver} onClick={() => updateStatus(order.id, "delivered")}>✓ Delivered</button>
          )}
        </div>
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
<div key={order.id} style={{ ...d.card, opacity: 0.6, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
      <div style={d.cardHeader}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f4f6f9", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 500, color: "#1c2b3a" }}>
            🚪 Room {order.room_id}
          </div>
          {order.guest_name && (
            <p style={{ fontSize: 12, color: "#8a9bb0", margin: "6px 0 0" }}>
              👤 {order.guest_name}
            </p>
          )}
        </div>
        <span style={d.badgeDone}>✓ Delivered</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1c2b3a" }}>
          <span style={{ fontSize: 12, color: "#8a9bb0", fontWeight: 400, marginRight: 4 }}>Total</span>
          ₹{orderTotal}
        </span>
        {order.rating && (
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#f5a623", fontSize: 15 }}>
              {"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)}
            </span>
            {order.rating_comment && (
              <p style={{ fontSize: 12, color: "#8a9bb0", margin: "4px 0 0" }}>"{order.rating_comment}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
})}
              </>
            )}

            {cancelled.length > 0 && (
              <>
                <p style={d.sectionLabel}>Cancelled / Rejected</p>
{cancelled.map(order => {
  const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
  return (
  <div key={order.id} style={{ ...d.card, opacity: 0.6, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
      <div style={d.cardHeader}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f4f6f9", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 500, color: "#1c2b3a" }}>
            🚪 Room {order.room_id}
          </div>
          {order.guest_name && (
            <p style={{ fontSize: 12, color: "#8a9bb0", margin: "6px 0 0" }}>
              👤 {order.guest_name}
            </p>
          )}
        </div>
        <span style={d.badgeCancelled}>{order.status === "cancelled" ? "Cancelled" : "Rejected"}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1c2b3a" }}>
          <span style={{ fontSize: 12, color: "#8a9bb0", fontWeight: 400, marginRight: 4 }}>Total</span>
          ₹{orderTotal}
        </span>
      </div>
    </div>
  )
})}
              </>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {tab === "menu" && (
  <div style={tabContentStyle}>
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              <button style={d.templateToggleBtn} onClick={() => setShowTemplates(!showTemplates)}>
                {showTemplates ? "✕ Close Templates" : "⚡ Start from a template"}
              </button>
            </div>

            {showTemplates && (
              <div style={d.templateGrid}>
                {Object.entries(menuTemplates).map(([key, t]) => (
                  <div key={key} style={d.templateCard}>
                    <div style={d.templateEmoji}>{t.emoji}</div>
                    <div style={d.templateLabel}>{t.label}</div>
                    <div style={d.templateCount}>{t.items.length} items</div>
                    <button style={d.templateBtn} onClick={() => openTemplatePreview(key)}>Use This</button>
                  </div>
                ))}
              </div>
            )}

            <p style={d.sectionLabel}>Add New Item</p>
            <div style={d.form}>
              <input style={d.input} placeholder="Item name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
              <select
  style={d.input}
  value={newItem.category}
  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
>
  <option value="">Select Category</option>
  {["Breakfast", "Starters", "Main Course", "Breads", "Rice & Biryani", "Snacks", "Desserts", "Beverages"].map(cat => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
  {menuItems.map(i => i.category).filter((c, idx, arr) => c && arr.indexOf(c) === idx && !["Breakfast", "Starters", "Main Course", "Breads", "Rice & Biryani", "Snacks", "Desserts", "Beverages"].includes(c)).map(cat => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>
              <input style={d.input} placeholder="Price (₹)" type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
              <input style={d.input} placeholder="Prep time in minutes (e.g. 15)" type="number" value={newItem.prep_time} onChange={e => setNewItem({ ...newItem, prep_time: e.target.value })} />
              <div style={{ display: "flex", gap: 6 }}>
                <input style={{ ...d.input, flex: 1 }} placeholder="Item description (optional)" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                <button type="button" style={d.btnSuggest} onClick={() => suggestDescription(newItem.name, newItem.category, "new")}>
                  Suggest
                </button>
              </div>
              <button
                type="button"
                style={newItem.is_special ? d.btnSpecialOn : d.btnSpecialOff}
                onClick={() => setNewItem({ ...newItem, is_special: !newItem.is_special })}
              >
                {newItem.is_special ? "⭐ Marked as Special" : "☆ Mark as Special"}
              </button>

              <button
  type="button"
  style={newItem.is_veg !== false ? d.btnVeg : d.btnNonVeg}
  onClick={() => setNewItem({ ...newItem, is_veg: newItem.is_veg === false ? true : false })}
>
  {newItem.is_veg !== false ? "🟢 Veg" : "🔴 Non-Veg"}
</button>

              <button style={d.addBtn} onClick={addItem} disabled={adding}>
                {adding ? "Adding..." : "+ Add Item"}
              </button>
            </div>

            <p style={d.sectionLabel}>Your Menu ({menuItems.length} items)</p>
            {menuItems.length === 0 && <p style={d.empty}>No items yet. Add one above.</p>}

            {Object.entries(
              menuItems.reduce((acc, item) => {
                const cat = item.category || "Uncategorized"
                if (!acc[cat]) acc[cat] = []
                acc[cat].push(item)
                return acc
              }, {})
            ).map(([category, items]) => (
              <div key={category}>
                <p style={d.sectionLabel}>{category}</p>
                {items.map(item => (
                  <div key={item.id} style={d.menuCard}>
                    <div style={d.menuImgPlaceholder}>🍽️</div>
                    <div style={d.menuInfo}>
                      <p style={d.menuName}>{item.name}</p>
                      <p style={d.menuMeta}>{item.category} · ₹{item.price} · {item.prep_time}min</p>
                    </div>
                    <div style={d.menuActions}>
                      <button style={item.available ? d.btnOn : d.btnOff} onClick={() => toggleAvailable(item)}>
                        {item.available ? "On" : "Off"}
                      </button>
                      <button style={item.out_of_stock ? d.btnNoStock : d.btnStock} onClick={() => toggleStock(item)}>
                        {item.out_of_stock ? "Out of Stock" : "In Stock"}
                      </button>
                      <button
                        style={item.is_special ? d.btnSpecialOn : d.btnSpecialOff}
                        onClick={async () => {
                          await supabase.from("menu_items").update({ is_special: !item.is_special }).eq("id", item.id)
                          fetchMenu(hotel.id)
                        }}
                      >
                        {item.is_special ? "⭐" : "☆"}
                      </button>
                      <button style={d.btnEdit} onClick={() => setEditItem(item)}>✏️</button>
                      <button style={d.btnDelete} onClick={() => deleteItem(item.id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* EDIT MODAL */}
        {editItem && (
          <div style={d.modalOverlay}>
            <div style={d.modal}>
              <p style={d.modalTitle}>Edit Item</p>
              <input style={d.input} placeholder="Item name" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} />
              <select
  style={d.input}
  value={editItem.category}
  onChange={e => setEditItem({ ...editItem, category: e.target.value })}
>
  <option value="">Select Category</option>
  {["Breakfast", "Starters", "Main Course", "Breads", "Rice & Biryani", "Snacks", "Desserts", "Beverages"].map(cat => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
  {menuItems.map(i => i.category).filter((c, idx, arr) => c && arr.indexOf(c) === idx && !["Breakfast", "Starters", "Main Course", "Breads", "Rice & Biryani", "Snacks", "Desserts", "Beverages"].includes(c)).map(cat => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>
              <input style={d.input} placeholder="Price (₹)" type="number" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: e.target.value })} />
              <input style={d.input} placeholder="Prep time (minutes)" type="number" value={editItem.prep_time} onChange={e => setEditItem({ ...editItem, prep_time: e.target.value })} />
              <div style={{ display: "flex", gap: 6 }}>
                <input style={{ ...d.input, flex: 1 }} placeholder="Description (optional)" value={editItem.description || ""} onChange={e => setEditItem({ ...editItem, description: e.target.value })} />
                <button type="button" style={d.btnSuggest} onClick={() => suggestDescription(editItem.name, editItem.category, "edit")}>
                  Suggest
                </button>
              </div>
              <button
                type="button"
                style={editItem.is_special ? d.btnSpecialOn : d.btnSpecialOff}
                onClick={() => setEditItem({ ...editItem, is_special: !editItem.is_special })}
              >
                {editItem.is_special ? "⭐ Marked as Special" : "☆ Mark as Special"}
              </button>

              <button
  type="button"
  style={editItem.is_veg !== false ? d.btnVeg : d.btnNonVeg}
  onClick={() => setEditItem({ ...editItem, is_veg: editItem.is_veg === false ? true : false })}
>
  {editItem.is_veg !== false ? "🟢 Veg" : "🔴 Non-Veg"}
</button>

              <button style={d.saveBtn} onClick={() => saveEdit()}>Save Changes</button>
              <button style={d.cancelBtn} onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* QR CODES TAB */}
        {tab === "qr" && (
          <>
            {hotel?.status !== "active"
              ? <p style={d.empty}>Your account is pending approval. QR codes will appear once approved.</p>
              : hotel?.room_count === 0
              ? <p style={d.empty}>No rooms assigned yet. Contact support to get your rooms activated.</p>
              : (
                <>
                  <p style={d.sectionLabel}>{hotel.room_count} rooms assigned</p>
                  <p style={{ fontSize: 12, color: "#8a9bb0", margin: "0 0 16px" }}>
                    Download each QR and print it for the corresponding room.
                  </p>
                  {Array.from({ length: hotel.room_count }, (_, i) => {
                    const roomNumber = i + (hotel.room_start || 101)
                    const url = `https://hotel-qr-menu-gamma.vercel.app/menu/${hotel.id}/${roomNumber}`
                    return (
                      <div key={roomNumber} style={{ ...d.qrCard, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}> 
                        <div style={d.qrInfo}>
                          <p style={d.qrRoom}>Room {roomNumber}</p>
                          <p style={d.qrUrl}>{url}</p>
                        </div>
                        <div style={d.qrBox}>
                          <QRCode id={`qr-${roomNumber}`} value={url} size={80} />
                          <button style={d.downloadBtn} onClick={() => downloadQR(roomNumber)}>Download</button>
                        </div>
                      </div>
                    )
                  })}
                </>
              )
            }
          </>
        )}

        {/* REPORTS TAB */}
{tab === "reports" && (
  <div style={tabContentStyle}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 8px" }}>
      <p style={{ ...d.sectionLabel, margin: 0 }}>Daily Report</p>
      <input
        type="date"
        style={{ ...d.input, padding: "6px 10px", fontSize: 12 }}
        value={reportDate}
        onChange={e => setReportDate(e.target.value)}
      />
    </div>

    {/* Summary cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
      <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
    <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>{reportOrders.filter(o => o.status === "delivered").length}</p>
    <p style={d.metricLabel}>Delivered</p>
  </div>
  <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
    <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>₹{reportOrders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)}</p>
    <p style={d.metricLabel}>Revenue</p>
  </div>
  <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
    <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>
      {reportOrders.filter(o => o.rating).length > 0
        ? (reportOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / reportOrders.filter(o => o.rating).length).toFixed(1)
        : "—"}
    </p>
    <p style={d.metricLabel}>Avg Rating ★</p>
  </div>
      <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
        <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>{reportOrders.length}</p>
  <p style={d.metricVal}>

    {reportOrders.filter(o => o.rating).length > 0
      ? (reportOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / reportOrders.filter(o => o.rating).length).toFixed(1)
      : "—"}
  </p>
  <p style={d.metricLabel}>Avg Rating ★</p>
</div>
    </div>

    {/* Most ordered items */}
    {(() => {
      const itemCounts = {}
      reportOrders.forEach(o => o.order_items.forEach(i => {
        const name = i.menu_items?.name || "Unknown"
        itemCounts[name] = (itemCounts[name] || 0) + i.quantity
      }))
      const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
      return sorted.length > 0 ? (
        <>
          <p style={d.sectionLabel}>Top Items</p>
          {sorted.map(([name, count]) => (
            <div key={name} style={{ ...d.card, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#1c2b3a" }}>{name}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>{count} ordered</span>
            </div>
          ))}
        </>
      ) : null
    })()}


    {/* Orders list */}
    <p style={d.sectionLabel}>All Orders ({reportOrders.length})</p>
    {reportOrders.length === 0 && <p style={d.empty}>No orders for this date.</p>}
{reportOrders.map(order => {
  const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
  const time = new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  return (
<div key={order.id} style={{ ...d.card, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
      <div style={d.cardHeader}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f4f6f9", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 500, color: "#1c2b3a" }}>
            🚪 Room {order.room_id}
          </div>
          {order.guest_name && (
            <p style={{ fontSize: 12, color: "#8a9bb0", margin: "6px 0 2px" }}>
              👤 {order.guest_name}{order.guest_phone ? ` · ${order.guest_phone}` : ""}
            </p>
          )}
          <p style={{ fontSize: 11, color: "#8a9bb0", margin: 0 }}>🕐 {time}</p>
        </div>
        <div style={{ textAlign: "right" }}>
  <span style={
    order.status === "delivered" ? d.badgeDone :
    order.status === "cancelled" || order.status === "rejected" ? d.badgeCancelled :
    order.status === "preparing" ? d.badgePrep : d.badgePending
  }>{order.status}</span>
  <p style={{ fontSize: 10, color: "#8a9bb0", margin: "4px 0 0" }}>🕐 Ordered: {time}</p>
  {order.delivered_at && (() => {
    const orderedAt = new Date(order.created_at)
    const deliveredAt = new Date(order.delivered_at)
    const actualMins = Math.round((deliveredAt - orderedAt) / 60000)
    const estimatedMins = order.order_items.reduce((max, i) => Math.max(max, i.menu_items?.prep_time || 15), 0)
    const onTime = actualMins <= estimatedMins
    return (
      <p style={{ fontSize: 10, color: onTime ? "#2e7d32" : "#c0392b", margin: "2px 0 0", fontWeight: 500 }}>
        {onTime ? "✓" : "⚠"} Delivered: {deliveredAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ({actualMins} min)
      </p>
    )
  })()}
</div>
      </div>
      <div style={{ borderTop: "0.5px solid #e2e8f0", borderBottom: "0.5px solid #e2e8f0", padding: "10px 0", margin: "10px 0", display: "flex", flexDirection: "column", gap: 5 }}>
        {order.order_items.map((item, i) => (
          <div key={i} style={d.itemRow}>
            <span>{item.menu_items?.name} x{item.quantity}</span>
            <span style={{ color: "#1c2b3a", fontWeight: 500 }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
        {order.special_instructions && (
          <p style={{ fontSize: 12, color: "#8a9bb0", margin: "6px 0 0" }}>📝 {order.special_instructions}</p>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1c2b3a" }}>
          <span style={{ fontSize: 12, color: "#8a9bb0", fontWeight: 400, marginRight: 4 }}>Total</span>
          ₹{orderTotal}
        </span>
        {order.rating && (
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#f5a623", fontSize: 15 }}>
              {"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)}
            </span>
            {order.rating_comment && (
              <p style={{ fontSize: 12, color: "#8a9bb0", margin: "4px 0 0" }}>"{order.rating_comment}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
})}

    {/* Download CSV */}
    {reportOrders.length > 0 && (
      <button style={{ ...d.addBtn, marginTop: 8 }} onClick={() => downloadCSV()}>
        ⬇ Download CSV
      </button>
    )}

    {/* ROOM CHECKOUT SUMMARY */}
    <p style={{ ...d.sectionLabel, marginTop: 24 }}>Room Checkout Summary</p>
    <p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 12px" }}>
      Enter a room number to see all orders placed during their stay.
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
  <div style={{ display: "flex", gap: 8 }}>
    <input
      style={{ ...d.input, flex: 1 }}
      placeholder="Guest phone number"
      type="tel"
      inputMode="numeric"
      maxLength={10}
      value={guestSearchPhone}
      onChange={e => {
        setGuestSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
        if (e.target.value) setRoomSummaryNumber("")
      }}
    />
    <span style={{ alignSelf: "center", color: "#8a9bb0", fontSize: 12 }}>or</span>
    <input
      style={{ ...d.input, flex: 1 }}
      placeholder="Room number"
      value={roomSummaryNumber}
      onChange={e => {
        setRoomSummaryNumber(e.target.value)
        if (e.target.value) setGuestSearchPhone("")
      }}
    />
  </div>
  <div style={{ display: "flex", gap: 8 }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px" }}>Check-in</p>
      <input
        type="date"
        style={{ ...d.input, width: "100%", boxSizing: "border-box" }}
        value={roomCheckIn}
        onChange={e => setRoomCheckIn(e.target.value)}
      />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px" }}>Check-out</p>
      <input
        type="date"
        style={{ ...d.input, width: "100%", boxSizing: "border-box" }}
        value={roomCheckOut}
        onChange={e => setRoomCheckOut(e.target.value)}
      />
    </div>
  </div>
  <button style={d.saveBtn} onClick={fetchRoomSummary}>
    {roomSummaryLoading ? "Searching..." : "Search"}
  </button>
</div>

    {roomSummaryOrders !== null && (
      <>
        {roomSummaryOrders.length === 0 ? (
          <p style={d.empty}>No orders found for Room {roomSummaryNumber}.</p>
        ) : (
          <>
            <div style={{ ...d.card, background: "#1c2b3a", color: "#e8f0f8" }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "#e8f0f8" }}>
  {roomSummaryOrders[0]?.guest_name || "Guest"} — Stay Summary
</p>
<p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px" }}>
  {guestSearchPhone ? `📞 ${guestSearchPhone}` : `🚪 Room ${roomSummaryNumber}`}
</p>
              <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 12px" }}>
                {new Date(roomSummaryOrders[0].created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {" → "}
                {new Date(roomSummaryOrders[roomSummaryOrders.length - 1].created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#7eb3f5", margin: "0 0 2px" }}>{roomSummaryOrders.length}</p>
                  <p style={{ fontSize: 10, color: "#8a9bb0", margin: 0 }}>Orders</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#6fcf97", margin: "0 0 2px" }}>
                    ₹{roomSummaryOrders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)}
                  </p>
                  <p style={{ fontSize: 10, color: "#8a9bb0", margin: 0 }}>Total Spent</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#f5a623", margin: "0 0 2px" }}>
                    {roomSummaryOrders.filter(o => o.rating).length > 0
                      ? (roomSummaryOrders.reduce((s, o) => s + (o.rating || 0), 0) / roomSummaryOrders.filter(o => o.rating).length).toFixed(1) + " ★"
                      : "—"}
                  </p>
                  <p style={{ fontSize: 10, color: "#8a9bb0", margin: 0 }}>Avg Rating</p>
                </div>
              </div>
            </div>

            {(() => {
              const itemCounts = {}
              roomSummaryOrders.forEach(o => o.order_items.forEach(i => {
                const name = i.menu_items?.name || "Unknown"
                if (!itemCounts[name]) itemCounts[name] = { qty: 0, total: 0 }
                itemCounts[name].qty += i.quantity
                itemCounts[name].total += i.price * i.quantity
              }))
              return (
                <>
                  <p style={d.sectionLabel}>Items Ordered</p>
                  {Object.entries(itemCounts).map(([name, data]) => (
                    <div key={name} style={{ ...d.card, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 13, color: "#1c2b3a", fontWeight: 500 }}>{name}</span>
                        <span style={{ fontSize: 11, color: "#8a9bb0", marginLeft: 8 }}>x{data.qty}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>₹{data.total}</span>
                    </div>
                  ))}
                </>
              )
            })()}

            <p style={d.sectionLabel}>Order Timeline</p>
            {roomSummaryOrders.map((order, idx) => {
              const orderTotal = order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
              const time = new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              return (
                <div key={order.id} style={{ ...d.card, borderLeft: "3px solid #1c2b3a" }}>
                  <div style={d.cardHeader}>
                    <p style={{ fontSize: 12, color: "#8a9bb0", margin: 0 }}>Order {idx + 1} · {time}</p>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>₹{orderTotal}</span>
                  </div>
                  {order.order_items.map((item, i) => (
                    <div key={i} style={d.itemRow}>
                      <span>{item.menu_items?.name} x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.special_instructions && (
                    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "6px 0 0" }}>📝 {order.special_instructions}</p>
                  )}
                  {order.rating && (
                    <p style={{ fontSize: 12, color: "#f5a623", margin: "6px 0 0" }}>{"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)}</p>
                  )}
                </div>
              )
            })}

            <button
              style={{ ...d.addBtn, marginTop: 8, width: "100%" }}
              onClick={() => {
                const lines = [`ROOM ${roomSummaryNumber} — CHECKOUT SUMMARY\n`]
                roomSummaryOrders.forEach((o, idx) => {
                  const time = new Date(o.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  lines.push(`Order ${idx + 1} — ${time}`)
                  o.order_items.forEach(i => lines.push(`  ${i.menu_items?.name} x${i.quantity} — ₹${i.price * i.quantity}`))
                  lines.push(`  Total: ₹${o.order_items.reduce((s, i) => s + i.price * i.quantity, 0)}\n`)
                })
                const grand = roomSummaryOrders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)
                lines.push(`GRAND TOTAL: ₹${grand}`)
                const win = window.open("", "_blank")
                win.document.write(`<pre style="font-family:monospace;padding:24px">${lines.join("\n")}</pre>`)
                win.print()
              }}
            >
              🖨️ Print Checkout Bill
            </button>
          </>
        )}
      </>
    )}
  </div>
)}

        {/* SETTINGS TAB */}
{tab === "settings" && (
  <div style={tabContentStyle}>
    <p style={d.sectionLabel}>Dashboard Appearance</p>
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: darkMode ? "#1c2b3a" : "#fff", border: "0.5px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
  <div>
    <p style={{ fontSize: 14, fontWeight: 500, color: darkMode ? "#e8f0f8" : "#1c2b3a", margin: "0 0 3px" }}>Dark Mode</p>
    <p style={{ fontSize: 12, color: "#8a9bb0", margin: 0 }}>Switch dashboard to dark theme</p>
  </div>
  <div
    onClick={() => setDarkMode(!darkMode)}
    style={{ width: 44, height: 24, borderRadius: 20, background: darkMode ? "#7eb3f5" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
  >
    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: darkMode ? 23 : 3, transition: "left 0.2s" }} />
  </div>
</div>
            <p style={d.sectionLabel}>Menu Theme</p>
            <p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
              Choose how your menu looks to guests. Changes apply immediately.
            </p>
            <div style={d.themeGrid}>
              {themes.map(t => {
                const isActive = (hotel?.theme || "dark-gold") === t.key
                return (
                  <div
                    key={t.key}
                    onClick={() => !savingTheme && saveTheme(t.key)}
                    style={{
                      ...d.themeCard,
                      outline: isActive ? "2px solid #1c2b3a" : "2px solid transparent",
                      opacity: savingTheme ? 0.6 : 1,
                      cursor: savingTheme ? "wait" : "pointer",
                    }}
                  >
                    <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                      {t.swatches.map((c, i) => (
                        <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                      ))}
                    </div>
                    <div style={d.themeName}>{t.label}</div>
                    {isActive && <div style={d.themeActiveBadge}>✓ Active</div>}
                  </div>
                )
              })}
            </div>
            {themeSaved && (
              <p style={{ color: "#2e7d32", fontSize: 13, textAlign: "center", marginTop: 8, fontWeight: 500 }}>
                ✓ Theme saved! Guests will see it immediately.
              </p>
            )}

<p style={{ ...d.sectionLabel, marginTop: 28 }}>Room Range</p>
<p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
  Set the starting room number. Rooms will go from this number up to {" "}
  <strong>{(hotel?.room_start || 101) + (hotel?.room_count || 0) - 1}</strong>.
</p>
<div style={d.form}>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 6px" }}>Start room</p>
      <input
        style={d.input}
        type="number"
        value={hotel?.room_start || 101}
        onChange={e => setHotel(prev => ({ ...prev, room_start: parseInt(e.target.value) || 101 }))}
      />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 6px" }}>End room</p>
      <input
        style={{ ...d.input, background: "#f0f0f0", color: "#aaa" }}
        type="number"
        value={(hotel?.room_start || 101) + (hotel?.room_count || 0) - 1}
        disabled
      />
    </div>
  </div>
  <button
    style={d.saveBtn}
    onClick={async () => {
      await supabase.from("hotels").update({ room_start: hotel.room_start }).eq("id", hotel.id)
      setThemeSaved(true)
      setTimeout(() => setThemeSaved(false), 2500)
    }}
  >
    Save Room Range
  </button>
</div>

          </div>
        )}

        {/* TEMPLATE PREVIEW MODAL */}
        {previewTemplate && (
          <div style={d.modalOverlay}>
            <div style={{ ...d.modal, maxHeight: "80vh", overflowY: "auto" }}>
              <p style={d.modalTitle}>{menuTemplates[previewTemplate].label}</p>
              <p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
                Uncheck items you don't want to add.
              </p>
              {menuTemplates[previewTemplate].items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(i)}
                    onChange={() => setSelectedItems(prev =>
                      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                    )}
                    style={{ marginTop: 3, accentColor: "#1c2b3a", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#8a9bb0" }}>{item.category} · ₹{item.price} · {item.prep_time} min</div>
                    {item.description && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{item.description}</div>}
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                <span style={{ fontSize: 12, color: "#8a9bb0" }}>{selectedItems.length} items selected</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={d.cancelBtn} onClick={() => setPreviewTemplate(null)}>Cancel</button>
                  <button style={{ ...d.saveBtn, opacity: selectedItems.length === 0 ? 0.4 : 1 }} onClick={applyTemplate} disabled={selectedItems.length === 0}>
                    Add {selectedItems.length} Items
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                    <button style={d.btnDeliver} onClick={() => updateHotel(h.id, { status: "active" })}>✓ Approve</button>
                  )}
                  {h.status === "active" && !h.is_admin && (
                    <button style={d.btnPrepare} onClick={() => updateHotel(h.id, { status: "disabled" })}>Disable</button>
                  )}
                  {h.status === "disabled" && (
                    <button style={d.btnDeliver} onClick={() => updateHotel(h.id, { status: "active" })}>Re-enable</button>
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
  metricVal: { fontSize: 24, fontWeight: 600, color: "#1c2b3a", margin: "0 0 3px", transition: "color 0.2s" },
  metricLabel: { fontSize: 13, color: "#8a9bb0", margin: 0 },
 tabs: { display: "flex", background: "#fff", padding: "10px 14px", overflowX: "auto", gap: 6, borderBottom: "0.5px solid #e2e8f0" },
  tab: { padding: "8px 16px", fontSize: 13, color: "#8a9bb0", background: "none", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 400, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
  tabActive: { padding: "8px 16px", fontSize: 13, color: "#fff", background: "#1c2b3a", border: "1px solid #1c2b3a", borderRadius: 8, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
  body: { padding: "0 14px 40px" },
  sectionLabel: { fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8a9bb0", fontWeight: 500, margin: "16px 0 8px" },
  card: { background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, border: "0.5px solid #e2e8f0" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  room: { fontSize: 16, fontWeight: 600, color: "#1c2b3a", margin: 0 },
  badgePending: { background: "#fff3e0", color: "#b45309", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgePrep: { background: "#e0f2fe", color: "#0369a1", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgeDone: { background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  badgeCancelled: { background: "#fce4e4", color: "#c0392b", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  items: { marginBottom: 8 },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: 15, color: "#8a9bb0", marginBottom: 4 },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600, color: "#1c2b3a", borderTop: "0.5px solid #eee", paddingTop: 8, marginBottom: 10 },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  btnPrepare: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  btnDeliver: { background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  btnReject: { background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  timeAgo: { fontSize: 13, color: "#8a9bb0", margin: 0 },
  empty: { textAlign: "center", color: "#8a9bb0", marginTop: 30, fontSize: 16 },
  form: { background: "#fff", borderRadius: 14, padding: 14, marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 8 },
  input: { background: "#f4f6f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#1c2b3a", outline: "none" },
  addBtn: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  menuCard: { background: "#fff", borderRadius: 14, padding: 12, marginBottom: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 },
  menuImgPlaceholder: { width: 52, height: 52, borderRadius: 8, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 13, fontWeight: 600, color: "#1c2b3a", margin: "0 0 3px" },
  menuMeta: { fontSize: 11, color: "#8a9bb0", margin: 0 },
  menuActions: { display: "flex", alignItems: "center", gap: 6 },
  btnOn: { background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnOff: { background: "#fce4e4", color: "#c0392b", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnStock: { background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer" },
  btnNoStock: { background: "#fff3e0", color: "#b45309", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer" },
  btnDelete: { background: "none", border: "none", fontSize: 16, cursor: "pointer" },
  btnEdit: { background: "none", border: "none", fontSize: 14, cursor: "pointer" },
  adminRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  adminLabel: { fontSize: 12, color: "#8a9bb0" },
  roomInput: { width: 60, background: "#f4f6f9", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", fontSize: 13, textAlign: "center" },
  hotelId: { fontSize: 10, color: "#8a9bb0", fontFamily: "monospace", background: "#f4f6f9", padding: "3px 8px", borderRadius: 6 },
  qrCard: { background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  qrInfo: { flex: 1 },
  qrRoom: { fontSize: 14, fontWeight: 600, color: "#1c2b3a", margin: "0 0 4px" },
  qrUrl: { fontSize: 10, color: "#8a9bb0", margin: 0, wordBreak: "break-all", maxWidth: 200 },
  qrBox: { flexShrink: 0, marginLeft: 12 },
  downloadBtn: { display: "block", marginTop: 6, background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 10, cursor: "pointer", width: "100%" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 8 },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#1c2b3a", margin: "0 0 8px" },
  saveBtn: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  cancelBtn: { background: "none", color: "#8a9bb0", border: "none", borderRadius: 8, padding: "8px", fontSize: 13, cursor: "pointer" },
  toggleBtn: { background: "none", border: "1px solid #e2e8f0", color: "#8a9bb0", borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer" },
  btnSpecialOn: { background: "#fffbeb", color: "#b45309", border: "1px solid #fcd34d", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnSpecialOff: { background: "#f4f6f9", color: "#8a9bb0", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" },
  btnSuggest: { background: "#fffbeb", color: "#b45309", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 12px", fontSize: 14, cursor: "pointer", flexShrink: 0 },
  templateToggleBtn: { background: "#f0f4ff", color: "#1c2b3a", border: "1px solid #dce4f0", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  templateGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 },
  templateCard: { background: "#fff", borderRadius: 12, padding: "16px 12px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", textAlign: "center", display: "flex", flexDirection: "column", gap: 6, alignItems: "center" },
  templateEmoji: { fontSize: 24 },
  templateLabel: { fontSize: 12, fontWeight: 600, color: "#1c2b3a" },
  templateCount: { fontSize: 10, color: "#8a9bb0" },
  templateBtn: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 500, cursor: "pointer", marginTop: 4 },
  // Theme picker
  themeGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 },
  themeCard: { background: "#fff", borderRadius: 14, padding: "16px 14px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "outline 0.15s" },
  themeName: { fontSize: 13, fontWeight: 600, color: "#1c2b3a" },
  themeActiveBadge: { fontSize: 10, color: "#2e7d32", background: "#e8f5e9", padding: "2px 10px", borderRadius: 20, marginTop: 4 },
  btnVeg: { background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnNonVeg: { background: "#fce4e4", color: "#c0392b", border: "1px solid #ef9a9a", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" },
  btnOnWay: { background: "#ede7f6", color: "#5e35b1", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  badgeOnWay: { background: "#ede7f6", color: "#5e35b1", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
}