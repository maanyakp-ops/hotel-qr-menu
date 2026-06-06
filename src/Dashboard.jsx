  import { useEffect, useState } from "react"
  import { supabase } from "./supabase"
  import { QRCodeSVG as QRCode } from "qrcode.react"


  export default function Dashboard({ onBack, demoMode = false, demoHotelId = null }) {
    const today = new Date().toISOString().split("T")[0]
    const [darkMode, setDarkMode] = useState(false)
    const [orders, setOrders] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [hotel, setHotel] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState("orders")
    const [newItem, setNewItem] = useState({ name: "", category: "", price: "", prep_time: "15", description: "", gst_rate: 5 })
    const [adding, setAdding] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [allHotels, setAllHotels] = useState([])
    const [editItem, setEditItem] = useState(null)
    const [showAll, setShowAll] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)
    const [previewTemplate, setPreviewTemplate] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [savingTheme, setSavingTheme] = useState(false)
  const [dashFontScale, setDashFontScale] = useState(1)
  const [themeSaved, setThemeSaved] = useState(false)
  const [hotelDetailsSaved, setHotelDetailsSaved] = useState(false)
    const [rejectingOrder, setRejectingOrder] = useState(null)
    const [rejectReason, setRejectReason] = useState("")
    const [customReason, setCustomReason] = useState("")
    const [roomSummaryNumber, setRoomSummaryNumber] = useState("")
    const [roomSummaryOrders, setRoomSummaryOrders] = useState(null)
    const [roomSummaryLoading, setRoomSummaryLoading] = useState(false)
    const [roomCheckIn, setRoomCheckIn] = useState(today)
    const [roomCheckOut, setRoomCheckOut] = useState(today)
    const [guestSearchPhone, setGuestSearchPhone] = useState("")
    const [editingTemplateItem, setEditingTemplateItem] = useState(null)
    const [templateItemEdits, setTemplateItemEdits] = useState({})
    const DEFAULT_GST_RATES = { "Main Course": 5, "Starters": 5, "Desserts": 5, "Beverages": 5, "Packaged": 12, "Alcohol": 18, "Other": 5, }
    const [gstRates, setGstRates] = useState(hotel?.gst_category_rates || DEFAULT_GST_RATES)
    const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false)
    const [customerSearch, setCustomerSearch] = useState("")
    const [allCustomers, setAllCustomers] = useState([])
    const [customersLoading, setCustomersLoading] = useState(false)
    const [customersLoaded, setCustomersLoaded] = useState(false)

  function playOrderSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    
    const times = [0, 0.18, 0.36]
    times.forEach(t => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "square"
      osc.frequency.setValueAtTime(880, ctx.currentTime + t)
      osc.frequency.setValueAtTime(1100, ctx.currentTime + t + 0.06)
      osc.frequency.setValueAtTime(880, ctx.currentTime + t + 0.12)
      gain.gain.setValueAtTime(0, ctx.currentTime + t)
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.16)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.18)
    })
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

  useEffect(() => {
    if (!hotel || tab !== "orders") return
    const interval = setInterval(() => fetchOrders(hotel.id, showAll), 5000)
    return () => clearInterval(interval)
  }, [hotel, tab, showAll])



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
        { name: "Poha", category: "Breakfast", price: 60, prep_time: 10, description: "Light, fluffy flattened rice with mustard seeds and fresh coriander.", image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80" },
        { name: "Upma", category: "Breakfast", price: 70, prep_time: 10, description: "Savory semolina porridge with vegetables and curry leaves.", image_url: "https://images.unsplash.com/photo-1694825802979-6c30db36de04?w=400&q=80" },
        { name: "Idli Sambhar", category: "Breakfast", price: 90, prep_time: 10, description: "Steamed rice cakes served with hot sambhar and coconut chutney.", image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80" },
        { name: "Bread Toast", category: "Breakfast", price: 40, prep_time: 5, description: "Crispy toasted bread served with butter and jam.", image_url: "https://images.unsplash.com/photo-1484723091739-30990ff14f86?w=400&q=80" },
        { name: "Masala Omelette", is_veg: false, category: "Breakfast", price: 70, prep_time: 10, description: "Farm fresh eggs with onions, tomatoes and green chilli.", image_url: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80" },
        { name: "Aloo Paratha", category: "Breakfast", price: 80, prep_time: 15, description: "Stuffed whole wheat flatbread with spiced potato filling.", image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
        { name: "Continental Breakfast", category: "Breakfast", price: 250, prep_time: 15, description: "Croissant, toast, eggs, juice and coffee served together.", image_url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80" },
        { name: "Fresh Fruit Platter", category: "Breakfast", price: 180, prep_time: 10, description: "Seasonal fresh fruits, elegantly arranged.", image_url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80" },
        { name: "Pancakes", category: "Breakfast", price: 120, prep_time: 15, description: "Fluffy pancakes served with maple syrup and butter.", image_url: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80" },
      ]
    },
    starters: {
      label: "Starters",
      emoji: "🥗",
      items: [
        { name: "Paneer Tikka", category: "Starters", price: 220, prep_time: 20, description: "Tandoor-charred paneer with bell peppers and mint chutney.", image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80" },
        { name: "Veg Spring Rolls", category: "Starters", price: 130, prep_time: 15, description: "Crispy rolls filled with stir-fried vegetables.", image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80" },
        { name: "Samosa", category: "Starters", price: 50, prep_time: 5, description: "Crispy fried pastry filled with spiced potatoes.", image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80" },
        { name: "Hara Bhara Kabab", category: "Starters", price: 160, prep_time: 15, description: "Soft spinach and pea patties with a crispy coating.", image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80" },
        { name: "Chicken Tikka", is_veg: false, category: "Starters", price: 280, prep_time: 20, description: "Juicy chicken marinated in spices, grilled in tandoor.", image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80" },
        { name: "Fish Fingers", is_veg: false, category: "Starters", price: 260, prep_time: 20, description: "Crispy battered fish fingers served with tartar sauce.", image_url: "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400&q=80" },
        { name: "Veg Seekh Kabab", category: "Starters", price: 180, prep_time: 20, description: "Spiced vegetable skewers grilled to perfection.", image_url: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=80" },
        { name: "Chilli Paneer", category: "Starters", price: 200, prep_time: 15, description: "Indo-Chinese style paneer tossed with peppers and sauces.", image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80" },
      ]
    },
    maincourse: {
      label: "Main Course",
      emoji: "🍛",
      items: [
        { name: "Dal Makhani", category: "Main Course", price: 180, prep_time: 25, description: "Slow-cooked black lentils in a rich, buttery tomato gravy.", image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80" },
        { name: "Paneer Butter Masala", category: "Main Course", price: 210, prep_time: 20, description: "Soft paneer in a velvety, spiced tomato-butter sauce.", image_url: "https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=400&q=80" },
        { name: "Butter Chicken", is_veg: false, category: "Main Course", price: 280, prep_time: 25, description: "Tender chicken in a rich, aromatic tomato-butter gravy.", image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80" },
        { name: "Veg Biryani", category: "Main Course", price: 220, prep_time: 30, description: "Fragrant basmati rice layered with spiced vegetables and saffron.", image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80" },
        { name: "Chicken Biryani", is_veg: false, category: "Main Course", price: 280, prep_time: 30, description: "Aromatic basmati rice slow-cooked with tender chicken.", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80" },
        { name: "Dal Tadka", category: "Main Course", price: 140, prep_time: 20, description: "Yellow lentils tempered with cumin, garlic and dried chilli.", image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80" },
        { name: "Butter Naan", category: "Main Course", price: 50, prep_time: 10, description: "Leavened bread baked in tandoor, finished with butter.", image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80" },
        { name: "Garlic Naan", category: "Main Course", price: 60, prep_time: 10, description: "Tandoor-baked naan topped with roasted garlic and coriander.", image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
        { name: "Jeera Rice", category: "Main Course", price: 120, prep_time: 15, description: "Fragrant basmati rice tempered with cumin seeds.", image_url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80" },
        { name: "Roti", category: "Main Course", price: 20, prep_time: 5, description: "Freshly made whole wheat flatbread.", image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
        { name: "Mutton Rogan Josh", is_veg: false, category: "Main Course", price: 360, prep_time: 35, description: "Slow-cooked mutton in a bold Kashmiri spiced gravy.", image_url: "https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80" },
      ]
    },
    soups: {
      label: "Soups & Salads",
      emoji: "🥣",
      items: [
        { name: "Tomato Soup", category: "Soups & Salads", price: 110, prep_time: 10, description: "Creamy, slow-cooked tomato soup with croutons.", image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80" },
        { name: "Sweet Corn Soup", category: "Soups & Salads", price: 120, prep_time: 10, description: "Thick, comforting sweet corn soup with a hint of pepper.", image_url: "https://images.unsplash.com/photo-1588566565463-180a5b5f5a3e?w=400&q=80" },
        { name: "Hot & Sour Soup", category: "Soups & Salads", price: 120, prep_time: 10, description: "Indo-Chinese style tangy and spicy broth with vegetables.", image_url: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&q=80" },
        { name: "Manchow Soup", category: "Soups & Salads", price: 130, prep_time: 12, description: "Spicy noodle soup topped with crispy fried noodles.", image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
        { name: "Green Salad", category: "Soups & Salads", price: 90, prep_time: 5, description: "Fresh garden vegetables with lemon dressing.", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
        { name: "Caesar Salad", category: "Soups & Salads", price: 160, prep_time: 10, description: "Crisp romaine, croutons and parmesan with Caesar dressing.", image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80" },
        { name: "Fruit Salad", category: "Soups & Salads", price: 120, prep_time: 5, description: "Seasonal fresh fruits with a squeeze of lime.", image_url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80" },
      ]
    },
    beverages: {
      label: "Beverages",
      emoji: "☕",
      items: [
        { name: "Masala Chai", category: "Beverages", price: 40, prep_time: 5, description: "Hot, aromatic tea brewed with ginger and spices.", image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80" },
        { name: "Coffee", category: "Beverages", price: 50, prep_time: 5, description: "Freshly brewed hot coffee.", image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80" },
        { name: "Cold Coffee", category: "Beverages", price: 90, prep_time: 5, description: "Chilled blended coffee with ice cream.", image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
        { name: "Fresh Lime Soda", category: "Beverages", price: 70, prep_time: 3, description: "Freshly squeezed lime with soda, sweet or salted.", image_url: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400&q=80" },
        { name: "Fresh Orange Juice", category: "Beverages", price: 120, prep_time: 5, description: "Freshly squeezed orange juice, served chilled.", image_url: "https://images.unsplash.com/photo-1534353473418-4cfa0c6e06c4?w=400&q=80" },
        { name: "Mango Lassi", category: "Beverages", price: 90, prep_time: 5, description: "Thick, creamy yogurt blended with fresh mango pulp.", image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80" },
        { name: "Buttermilk", category: "Beverages", price: 50, prep_time: 3, description: "Chilled spiced buttermilk with curry leaves and ginger.", image_url: "https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?w=400&q=80" },
        { name: "Cold Drink", category: "Beverages", price: 50, prep_time: 2, description: "Chilled soft drink of your choice.", image_url: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&q=80" },
        { name: "Mineral Water", category: "Beverages", price: 30, prep_time: 1, description: "500ml chilled mineral water bottle.", image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80" },
        { name: "Mocktail of the Day", category: "Beverages", price: 160, prep_time: 8, description: "Chef's special non-alcoholic blend, served chilled.", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80" },
      ]
    },
    snacks: {
      label: "Snacks",
      emoji: "🍟",
      items: [
        { name: "French Fries", category: "Snacks", price: 100, prep_time: 12, description: "Golden, crispy fries served with ketchup.", image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80" },
        { name: "Veg Sandwich", category: "Snacks", price: 90, prep_time: 10, description: "Grilled sandwich with fresh vegetables and cheese.", image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80" },
        { name: "Bread Pakoda", category: "Snacks", price: 60, prep_time: 10, description: "Golden fried bread stuffed with spiced filling.", image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80" },
        { name: "Pav Bhaji", category: "Snacks", price: 110, prep_time: 15, description: "Spiced mashed vegetable curry served with buttered pav.", image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80" },
        { name: "Veg Burger", category: "Snacks", price: 120, prep_time: 12, description: "Crispy veg patty with fresh toppings in a soft bun.", image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80" },
        { name: "Chicken Sandwich", is_veg: false, category: "Snacks", price: 150, prep_time: 12, description: "Grilled chicken with lettuce and sauce in toasted bread.", image_url: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=400&q=80" },
        { name: "Nachos with Salsa", category: "Snacks", price: 130, prep_time: 8, description: "Crispy nachos served with fresh tomato salsa and sour cream.", image_url: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80" },
      ]
    },
    desserts: {
      label: "Desserts",
      emoji: "🍮",
      items: [
        { name: "Gulab Jamun", category: "Desserts", price: 100, prep_time: 5, description: "Soft milk dumplings soaked in rose-scented sugar syrup.", image_url: "https://images.unsplash.com/photo-1666361009712-a8ae8d5d0ea3?w=400&q=80" },
        { name: "Chocolate Brownie", category: "Desserts", price: 160, prep_time: 8, description: "Warm dark chocolate brownie served with vanilla ice cream.", image_url: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80" },
        { name: "Ice Cream", category: "Desserts", price: 120, prep_time: 3, description: "Choice of vanilla, chocolate or strawberry, served with wafer.", image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80" },
        { name: "Rasgulla", category: "Desserts", price: 90, prep_time: 5, description: "Soft spongy cottage cheese balls in light sugar syrup.", image_url: "https://images.unsplash.com/photo-1666361009712-a8ae8d5d0ea3?w=400&q=80" },
        { name: "Kheer", category: "Desserts", price: 110, prep_time: 5, description: "Creamy rice pudding with cardamom and dry fruits.", image_url: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80" },
        { name: "Gajar Halwa", category: "Desserts", price: 120, prep_time: 8, description: "Slow-cooked carrot pudding with ghee and nuts.", image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80" },
        { name: "Cheesecake", category: "Desserts", price: 180, prep_time: 5, description: "Creamy baked cheesecake with a buttery biscuit base.", image_url: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&q=80" },
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
        ...templateItemEdits[i],
        price: parseFloat(templateItemEdits[i]?.price ?? menuTemplates[previewTemplate].items[i].price),
        prep_time: parseInt(templateItemEdits[i]?.prep_time ?? menuTemplates[previewTemplate].items[i].prep_time) || 15,
        hotel_id: hotel.id,
        available: true,
        is_special: false
      }))
      await supabase.from("menu_items").insert(items)
      fetchMenu(hotel.id)
      setPreviewTemplate(null)
      setShowTemplates(false)
      setTemplateItemEdits({})
      setEditingTemplateItem(null)
    }

async function loadHotel() {
  document.addEventListener("click", () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctx.resume()
  }, { once: true })

  // If demoMode, load demo hotel instead
  if (demoMode && demoHotelId) {
    const { data: hotelData } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", demoHotelId)
      .single()
    setHotel(hotelData)
    setIsAdmin(hotelData?.is_admin || false)
    fetchOrders(hotelData.id)
    fetchMenu(hotelData.id)
    return
  }

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

    if (hotelData?.gst_category_rates) {
  setGstRates({
    ...DEFAULT_GST_RATES,
    ...hotelData.gst_category_rates
  })
}  

  setTimeout(() => {
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
    if (payload.new.status === "pending" && payload.old?.status === "hold") {
      fetchOrders(hotelData.id)
      playOrderSound()
      showBadge()
    }
  })
  .subscribe((status) => {
    console.log("Subscription status:", status)
  })

    return () => supabase.removeChannel(sub)
  }, 1000)
  }

    async function fetchOrders(hotelId, all = false) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
    
      let query = supabase
    .from("orders")
    .select(`*, order_items!fk_order(quantity, price, menu_item_id, menu_items!fk_menu_item(name))`)
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
        gst_rate: editingItem.gst_rate || 5,
        prep_time: parseInt(editItem.prep_time) || 15,
        description: editItem.description || null,
        is_special: editItem.is_special || false,
        is_veg: editItem.is_veg !== false ? true : false,
        image_url: editItem.image_url || null,
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
        gst_rate: newItem.gst_rate,
        prep_time: parseInt(newItem.prep_time) || 15,
        description: newItem.description || null,
        image_url: newItem.image_url || null,
        is_special: newItem.is_special || false,
        available: true,
        is_veg: newItem.is_veg !== false ? true : false,
      })
      setNewItem({ name: "", category: "", price: "", gst_rate: 5, prep_time: "15", description: "", is_special: false, image_url: "" })
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
    .select(`*, delivered_at, order_items!fk_order(quantity, price, menu_item_id, menu_items!fk_menu_item(name, prep_time))`)
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
      .select(`*, order_items!fk_order(quantity, price, menu_item_id, menu_items!fk_menu_item(name))`)
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
  async function fetchAllCustomers() {
    setCustomersLoading(true)
    setCustomersLoaded(false)
    const { data, error } = await supabase
      .from("orders")
      .select(`id, guest_name, guest_phone, guest_email, room_id, rating, rating_comment, created_at, order_items!fk_order(quantity, price, menu_item_id, menu_items!fk_menu_item(name))`)
      .eq("hotel_id", hotel.id)
      .neq("status", "hold")
      .neq("status", "cancelled")
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
    if (error) console.error("Customer DB error:", error)

    if (data) {
      const customerMap = {}
      data.forEach(order => {
        const key = order.guest_phone || order.guest_name || order.id
        if (!customerMap[key]) {
          customerMap[key] = {
            name: order.guest_name || "—",
            phone: order.guest_phone || "—",
            email: order.guest_email || "—",
            rooms: new Set(),
            orders: [],
            totalSpent: 0,
          }
        }
        customerMap[key].rooms.add(order.room_id)
        customerMap[key].orders.push(order)
        customerMap[key].totalSpent += order.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
      })
      setAllCustomers(Object.values(customerMap))
    }
    setCustomersLoading(false)
    setCustomersLoaded(true)
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
    { key: "dark-gold", label: "Dark Gold", swatches: ["#0D0C0A", "#141310", "#C9A84C", "#EDE8DC"] },
    { key: "la-belle",  label: "La Belle",  swatches: ["#fffaf8", "#ffffff", "#e88d95", "#f5c4cb"] },
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

{demoMode && (
  <div style={{ background: "#fff3e0", border: "1px solid #fcd34d", padding: "10px 14px", margin: "0 14px 8px", borderRadius: 8, fontSize: 12, color: "#b45309" }}>
    📌 Demo Mode: Editing "{hotel?.name}" · Add items with templates and test ordering
  </div>
)}

  {tab !== "reports" && (
  <div style={{ ...d.metrics, gridTemplateColumns: "repeat(4,1fr)", background: "#f0f4f8", padding: "12px 16px", gap: 12 }}>
    <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
      <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>{orders.length}</p>
      <p style={d.metricLabel}>Orders today</p>
    </div>
    <div style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0" }}>
      <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>{active.length}</p>
      <p style={d.metricLabel}>Active now</p>
    </div>
    <div
      style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0", cursor: "pointer", position: "relative" }}
      onClick={() => setShowRevenueBreakdown(true)}
    >
      <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>₹{(revenue / 1000).toFixed(1)}k</p>
      <p style={d.metricLabel}>Revenue ⓘ</p>
    </div>

    {showRevenueBreakdown && (() => {
      const gstOrders = orders.filter(o => o.status !== "cancelled" && o.status !== "rejected")
      let totalGst = 0
      gstOrders.forEach(order => {
        order.order_items.forEach(item => {
          const itemTotal = item.price * item.quantity
          const menuItem = menuItems.find(m => m.id === item.menu_item_id)
          const gstRate = menuItem?.gst_rate || 5
          totalGst += (itemTotal * gstRate) / 100
        })
      })
      const cgst = totalGst / 2
      const sgst = totalGst / 2
      const baseRevenue = revenue - totalGst
      const pat = baseRevenue

      return (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={() => setShowRevenueBreakdown(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: 16, padding: 24, width: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1c2b3a", margin: "0 0 16px" }}>Revenue Breakdown</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#8a9bb0" }}>Gross Revenue</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>₹{revenue.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: "1px dashed #e2e8f0", margin: "10px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#8a9bb0" }}>CGST (payable)</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#c0392b" }}>- ₹{cgst.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#8a9bb0" }}>SGST (payable)</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#c0392b" }}>- ₹{sgst.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#8a9bb0" }}>Total GST</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#c0392b" }}>- ₹{totalGst.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: "2px solid #1c2b3a", margin: "10px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a" }}>PAT (Post-GST)</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2e7d32" }}>₹{pat.toFixed(2)}</span>
            </div>

            <p style={{ fontSize: 10, color: "#8a9bb0", margin: "12px 0 0", textAlign: "center" }}>
              Based on GST % set per menu item · Today's orders only
            </p>

            <button
              style={{ marginTop: 16, width: "100%", background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              onClick={() => setShowRevenueBreakdown(false)}
            >
              Close
            </button>
          </div>
        </div>
      )
    })()}
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

        <div
  style={{
    ...d.body,
    background: darkMode ? "#0f1923" : "#f4f6f9",
    fontSize: `${dashFontScale * 13}px`,
    zoom: dashFontScale
  }}
>
    <style>{`
    @keyframes fadeSlide { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
    
  `}</style>

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
  <div
    key={order.id}
    style={{
      ...d.card,
      background: darkMode ? "#111f2c" : "#fff",
      border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0"
    }}
  >
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
            <div style={{ borderTop: "0.5px solid #f0f0f0", padding: "8px 0", margin: "8px 0" }}>
  {order.order_items.map((item, i) => (
    <div key={i} style={d.itemRow}>
      <span>{item.menu_items?.name} x{item.quantity}</span>
      <span style={{ color: "#1c2b3a", fontWeight: 500 }}>₹{item.price * item.quantity}</span>
    </div>
  ))}
</div>
            <p style={{ fontSize: 11, color: "#8a9bb0", margin: 0 }}>
              🕐 {mins < 1 ? "Just now" : `${mins} min ago`}
            </p>
          </div>
          <span style={order.status === "pending" ? d.badgePending : order.status === "on_the_way" ? d.badgeOnWay : d.badgePrep}>
            {order.status === "pending" ? "Pending" : order.status === "on_the_way" ? "On the Way" : "Preparing"}
          </span>
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

              <div style={d.form}>
  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px", fontWeight: 500 }}>Item Photo (optional)</p>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {newItem.image_url && (
        <img src={newItem.image_url} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }} />
      )}
      <label style={{ background: "#f0f4ff", border: "1px solid #dce4f0", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "#1c2b3a", fontWeight: 500 }}>
        {newItem.image_url ? "Change Photo" : "📷 Upload Photo"}
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
          const file = e.target.files[0]
          if (!file) return
          const ext = file.name.split(".").pop()
          const path = `${hotel.id}/${Date.now()}.${ext}`
          const { error } = await supabase.storage.from("menu-images").upload(path, file)
          if (error) { alert("Upload failed"); return }
          const { data } = supabase.storage.from("menu-images").getPublicUrl(path)
          setNewItem(prev => ({ ...prev, image_url: data.publicUrl }))
        }} />
      </label>
      {newItem.image_url && (
        <button type="button" style={{ background: "none", border: "none", color: "#c0392b", fontSize: 12, cursor: "pointer" }} onClick={() => setNewItem(prev => ({ ...prev, image_url: "" }))}>Remove</button>
      )}
    </div>
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px", fontWeight: 500 }}>Item Name</p>
    <input style={d.input} placeholder="e.g. Butter Chicken" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px", fontWeight: 500 }}>Category</p>
    <select style={d.input} value={newItem.category} onChange={(e) => {
      const category = e.target.value
      const gst = hotel?.gst_category_rates?.[category] ?? DEFAULT_GST_RATES[category] ?? 5
      setNewItem({ ...newItem, category, gst_rate: gst })
    }}>
      <option value="">Select Category</option>
      {["Breakfast", "Starters", "Main Course", "Breads", "Rice & Biryani", "Snacks", "Desserts", "Beverages"].map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
      {menuItems.map(i => i.category).filter((c, idx, arr) => c && arr.indexOf(c) === idx && !["Breakfast", "Starters", "Main Course", "Breads", "Rice & Biryani", "Snacks", "Desserts", "Beverages"].includes(c)).map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px", fontWeight: 500 }}>Price (₹)</p>
    <input style={d.input} placeholder="e.g. 250" type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px", fontWeight: 500 }}>GST %</p>
    <input style={d.input} type="number" value={newItem.gst_rate} onChange={(e) => setNewItem({...newItem, gst_rate: Number(e.target.value)})} />
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px", fontWeight: 500 }}>Prep Time (minutes)</p>
    <input style={d.input} placeholder="e.g. 15" type="number" value={newItem.prep_time} onChange={e => setNewItem({ ...newItem, prep_time: e.target.value })} />
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 4px", fontWeight: 500 }}>Description (optional)</p>
    <div style={{ display: "flex", gap: 6 }}>
      <input style={{ ...d.input, flex: 1 }} placeholder="e.g. Tender chicken in a rich tomato gravy" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
      <button type="button" style={d.btnSuggest} onClick={() => suggestDescription(newItem.name, newItem.category, "new")}>Suggest</button>
    </div>
  </div>

  <button type="button" style={newItem.is_special ? d.btnSpecialOn : d.btnSpecialOff} onClick={() => setNewItem({ ...newItem, is_special: !newItem.is_special })}>
    {newItem.is_special ? "⭐ Marked as Special" : "☆ Mark as Special"}
  </button>

  <button type="button" style={newItem.is_veg !== false ? d.btnVeg : d.btnNonVeg} onClick={() => setNewItem({ ...newItem, is_veg: newItem.is_veg === false ? true : false })}>
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
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
    {editItem.image_url && (
      <img src={editItem.image_url} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }} />
    )}
    <label style={{ background: "#f0f4ff", border: "1px solid #dce4f0", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "#1c2b3a", fontWeight: 500 }}>
      {editItem.image_url ? "Change Photo" : "📷 Upload Photo"}
      <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
        const file = e.target.files[0]
        if (!file) return
        const ext = file.name.split(".").pop()
        const path = `${hotel.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from("menu-images").upload(path, file)
        if (error) { alert("Upload failed"); return }
        const { data } = supabase.storage.from("menu-images").getPublicUrl(path)
        setEditItem(prev => ({ ...prev, image_url: data.publicUrl }))
      }} />
    </label>
    {editItem.image_url && (
      <button type="button" style={{ background: "none", border: "none", color: "#c0392b", fontSize: 12, cursor: "pointer" }} onClick={() => setEditItem(prev => ({ ...prev, image_url: null }))}>Remove</button>
    )}
  </div>
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
: (hotel?.room_ranges || []).length === 0 && !hotel?.room_count
? <p style={d.empty}>No rooms assigned yet. Contact support to get your rooms activated.</p>
  : (
    <>
<p style={d.sectionLabel}>
  {hotel?.room_ranges?.length > 0
    ? (hotel.room_ranges || []).reduce((sum, r) => sum + (r.end - r.start + 1), 0)
    : hotel?.room_count || 0} total rooms
</p>
      <p style={{ fontSize: 12, color: "#8a9bb0", margin: "0 0 16px" }}>
        Download QR codes for each room.
      </p>
    {(() => {
  const allRooms = []
  if (hotel?.room_ranges?.length > 0) {
    hotel.room_ranges.forEach(range => {
      for (let i = range.start; i <= range.end; i++) allRooms.push(i)
    })
  } else {
    for (let i = 0; i < (hotel?.room_count || 0); i++) {
      allRooms.push(i + (hotel?.room_start || 101))
    }
  }
  return allRooms.map(roomNumber => {
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
  })
})()}
</>
)
}
</>
)}

          {/* REPORTS TAB */}
          {tab === "reports" && (
    <div style={tabContentStyle}>

      {/* DAILY REPORT */}
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
        <div
          style={{ ...d.metric, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0", cursor: "pointer" }}
          onClick={() => setShowRevenueBreakdown(true)}
        >
          <p style={{ ...d.metricVal, color: darkMode ? "#e8f0f8" : "#1c2b3a" }}>
            ₹{reportOrders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)}
          </p>
          <p style={d.metricLabel}>Revenue ⓘ</p>
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
          <p style={d.metricLabel}>Total Orders</p>
        </div>
      </div>

      {/* Revenue breakdown popup */}
      {showRevenueBreakdown && (() => {
        const deliveredOrders = reportOrders.filter(o => o.status === "delivered")
        let totalGst = 0
        deliveredOrders.forEach(order => {
          order.order_items.forEach(item => {
            const itemTotal = item.price * item.quantity
            const menuItem = menuItems.find(m => m.id === item.menu_item_id)
            const gstRate = menuItem?.gst_rate || 0
            totalGst += (itemTotal * gstRate) / 100
          })
        })
        const grossRevenue = deliveredOrders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)
        const cgst = totalGst / 2
        const sgst = totalGst / 2
        const pat = grossRevenue - totalGst
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
            onClick={() => setShowRevenueBreakdown(false)}
          >
            <div
              style={{ background: "#fff", borderRadius: 16, padding: 24, width: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1c2b3a", margin: "0 0 4px" }}>Revenue Breakdown</p>
              <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 16px" }}>{reportDate}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#8a9bb0" }}>Gross Revenue</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>₹{grossRevenue.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: "1px dashed #e2e8f0", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#8a9bb0" }}>CGST (payable)</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#c0392b" }}>- ₹{cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#8a9bb0" }}>SGST (payable)</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#c0392b" }}>- ₹{sgst.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#8a9bb0" }}>Total GST</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#c0392b" }}>- ₹{totalGst.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: "2px solid #1c2b3a", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a" }}>PAT (Post-GST)</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2e7d32" }}>₹{pat.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: 10, color: "#8a9bb0", margin: "12px 0 0", textAlign: "center" }}>
                Based on GST % set per menu item · Delivered orders only
              </p>
              <button
                style={{ marginTop: 16, width: "100%", background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                onClick={() => setShowRevenueBreakdown(false)}
              >
                Close
              </button>
            </div>
          </div>
        )
      })()}

      {/* TOP ITEMS */}
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

      {/* ROOM CHECKOUT SUMMARY */}
      <p style={{ ...d.sectionLabel, marginTop: 24 }}>Room Checkout Summary</p>
      <p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 12px" }}>
        Search by guest phone or room number.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

        {roomSummaryOrders !== null && (
          <>
            {roomSummaryOrders.length === 0 ? (
              <p style={d.empty}>No orders found for {guestSearchPhone ? `phone ${guestSearchPhone}` : `Room ${roomSummaryNumber}`}.</p>
            ) : (
              <>
                <div style={{ ...d.card, background: "#1c2b3a", color: "#e8f0f8", marginTop: 8 }}>
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
                    const guest = roomSummaryOrders[0]
                    const win = window.open("", "_blank")
                    win.document.write(`
                      <html><head><title>Checkout Bill</title>
                      <style>
                        body { font-family: Arial, sans-serif; max-width: 480px; margin: 40px auto; padding: 0 24px; color: #1c2b3a; }
                        .header { text-align: center; border-bottom: 2px solid #1c2b3a; padding-bottom: 16px; margin-bottom: 16px; }
                        .hotel-name { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
                        .hotel-meta { font-size: 12px; color: #555; line-height: 1.8; }
                        .bill-title { font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 16px 0 8px; }
                        .guest-info { font-size: 13px; margin-bottom: 16px; line-height: 1.8; }
                        .order-block { border-top: 1px dashed #ccc; padding-top: 10px; margin-bottom: 10px; }
                        .order-heading { font-size: 12px; color: #888; margin: 0 0 6px; }
                        .item-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
                        .order-total { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-top: 6px; }
                        .grand-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; border-top: 2px solid #1c2b3a; padding-top: 12px; margin-top: 12px; }
                        .footer { text-align: center; font-size: 11px; color: #888; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px; }
                      </style>
                      </head><body>
                      <div class="header">
                        <div class="hotel-name">${hotel?.name || "Hotel"}</div>
                        <div class="hotel-meta">
                          ${hotel?.address ? `${hotel.address}<br>` : ""}
                          ${hotel?.contact_phone ? `📞 ${hotel.contact_phone}<br>` : ""}
                          ${hotel?.gst_number ? `GST: ${hotel.gst_number}<br>` : ""}
                          ${hotel?.fssai_number ? `FSSAI: ${hotel.fssai_number}` : ""}
                        </div>
                      </div>
                      <div class="bill-title">Food Checkout Bill</div>
                      <div class="guest-info">
                        <strong>Guest:</strong> ${guest?.guest_name || "—"}<br>
                        ${guestSearchPhone ? `<strong>Phone:</strong> ${guestSearchPhone}<br>` : `<strong>Room:</strong> ${roomSummaryNumber}<br>`}
                        ${hotel?.contact_phone ? `<strong>Reception:</strong> ${hotel.contact_phone}<br>` : ""}
                        <strong>Printed:</strong> ${new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      ${roomSummaryOrders.map((o, idx) => {
                        const time = new Date(o.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                        const orderTotal = o.order_items.reduce((s, i) => s + i.price * i.quantity, 0)
                        return `
                          <div class="order-block">
                            <div class="order-heading">Order ${idx + 1} · ${time}</div>
                            ${o.order_items.map(i => `
                              <div class="item-row">
                                <span>${i.menu_items?.name} × ${i.quantity}</span>
                                <span>₹${i.price * i.quantity}</span>
                              </div>
                            `).join("")}
                            <div class="order-total"><span>Order Total</span><span>₹${orderTotal}</span></div>
                          </div>
                        `
                      }).join("")}
                      <div class="grand-total">
                        <span>GRAND TOTAL</span>
                        <span>₹${roomSummaryOrders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.price * i.quantity, 0), 0)}</span>
                      </div>
                      <div class="footer">
                        Thank you for staying with us!<br>
                        ${hotel?.name || ""} · All prices inclusive of taxes
                      </div>
                      </body></html>
                    `)
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

      {/* ALL ORDERS */}
      <p style={{ ...d.sectionLabel, marginTop: 24 }}>All Orders ({reportOrders.length})</p>
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

{reportOrders.length > 0 && (
        <button style={{ ...d.addBtn, marginTop: 8 }} onClick={() => downloadCSV()}>
          ⬇ Download CSV
        </button>
      )}

      {/* CUSTOMER DATABASE */}
      <p style={{ ...d.sectionLabel, marginTop: 32 }}>Customer Database</p>
      <p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
        All guests who have placed orders at your hotel.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          style={{ ...d.saveBtn, flex: 1 }}
          onClick={fetchAllCustomers}
        >
          {customersLoading ? "Loading..." : customersLoaded ? "↻ Refresh" : "Load Customer Database"}
        </button>
      </div>
      {customersLoaded && (
        <>
          <input
            style={{ ...d.input, marginBottom: 12 }}
            placeholder="Search by name, phone, email or room..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
          />

          {(() => {
            const q = customerSearch.toLowerCase()
            const filtered = allCustomers.filter(c =>
              c.name.toLowerCase().includes(q) ||
              c.phone.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q) ||
              [...c.rooms].some(r => String(r).includes(q))
            )

            if (filtered.length === 0) return (
              <p style={d.empty}>No customers found.</p>
            )

            return filtered.map((customer, idx) => {
              const avgRating = customer.orders.filter(o => o.rating).length > 0
                ? (customer.orders.reduce((s, o) => s + (o.rating || 0), 0) / customer.orders.filter(o => o.rating).length).toFixed(1)
                : null

              return (
                <div key={idx} style={{ ...d.card, background: darkMode ? "#111f2c" : "#fff", border: darkMode ? "0.5px solid #1c2b3a" : "0.5px solid #e2e8f0", marginBottom: 10 }}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#e8f0f8" : "#1c2b3a", margin: "0 0 4px" }}>{customer.name}</p>
                      <p style={{ fontSize: 12, color: "#8a9bb0", margin: "0 0 2px" }}>📞 {customer.phone}</p>
                      {customer.email !== "—" && (
                        <p style={{ fontSize: 12, color: "#8a9bb0", margin: "0 0 2px" }}>✉️ {customer.email}</p>
                      )}
                      <p style={{ fontSize: 12, color: "#8a9bb0", margin: 0 }}>
                        🚪 Room{[...customer.rooms].length > 1 ? "s" : ""}: {[...customer.rooms].join(", ")}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#6fcf97", margin: "0 0 2px" }}>₹{customer.totalSpent}</p>
                      <p style={{ fontSize: 10, color: "#8a9bb0", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Spent</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, background: darkMode ? "#0f1923" : "#f4f6f9", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#7eb3f5", margin: "0 0 2px" }}>{customer.orders.length}</p>
                      <p style={{ fontSize: 10, color: "#8a9bb0", margin: 0 }}>Orders</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#f5a623", margin: "0 0 2px" }}>
                        {avgRating ? `${avgRating} ★` : "—"}
                      </p>
                      <p style={{ fontSize: 10, color: "#8a9bb0", margin: 0 }}>Avg Rating</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: darkMode ? "#e8f0f8" : "#1c2b3a", margin: "0 0 2px" }}>
                        {new Date(customer.orders[customer.orders.length - 1].created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      <p style={{ fontSize: 10, color: "#8a9bb0", margin: 0 }}>First Visit</p>
                    </div>
                  </div>

                  {/* Individual order ratings */}
                  {customer.orders.some(o => o.rating) && (
                    <div>
                      <p style={{ fontSize: 10, color: "#8a9bb0", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px", fontWeight: 600 }}>Order Ratings</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {customer.orders.filter(o => o.rating).map((o, i) => {
                          const time = new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                              <span style={{ color: "#8a9bb0" }}>{time} · Room {o.room_id}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ color: "#f5a623" }}>{"★".repeat(o.rating)}{"☆".repeat(5 - o.rating)}</span>
                                {o.rating_comment && (
                                  <span style={{ color: "#8a9bb0", fontSize: 10, fontStyle: "italic" }}>"{o.rating_comment}"</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          })()}

<p style={{ fontSize: 11, color: "#8a9bb0", textAlign: "center", marginTop: 8 }}>
        {allCustomers.length} unique guests · {allCustomers.reduce((s, c) => s + c.orders.length, 0)} total orders
      </p>

      {allCustomers.length > 0 && (
        <button
          style={{ ...d.addBtn, marginTop: 12, width: "100%" }}
          onClick={() => {
            const rows = [["Name", "Phone", "Email", "Rooms Stayed", "Total Orders", "Total Spent (₹)", "First Visit", "Last Visit", "Avg Rating", "Order Ratings & Comments"]]
            allCustomers.forEach(c => {
              const rooms = [...c.rooms].join(", ")
              const firstVisit = new Date(c.orders[c.orders.length - 1].created_at).toLocaleDateString("en-IN")
              const lastVisit = new Date(c.orders[0].created_at).toLocaleDateString("en-IN")
              const ratedOrders = c.orders.filter(o => o.rating)
              const avgRating = ratedOrders.length > 0
                ? (ratedOrders.reduce((s, o) => s + o.rating, 0) / ratedOrders.length).toFixed(1)
                : "—"
              const ratingsDetail = ratedOrders.map(o => {
                const date = new Date(o.created_at).toLocaleDateString("en-IN")
                return `${date}: ${o.rating}★${o.rating_comment ? ` (${o.rating_comment})` : ""}`
              }).join(" | ")
              rows.push([
                c.name, c.phone, c.email === "—" ? "" : c.email,
                rooms, c.orders.length, c.totalSpent,
                firstVisit, lastVisit, avgRating, ratingsDetail
              ])
            })
            const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = `customer-database-${new Date().toISOString().split("T")[0]}.csv`
            a.click()
          }}
        >
          ⬇ Download Customer Database (CSV)
        </button>
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
  <p style={{ ...d.sectionLabel, marginTop: 28 }}>Dashboard Font Size</p>
  <p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
    Controls how large text appears on this dashboard.
  </p>
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
    <span style={{ fontSize: 13, color: "#8a9bb0" }}>A</span>
    <div
      onClick={async () => {
        const sizes = ["small", "medium", "large"]
        const current = hotel?.font_size || "medium"
        const next = sizes[(sizes.indexOf(current) + 1) % sizes.length]
        await supabase.from("hotels").update({ font_size: next }).eq("id", hotel.id)
        setHotel(prev => ({ ...prev, font_size: next }))
        setDashFontScale(next === "small" ? 0.85 : next === "large" ? 1.2 : 1)
      }}
      style={{ width: 56, height: 26, borderRadius: 13, background: "#1c2b3a", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "#7eb3f5",
        position: "absolute", top: 3,
        left: hotel?.font_size === "large" ? 33 : hotel?.font_size === "small" ? 3 : 18,
        transition: "left 0.2s"
      }} />
    </div>
    <span style={{ fontSize: 20, color: "#1c2b3a", fontWeight: 700 }}>A+</span>
    <span style={{ fontSize: 12, color: "#8a9bb0", marginLeft: 4 }}>
      {hotel?.font_size === "small" ? "Small" : hotel?.font_size === "large" ? "Large" : "Medium"}
    </span>
  </div>
  <p style={{ ...d.sectionLabel, marginTop: 28 }}>Room Ranges</p>
<p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
  Add room ranges for each floor. Example: Floor 1: 101-110, Floor 2: 201-210
</p>

{(hotel?.room_ranges || []).map((range, idx) => (
  <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
    <div style={{ flex: 1, display: "flex", gap: 8 }}>
      <input
        style={{ ...d.input, flex: 1 }}
        type="number"
        placeholder="Floor"
        value={range.floor}
        onChange={e => {
          const updated = [...(hotel.room_ranges || [])]
          updated[idx].floor = parseInt(e.target.value) || 1
          setHotel(prev => ({ ...prev, room_ranges: updated }))
        }}
      />
      <input
        style={{ ...d.input, flex: 1 }}
        type="number"
        placeholder="Start room"
        value={range.start}
        onChange={e => {
          const updated = [...(hotel.room_ranges || [])]
          updated[idx].start = parseInt(e.target.value) || 101
          setHotel(prev => ({ ...prev, room_ranges: updated }))
        }}
      />
      <input
        style={{ ...d.input, flex: 1 }}
        type="number"
        placeholder="End room"
        value={range.end}
        onChange={e => {
          const updated = [...(hotel.room_ranges || [])]
          updated[idx].end = parseInt(e.target.value) || 110
          setHotel(prev => ({ ...prev, room_ranges: updated }))
        }}
      />
    </div>
    <button
      style={{ ...d.btnDelete, background: "#c0392b", color: "#fff", padding: "8px 12px", fontSize: 12 }}
      onClick={async () => {
        const updated = (hotel.room_ranges || []).filter((_, i) => i !== idx)
        await supabase.from("hotels").update({ room_ranges: updated }).eq("id", hotel.id)
        setHotel(prev => ({ ...prev, room_ranges: updated }))
      }}
    >
      Remove
    </button>
  </div>
))}


<button
  style={{ ...d.addBtn, marginBottom: 24 }}
  onClick={() => {
    const nextFloor = (hotel?.room_ranges?.length || 0) + 1
    const updated = [...(hotel?.room_ranges || []), { floor: nextFloor, start: nextFloor * 100 + 1, end: nextFloor * 100 + 10 }]
    setHotel(prev => ({ ...prev, room_ranges: updated }))
  }}
>
  + Add Floor Range
</button>

<button
  style={d.saveBtn}
  onClick={async () => {
    await supabase.from("hotels").update({ room_ranges: hotel.room_ranges }).eq("id", hotel.id)
    setThemeSaved(true)
    setTimeout(() => setThemeSaved(false), 2500)
  }}
>
    Save Room Ranges
</button>

<p style={{ ...d.sectionLabel, marginTop: 28 }}>Hotel Details for Bill</p>
<p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>
  These details will appear on printed checkout bills.
</p>

<div style={d.form}>
  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 6px", fontWeight: 500 }}>Hotel Address</p>
    <input
      style={d.input}
      placeholder="e.g. 123 Main Street, City"
      value={hotel?.address || ""}
      onChange={e => setHotel(prev => ({ ...prev, address: e.target.value }))}
    />
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 6px", fontWeight: 500 }}>GST Number</p>
    <input
      style={d.input}
      placeholder="e.g. 27ABCDE1234F1Z5"
      value={hotel?.gst_number || ""}
      onChange={e => setHotel(prev => ({ ...prev, gst_number: e.target.value }))}
    />
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 6px", fontWeight: 500 }}>FSSAI Number</p>
    <input
      style={d.input}
      placeholder="14-digit FSSAI number"
      value={hotel?.fssai_number || ""}
      onChange={e => setHotel(prev => ({ ...prev, fssai_number: e.target.value }))}
    />
  </div>

  <div>
    <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 6px", fontWeight: 500 }}>Reception Contact Number</p>
    <input
      style={d.input}
      placeholder="e.g. 9876543210"
      value={hotel?.contact_phone || ""}
onChange={e => setHotel(prev => ({ ...prev, contact_phone: e.target.value }))}
    />
  </div>

  <div>
  <p style={{ fontSize: 11, color: "#8a9bb0", margin: "0 0 6px", fontWeight: 500 }}>Google Review Link</p>
  <input
    style={d.input}
    placeholder="https://g.page/r/..."
    value={hotel?.google_review_url || ""}
    onChange={e => setHotel(prev => ({ ...prev, google_review_url: e.target.value }))}
  />
</div>

<button
    style={d.saveBtn}
    onClick={async () => {
      await supabase.from("hotels").update({ 
        address: hotel.address,
        gst_number: hotel.gst_number,
        fssai_number: hotel.fssai_number,
        contact_phone: hotel.contact_phone,
        google_review_url: hotel.google_review_url,
      }).eq("id", hotel.id)
      setHotelDetailsSaved(true)
      setTimeout(() => setHotelDetailsSaved(false), 2500)
    }}
  >
    Save Hotel Details
  </button>
  {hotelDetailsSaved && (
    <p style={{ color: "#2e7d32", fontSize: 13, textAlign: "center", marginTop: 8, fontWeight: 500 }}>
      ✓ Hotel details saved successfully!
    </p>
  )}
</div>

<p style={{ ...d.sectionLabel, marginTop: 28 }}>GST Rates By Category</p>
<p style={{ fontSize: 12, color: "#8a9bb0", margin: "-4px 0 16px" }}>Set default GST % per category.</p>
<div style={d.form}>
  {Object.keys(gstRates).map(category => (
    <div key={category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <label style={{ fontSize: 13, color: "#1c2b3a", flex: 1 }}>{category}</label>
      <input
        style={{ ...d.input, width: 80, textAlign: "center" }}
        type="number"
        value={gstRates[category]}
        onChange={(e) => setGstRates({ ...gstRates, [category]: Number(e.target.value) })}
      />
      <span style={{ fontSize: 12, color: "#8a9bb0" }}>%</span>
    </div>
  ))}
  <button style={d.saveBtn} onClick={async () => {
    await supabase.from("hotels").update({ gst_category_rates: gstRates }).eq("id", hotel.id)
    setThemeSaved(true)
    setTimeout(() => setThemeSaved(false), 2500)
  }}>Save GST Rates</button>
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
    <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <input
          type="checkbox"
          checked={selectedItems.includes(i)}
          onChange={() => setSelectedItems(prev =>
            prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
          )}
          style={{ marginTop: 3, accentColor: "#1c2b3a", flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          {editingTemplateItem === i ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                style={d.input}
                value={templateItemEdits[i]?.name ?? item.name}
                onChange={e => setTemplateItemEdits(prev => ({ ...prev, [i]: { ...prev[i], name: e.target.value } }))}
                placeholder="Name"
              />
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  style={{ ...d.input, flex: 1 }}
                  type="number"
                  value={templateItemEdits[i]?.price ?? item.price}
                  onChange={e => setTemplateItemEdits(prev => ({ ...prev, [i]: { ...prev[i], price: e.target.value } }))}
                  placeholder="Price"
                />
                <input
                  style={{ ...d.input, flex: 1 }}
                  type="number"
                  value={templateItemEdits[i]?.prep_time ?? item.prep_time}
                  onChange={e => setTemplateItemEdits(prev => ({ ...prev, [i]: { ...prev[i], prep_time: e.target.value } }))}
                  placeholder="Prep time"
                />
              </div>
              <input
                style={d.input}
                value={templateItemEdits[i]?.description ?? item.description}
                onChange={e => setTemplateItemEdits(prev => ({ ...prev, [i]: { ...prev[i], description: e.target.value } }))}
                placeholder="Description"
              />
              <button
                style={{ ...d.saveBtn, padding: "6px 12px", fontSize: 11 }}
                onClick={() => setEditingTemplateItem(null)}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>
                  {templateItemEdits[i]?.name ?? item.name}
                </div>
                <button
                  style={{ background: "none", border: "none", fontSize: 13, cursor: "pointer", color: "#8a9bb0", padding: "0 4px" }}
                  onClick={() => setEditingTemplateItem(i)}
                >
                  ✏️
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#8a9bb0" }}>
                {item.category} · ₹{templateItemEdits[i]?.price ?? item.price} · {templateItemEdits[i]?.prep_time ?? item.prep_time} min
              </div>
              {(templateItemEdits[i]?.description ?? item.description) && (
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                  {templateItemEdits[i]?.description ?? item.description}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  ))}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#8a9bb0" }}>{selectedItems.length} items selected</span>
      {selectedItems.length > 0 && (
        <button
          style={{ ...d.cancelBtn, fontSize: 11, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 8 }}
          onClick={() => setSelectedItems([])}
        >
          Deselect All
        </button>
      )}
      {selectedItems.length === 0 && (
        <button
          style={{ ...d.cancelBtn, fontSize: 11, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 8 }}
          onClick={() => setSelectedItems(menuTemplates[previewTemplate].items.map((_, i) => i))}
        >
          Select All
        </button>
      )}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button style={d.cancelBtn} onClick={() => { setPreviewTemplate(null); setTemplateItemEdits({}); setEditingTemplateItem(null) }}>Cancel</button>
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
    page: { background: "#f0f4f8", minHeight: "100vh", fontFamily: "-apple-system, sans-serif" },
    center: { textAlign: "center", marginTop: 100, color: "#333" },
    topbar: { background: "#1c2b3a", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },    backBtn: { background: "none", border: "none", color: "#7eb3f5", fontSize: 13, cursor: "pointer", padding: 0 },
    brand: { color: "#e8f0f8", fontSize: 15, fontWeight: 500 },
    live: { display: "flex", alignItems: "center", gap: 5, color: "#6fcf97", fontSize: 12 },
    dot: { width: 7, height: 7, borderRadius: "50%", background: "#6fcf97", display: "inline-block" },
    logoutBtn: { background: "none", border: "0.5px solid #3a3a3c", color: "#6e6e73", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" },
    metrics: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: 14 },
    metric: { background: "#fff", borderRadius: 12, padding: "16px 12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "none" },
    metricVal: { fontSize: 28, fontWeight: 700, color: "#1c2b3a", margin: "0 0 4px" },
    metricLabel: { fontSize: 11, color: "#8a9bb0", margin: 0, letterSpacing: 0.5, textTransform: "uppercase" },
    tabs: { display: "flex", background: "#fff", padding: "10px 14px", overflowX: "auto", gap: 6, borderBottom: "0.5px solid #e2e8f0" },
    tab: { padding: "8px 16px", fontSize: 13, color: "#8a9bb0", background: "none", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 400, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
    tabActive: { padding: "8px 16px", fontSize: 13, color: "#fff", background: "#1c2b3a", border: "1px solid #1c2b3a", borderRadius: 8, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
    body: { padding: "0 16px 40px" },
    sectionLabel: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8a9bb0", fontWeight: 600, margin: "20px 0 10px" },
    card: { background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 10, border: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)" },
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
    btnPrepare: { background: "#1c2b3a", color: "#7eb3f5", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
    btnDeliver: { background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
    btnReject: { background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" },
    timeAgo: { fontSize: 13, color: "#8a9bb0", margin: 0 },
    empty: { textAlign: "center", color: "#8a9bb0", marginTop: 30, fontSize: 16 },
    form: { background: "#fff", borderRadius: 14, padding: 14, marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 8, width: "100%" },
    input: { background: "#f4f6f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#1c2b3a", outline: "none", width: "100%", boxSizing: "border-box" },
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