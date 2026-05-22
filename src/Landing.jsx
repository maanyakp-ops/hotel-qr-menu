export default function Landing() {
    return (
      <div style={l.page}>
        {/* Nav */}
        <div style={l.nav}>
          <span style={l.logo}>Hotel+</span>
          <a href="/menu/demo" style={l.navBtn}>See Demo</a>
        </div>
  
        {/* Hero */}
        <div style={l.hero}>
          <div style={l.badge}>🇮🇳 Built for Indian Hotels</div>
          <h1 style={l.headline}>Room service ordering,<br />the modern way</h1>
          <p style={l.sub}>
            Your guests scan a QR code in their room, browse your menu, and place orders instantly.
            Your staff sees it live on their dashboard — no calls, no confusion.
          </p>
          <div style={l.heroButtons}>
            <a href="/signup" style={l.primaryBtn}>Start Free Trial</a>
            <a href="/menu/demo" style={l.secondaryBtn}>See Live Demo →</a>
          </div>
          <p style={l.heroNote}>No credit card required · Setup in 10 minutes</p>
        </div>
  
        {/* How it works */}
        <div style={l.section}>
          <p style={l.sectionEyebrow}>How it works</p>
          <h2 style={l.sectionTitle}>Up and running in 3 steps</h2>
          <div style={l.steps}>
            <div style={l.step}>
              <div style={l.stepNum}>1</div>
              <h3 style={l.stepTitle}>Sign up & add your menu</h3>
              <p style={l.stepText}>Create your account, add your food items with photos and prices. Takes 10 minutes.</p>
            </div>
            <div style={l.step}>
              <div style={l.stepNum}>2</div>
              <h3 style={l.stepTitle}>Print your QR codes</h3>
              <p style={l.stepText}>Download QR codes for each room from your dashboard and print them out.</p>
            </div>
            <div style={l.step}>
              <div style={l.stepNum}>3</div>
              <h3 style={l.stepTitle}>Start taking orders</h3>
              <p style={l.stepText}>Guests scan, order, and your staff gets notified instantly. That's it.</p>
            </div>
          </div>
        </div>
  
        {/* Features */}
        <div style={{ ...l.section, background: "#f4f6f9" }}>
          <p style={l.sectionEyebrow}>Features</p>
          <h2 style={l.sectionTitle}>Everything you need, nothing you don't</h2>
          <div style={l.features}>
            {[
              { icon: "📱", title: "QR per room", desc: "Each room gets its own QR code. Guests scan and order without calling reception." },
              { icon: "🔔", title: "Instant notifications", desc: "Staff gets a sound alert the moment an order comes in. No missed orders." },
              { icon: "📋", title: "Live dashboard", desc: "See all active orders, mark them as preparing or delivered in one tap." },
              { icon: "🍽️", title: "Menu management", desc: "Add, edit, or turn off items anytime from your dashboard. No tech skills needed." },
              { icon: "📲", title: "Works like an app", desc: "Install on any Android phone or PC. No App Store needed." },
              { icon: "⚡", title: "Setup in 10 minutes", desc: "Sign up, add your menu, print QRs. You're live the same day." },
            ].map((f, i) => (
              <div key={i} style={l.featureCard}>
                <span style={l.featureIcon}>{f.icon}</span>
                <h3 style={l.featureTitle}>{f.title}</h3>
                <p style={l.featureText}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Pricing */}
        <div style={l.section}>
          <p style={l.sectionEyebrow}>Pricing</p>
          <h2 style={l.sectionTitle}>Simple, honest pricing</h2>
          <div style={l.pricingCard}>
            <p style={l.planName}>Standard Plan</p>
            <div style={l.priceRow}>
              <span style={l.price}>₹499</span>
              <span style={l.pricePer}>/month</span>
            </div>
            <p style={l.priceNote}>Up to 15 rooms</p>
            <div style={l.divider} />
            {[
              "QR codes for up to 15 rooms",
              "Unlimited orders",
              "Live staff dashboard",
              "Sound & badge notifications",
              "Menu management",
              "Works on Android & PC",
              "Cancel anytime",
            ].map((feature, i) => (
              <div key={i} style={l.checkRow}>
                <span style={l.check}>✓</span>
                <span style={l.checkText}>{feature}</span>
              </div>
            ))}
            <a href="/signup" style={l.pricingBtn}>Start Free Trial</a>
            <p style={l.pricingNote}>First 14 days free. No credit card needed.</p>
          </div>
        </div>
  
        {/* CTA */}
        <div style={l.cta}>
          <h2 style={l.ctaTitle}>Ready to modernise your hotel?</h2>
          <p style={l.ctaSub}>Join hotels across India already using Hotel+</p>
          <a href="/signup" style={l.primaryBtn}>Get Started Free</a>
        </div>
  
        {/* Footer */}
        <div style={l.footer}>
          <span style={l.footerLogo}>Hotel+</span>
          <p style={l.footerText}>Made in India 🇮🇳</p>
        </div>
      </div>
    )
  }
  
  const l = {
    page: { fontFamily: "-apple-system, sans-serif", color: "#1c2b3a", background: "#fff" },
    nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e8edf2", position: "sticky", top: 0, background: "#fff", zIndex: 100 },
    logo: { fontSize: 20, fontWeight: 700, color: "#1c2b3a" },
    navBtn: { background: "#1c2b3a", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, textDecoration: "none" },
    hero: { textAlign: "center", padding: "60px 24px 80px", maxWidth: 640, margin: "0 auto" },
    badge: { display: "inline-block", background: "#fff3e0", color: "#b45309", fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, marginBottom: 20 },
    headline: { fontSize: 40, fontWeight: 700, color: "#1c2b3a", lineHeight: 1.2, margin: "0 0 16px" },
    sub: { fontSize: 16, color: "#5a7184", lineHeight: 1.6, margin: "0 0 32px" },
    heroButtons: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 },
    primaryBtn: { background: "#b8924a", color: "#fff", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 600, textDecoration: "none" },
    secondaryBtn: { background: "none", color: "#1c2b3a", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 500, textDecoration: "none", border: "1.5px solid #d0d8e0" },
    heroNote: { fontSize: 12, color: "#8a9bb0", margin: 0 },
    section: { padding: "60px 24px", maxWidth: 900, margin: "0 auto" },
    sectionEyebrow: { fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#b8924a", fontWeight: 600, margin: "0 0 8px", textAlign: "center" },
    sectionTitle: { fontSize: 28, fontWeight: 700, color: "#1c2b3a", margin: "0 0 40px", textAlign: "center" },
    steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 },
    step: { textAlign: "center", padding: 24 },
    stepNum: { width: 40, height: 40, borderRadius: "50%", background: "#1c2b3a", color: "#7eb3f5", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
    stepTitle: { fontSize: 16, fontWeight: 600, color: "#1c2b3a", margin: "0 0 8px" },
    stepText: { fontSize: 14, color: "#5a7184", lineHeight: 1.6, margin: 0 },
    features: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 },
    featureCard: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
    featureIcon: { fontSize: 28, display: "block", marginBottom: 12 },
    featureTitle: { fontSize: 15, fontWeight: 600, color: "#1c2b3a", margin: "0 0 8px" },
    featureText: { fontSize: 13, color: "#5a7184", lineHeight: 1.6, margin: 0 },
    pricingCard: { maxWidth: 380, margin: "0 auto", background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "2px solid #1c2b3a" },
    planName: { fontSize: 13, fontWeight: 600, color: "#b8924a", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" },
    priceRow: { display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 },
    price: { fontSize: 48, fontWeight: 700, color: "#1c2b3a" },
    pricePer: { fontSize: 16, color: "#8a9bb0" },
    priceNote: { fontSize: 13, color: "#8a9bb0", margin: "0 0 20px" },
    divider: { height: 1, background: "#e8edf2", margin: "20px 0" },
    checkRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
    check: { color: "#2e7d32", fontWeight: 700, fontSize: 14 },
    checkText: { fontSize: 14, color: "#1c2b3a" },
    pricingBtn: { display: "block", background: "#1c2b3a", color: "#fff", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center", marginTop: 24 },
    pricingNote: { fontSize: 12, color: "#8a9bb0", textAlign: "center", marginTop: 10 },
    cta: { background: "#1c2b3a", padding: "60px 24px", textAlign: "center" },
    ctaTitle: { fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 0 12px" },
    ctaSub: { fontSize: 15, color: "#8a9bb0", margin: "0 0 28px" },
    footer: { padding: "24px", textAlign: "center", borderTop: "1px solid #e8edf2" },
    footerLogo: { fontSize: 18, fontWeight: 700, color: "#1c2b3a", display: "block", marginBottom: 8 },
    footerText: { fontSize: 12, color: "#8a9bb0", margin: 0 },
  }