export default function Landing() {
  return (
    <div style={l.page}>
      {/* Grain overlay */}
      <div style={l.grain} />

      {/* Nav */}
      <nav style={l.nav}>
        <span style={l.logo}>Stay<span style={l.logoPlus}>Dine</span></span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="/auth" style={l.navLogin}>Login</a>
          <a href="/signup" style={l.navBtn}>Get Started →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={l.hero}>
        <div style={l.heroInner}>
          <div style={l.badge}>🇮🇳 &nbsp;Built for Indian Hotels</div>
          <h1 style={l.headline}>
            Your guests order.<br />
            <span style={l.headlineGold}>You just deliver.</span>
          </h1>
          <p style={l.sub}>
            No more missed calls. No more confusion. Guests scan a QR in their room,
            browse your menu, and place orders — your staff sees it instantly.
          </p>
          <div style={l.heroButtons}>
            <a href="/signup" style={l.primaryBtn}>Get Started →</a>
            <a href="/demo" style={l.secondaryBtn}>See Live Demo</a>
          </div>
          <p style={l.heroNote}>✓ Setup in 10 minutes &nbsp;·&nbsp; ✓ No app download needed &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>

        {/* Phone mockup */}
        <div style={l.phoneMockup}>
          <div style={l.phone}>
            <div style={l.phoneNotch} />
            <div style={l.phoneScreen}>
              <div style={l.phoneHero}>
                <div style={l.phoneGoldBar} />
                <div style={l.phoneBadge}>Room Service</div>
                <div style={l.phoneHotelName}>The Grand Plaza</div>
                <div style={l.phoneRoom}>Room 204 · Available 24/7</div>
              </div>
              <div style={l.phoneTabs}>
                <div style={l.phoneTabActive}>Starters</div>
                <div style={l.phoneTab}>Mains</div>
                <div style={l.phoneTab}>Drinks</div>
              </div>
              {[
                { name: "Paneer Tikka", price: "₹180", time: "15 min" },
                { name: "Dal Makhani", price: "₹160", time: "20 min" },
                { name: "Butter Naan", price: "₹40", time: "10 min" },
              ].map((item, i) => (
                <div key={i} style={l.phoneItem}>
                  <div>
                    <div style={l.phoneItemName}>{item.name}</div>
                    <div style={l.phoneItemMeta}>⏱ {item.time}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={l.phoneItemPrice}>{item.price}</div>
                    {i === 0
                      ? <div style={l.phoneQtyRow}><span style={l.phoneQtyBtn}>−</span><span style={l.phoneQtyNum}>2</span><span style={l.phoneQtyBtn}>+</span></div>
                      : <div style={l.phoneAddBtn}>+ Add</div>
                    }
                  </div>
                </div>
              ))}
              <div style={l.phoneCartBar}>
                <div>
                  <div style={l.phoneCartCount}>2 items · ⏱ ~15 min</div>
                  <div style={l.phoneCartTotal}>₹360</div>
                </div>
                <div style={l.phonePlaceBtn}>Place Order</div>
              </div>
            </div>
          </div>
          <div style={l.phoneGlow} />
        </div>
      </div>

      {/* Pain → Solution */}
      <div style={l.painSection}>
        <div style={l.painInner}>
          <div style={l.painCard}>
            <p style={l.painEmoji}>😤</p>
            <p style={l.painTitle}>Before staydine.in</p>
            <ul style={l.painList}>
              <li>Phone rings at 2am for a water bottle</li>
              <li>Staff mishears orders over the phone</li>
              <li>No record of what was ordered</li>
              <li>Guests frustrated waiting for someone to pick up</li>
            </ul>
          </div>
          <div style={l.painArrow}>→</div>
          <div style={{ ...l.painCard, ...l.solCard }}>
            <p style={l.painEmoji}>✨</p>
            <p style={{ ...l.painTitle, color: "#C9A84C" }}>After staydine.in+</p>
            <ul style={l.painList}>
              <li>Guests order from their phone, no calls</li>
              <li>Every order perfectly recorded</li>
              <li>Staff notified instantly with a sound alert</li>
              <li>Guests happy, staff stress-free</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={l.section}>
        <p style={l.eyebrow}>How it works</p>
        <h2 style={l.sectionTitle}>Live in 3 steps</h2>
        <div style={l.steps}>
          {[
            { num: "1", title: "Sign up & add your menu", desc: "Add your food items, prices and descriptions in minutes. No tech skills needed." },
            { num: "2", title: "Print QR codes", desc: "Download a QR for each room from your dashboard and print them out. Done." },
            { num: "3", title: "Start taking orders", desc: "Guests scan, browse, and order. Your staff sees it live and gets an alert. That's it." },
          ].map((s, i) => (
            <div key={i} style={l.step}>
              <div style={l.stepNum}>{s.num}</div>
              <h3 style={l.stepTitle}>{s.title}</h3>
              <p style={l.stepText}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={l.featuresSection}>
        <p style={l.eyebrow}>Features</p>
        <h2 style={l.sectionTitle}>Everything you need. Nothing you don't.</h2>
        <div style={l.features}>
          {[
            { icon: "📱", title: "QR per room", desc: "Each room gets its own unique QR. Guests scan and order without calling anyone." },
            { icon: "🔔", title: "Instant sound alerts", desc: "Staff gets a loud sound alert the moment an order comes in. Zero missed orders." },
            { icon: "📋", title: "Live order dashboard", desc: "See all orders live. Mark as preparing or delivered in one tap." },
            { icon: "⭐", title: "Chef's Specials", desc: "Pin your best dishes at the top of the menu. Drive higher value orders." },
            { icon: "🍽️", title: "Full menu control", desc: "Add, edit, mark out of stock anytime. Changes go live instantly." },
            { icon: "📊", title: "Order history", desc: "Every order recorded with guest name, room, items and total. Always." },
          ].map((f, i) => (
            <div key={i} style={l.featureCard}>
              <span style={l.featureIcon}>{f.icon}</span>
              <h3 style={l.featureTitle}>{f.title}</h3>
              <p style={l.featureText}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

  

      {/* WhatsApp CTA */}
      <div style={l.whatsappSection}>
        <div style={l.whatsappInner}>
          <div>
            <h2 style={l.whatsappTitle}>Want to see it in your hotel first?</h2>
            <p style={l.whatsappSub}>Message us on WhatsApp. We'll set up a free demo for your property within 24 hours.</p>
          </div>
          <a
            href="https://wa.me/919823441072?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Hotel%2B"
            target="_blank"
            rel="noreferrer"
            style={l.whatsappBtn}
          >
            <span>💬</span> Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={l.footer}>
        <span style={l.footerLogo}>Hotel<span style={l.logoPlus}>+</span></span>
        <p style={l.footerText}>The simplest room service system in India &nbsp;·&nbsp; Made in India 🇮🇳</p>
        
      </div>
    </div>
  )
}

const l = {
  page: { fontFamily: "'Jost', -apple-system, sans-serif", color: "#EDE8DC", background: "#0D0C0A", minHeight: "100vh", overflowX: "hidden", position: "relative" },
  grain: { position: "fixed", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")", pointerEvents: "none", zIndex: 0, opacity: 0.4 },

  // Nav
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 40px", borderBottom: "1px solid #1E1C18", position: "sticky", top: 0, background: "rgba(13,12,10,0.92)", backdropFilter: "blur(12px)", zIndex: 100 },
  logo: { fontSize: 22, fontWeight: 700, color: "#EDE8DC", fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1 },
  logoPlus: { color: "#C9A84C" },
  navLogin: { color: "#9A927E", fontSize: 13, textDecoration: "none", padding: "8px 14px" },
  navBtn: { background: "#C9A84C", color: "#0D0C0A", borderRadius: 6, padding: "9px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: 0.5 },

  // Hero
  hero: { display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto", padding: "80px 40px 80px", gap: 60, flexWrap: "wrap" },
  heroInner: { flex: 1, minWidth: 300 },
  badge: { display: "inline-block", background: "#141310", color: "#C9A84C", fontSize: 12, fontWeight: 500, padding: "6px 14px", borderRadius: 20, marginBottom: 24, border: "1px solid #2E2B22", letterSpacing: 1 },
  headline: { fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 300, color: "#EDE8DC", lineHeight: 1.15, margin: "0 0 20px", letterSpacing: 1 },
  headlineGold: { color: "#C9A84C" },
  sub: { fontSize: 16, color: "#9A927E", lineHeight: 1.8, margin: "0 0 36px", maxWidth: 480 },
  heroButtons: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  primaryBtn: { background: "#C9A84C", color: "#0D0C0A", borderRadius: 6, padding: "14px 28px", fontSize: 15, fontWeight: 600, textDecoration: "none", letterSpacing: 0.5 },
  secondaryBtn: { background: "none", color: "#EDE8DC", borderRadius: 6, padding: "14px 28px", fontSize: 15, textDecoration: "none", border: "1px solid #2E2B22" },
  heroNote: { fontSize: 12, color: "#7A6230", letterSpacing: 0.5 },

  // Phone mockup
  phoneMockup: { position: "relative", flexShrink: 0 },
  phone: { width: 240, background: "#0D0C0A", borderRadius: 36, border: "2px solid #2E2B22", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px #1E1C18", position: "relative", zIndex: 2 },
  phoneNotch: { width: 80, height: 24, background: "#0D0C0A", borderRadius: "0 0 16px 16px", margin: "0 auto", position: "relative", zIndex: 3, borderBottom: "1px solid #1E1C18" },
  phoneScreen: { background: "#0D0C0A", minHeight: 460, paddingBottom: 0 },
  phoneHero: { background: "#141310", padding: "16px 16px 12px", textAlign: "center", borderBottom: "1px solid #2E2B22", position: "relative" },
  phoneGoldBar: { position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" },
  phoneBadge: { fontSize: 8, letterSpacing: 3, color: "#C9A84C", textTransform: "uppercase", marginBottom: 4 },
  phoneHotelName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#EDE8DC", fontWeight: 300 },
  phoneRoom: { fontSize: 8, color: "#9A927E", letterSpacing: 2, marginTop: 2 },
  phoneTabs: { display: "flex", borderBottom: "1px solid #2E2B22", background: "#141310" },
  phoneTabActive: { flex: 1, textAlign: "center", padding: "8px 4px", fontSize: 8, color: "#C9A84C", borderBottom: "1.5px solid #C9A84C", letterSpacing: 1 },
  phoneTab: { flex: 1, textAlign: "center", padding: "8px 4px", fontSize: 8, color: "#9A927E", letterSpacing: 1 },
  phoneItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #1E1C18" },
  phoneItemName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: "#EDE8DC", marginBottom: 2 },
  phoneItemMeta: { fontSize: 8, color: "#7A6230" },
  phoneItemPrice: { fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#C9A84C", marginBottom: 4, textAlign: "right" },
  phoneAddBtn: { background: "none", border: "1px solid #7A6230", color: "#C9A84C", borderRadius: 2, padding: "2px 8px", fontSize: 8, textAlign: "center" },
  phoneQtyRow: { display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" },
  phoneQtyBtn: { background: "none", border: "1px solid #2E2B22", color: "#C9A84C", borderRadius: 2, width: 18, height: 18, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  phoneQtyNum: { color: "#EDE8DC", fontSize: 10 },
  phoneCartBar: { background: "#141310", borderTop: "1px solid #2E2B22", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  phoneCartCount: { fontSize: 8, color: "#9A927E", marginBottom: 2 },
  phoneCartTotal: { fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#C9A84C" },
  phonePlaceBtn: { background: "#C9A84C", color: "#0D0C0A", borderRadius: 4, padding: "6px 12px", fontSize: 9, fontWeight: 600 },
  phoneGlow: { position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 },

  // Pain section
  painSection: { background: "#0A0908", borderTop: "1px solid #1E1C18", borderBottom: "1px solid #1E1C18", padding: "60px 40px" },
  painInner: { maxWidth: 800, margin: "0 auto", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center" },
  painCard: { flex: 1, minWidth: 280, background: "#141310", border: "1px solid #2E2B22", borderRadius: 8, padding: 28 },
  solCard: { border: "1px solid #C9A84C33", background: "#141310" },
  painEmoji: { fontSize: 28, margin: "0 0 12px" },
  painTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#EDE8DC", margin: "0 0 16px", fontWeight: 400 },
  painList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 },
  painArrow: { fontSize: 28, color: "#C9A84C", flexShrink: 0, opacity: 0.5 },

  // Sections
  section: { padding: "80px 40px", maxWidth: 1000, margin: "0 auto" },
  eyebrow: { fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#C9A84C", fontWeight: 500, margin: "0 0 12px", textAlign: "center" },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#EDE8DC", margin: "0 0 48px", textAlign: "center", letterSpacing: 1 },

  // Steps
  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 },
  step: { textAlign: "center", padding: "24px 20px" },
  stepNum: { width: 48, height: 48, borderRadius: "50%", background: "none", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
  stepTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: "#EDE8DC", margin: "0 0 10px" },
  stepText: { fontSize: 14, color: "#9A927E", lineHeight: 1.7, margin: 0 },

  // Features
  featuresSection: { background: "#0A0908", borderTop: "1px solid #1E1C18", borderBottom: "1px solid #1E1C18", padding: "80px 40px" },
  features: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" },
  featureCard: { background: "#0D0C0A", border: "1px solid #2E2B22", borderRadius: 4, padding: 28 },
  featureIcon: { fontSize: 24, display: "block", marginBottom: 14 },
  featureTitle: { fontSize: 15, fontWeight: 500, color: "#EDE8DC", margin: "0 0 8px", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 },
  featureText: { fontSize: 13, color: "#9A927E", lineHeight: 1.7, margin: 0 },

  // Pricing
  pricingSubtitle: { textAlign: "center", color: "#9A927E", fontSize: 14, margin: "-32px 0 40px" },
  pricingCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" },
  pricingCard: { background: "#141310", border: "1px solid #2E2B22", borderRadius: 4, padding: 32, position: "relative" },
  pricingCardFeatured: { border: "1px solid #C9A84C", background: "#141310" },
  popularBadge: { position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#C9A84C", color: "#0D0C0A", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: 1, whiteSpace: "nowrap" },
  planName: { fontSize: 10, fontWeight: 600, color: "#C9A84C", textTransform: "uppercase", letterSpacing: 3, margin: "0 0 16px" },
  priceRow: { display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 },
  price: { fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, color: "#EDE8DC" },
  priceFree: { fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, color: "#EDE8DC" },
  pricePer: { fontSize: 14, color: "#7A6230" },
  priceNote: { fontSize: 12, color: "#7A6230", margin: "0 0 20px" },
  divider: { height: 1, background: "#2E2B22", margin: "20px 0" },
  checkRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  check: { color: "#C9A84C", fontWeight: 700, fontSize: 13 },
  checkText: { fontSize: 13, color: "#9A927E" },
  pricingBtn: { display: "block", background: "#C9A84C", color: "#0D0C0A", borderRadius: 4, padding: "13px", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center", marginTop: 24, letterSpacing: 1 },
  pricingBtnOutline: { display: "block", background: "none", color: "#C9A84C", border: "1px solid #C9A84C33", borderRadius: 4, padding: "13px", fontSize: 13, textDecoration: "none", textAlign: "center", marginTop: 24, letterSpacing: 1 },

  // WhatsApp
  whatsappSection: { background: "#141310", borderTop: "1px solid #2E2B22", padding: "60px 40px" },
  whatsappInner: { maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" },
  whatsappTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#EDE8DC", margin: "0 0 8px" },
  whatsappSub: { fontSize: 14, color: "#9A927E", margin: 0, lineHeight: 1.6 },
  whatsappBtn: { background: "#25D366", color: "#fff", borderRadius: 6, padding: "14px 28px", fontSize: 15, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", flexShrink: 0 },

  // Footer
  footer: { padding: "40px", textAlign: "center", borderTop: "1px solid #1E1C18" },
  footerLogo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#EDE8DC", display: "block", marginBottom: 8, letterSpacing: 1 },
  footerText: { fontSize: 12, color: "#7A6230", margin: "0 0 16px" },
  footerLinks: { display: "flex", gap: 24, justifyContent: "center" },
  footerLink: { fontSize: 12, color: "#9A927E", textDecoration: "none" },
}