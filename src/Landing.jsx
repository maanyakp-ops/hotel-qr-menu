export default function Landing() {
    return (
      <div style={l.page}>
        {/* Nav */}
        <div style={l.nav}>
          <span style={l.logo}>Hotel+</span>
          <div style={{ display: "flex", gap: 10 }}>
  <a href="/auth" style={l.navBtnOutline}>Login</a>
  <a href="/signup" style={l.navBtn}>Get Started</a>
</div>
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
          <a href="/signup" style={l.primaryBtn}>Get Started</a>
            <a href="/menu/demo" style={l.secondaryBtn}>See Live Demo →</a>
          </div>
          <p style={l.heroNote}>Apply today · Setup in 10 minutes once approved</p>
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
        <div style={{ ...l.section, background: "#2c2c2e", maxWidth: "100%" }}>
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
            <a href="/signup" style={l.pricingBtn}>Get Started</a>
            <p style={l.pricingNote}>Apply today and we'll get you set up within 24 hours.</p>
          </div>
        </div>
  
        {/* CTA */}
        <div style={l.cta}>
          <h2 style={l.ctaTitle}>Ready to modernise your hotel?</h2>
          <p style={l.ctaSub}>Join hotels across India already using Hotel+</p>
          <a href="/signup" style={l.primaryBtn}>Get Started</a>
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
    page: { fontFamily: "-apple-system, sans-serif", color: "#f2f2f2", background: "#1c1c1e" },
    nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #2e2e30", position: "sticky", top: 0, background: "#1c1c1e", zIndex: 100 },
    logo: { fontSize: 20, fontWeight: 700, color: "#f2f2f2" },
    navBtn: { background: "#b8924a", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, textDecoration: "none" },
    hero: { textAlign: "center", padding: "60px 24px 80px", maxWidth: 640, margin: "0 auto" },
    badge: { display: "inline-block", background: "#2c2c2e", color: "#b8924a", fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, marginBottom: 20, border: "0.5px solid #3a3a3c" },
    headline: { fontSize: 40, fontWeight: 700, color: "#f2f2f2", lineHeight: 1.2, margin: "0 0 16px" },
    sub: { fontSize: 16, color: "#8a9bb0", lineHeight: 1.6, margin: "0 0 32px" },
    heroButtons: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 },
    primaryBtn: { background: "#b8924a", color: "#fff", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 600, textDecoration: "none" },
    secondaryBtn: { background: "none", color: "#f2f2f2", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 500, textDecoration: "none", border: "1.5px solid #3a3a3c" },
    heroNote: { fontSize: 12, color: "#6e6e73", margin: 0 },
    section: { padding: "60px 24px", maxWidth: 900, margin: "0 auto" },
    sectionEyebrow: { fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#b8924a", fontWeight: 600, margin: "0 0 8px", textAlign: "center" },
    sectionTitle: { fontSize: 28, fontWeight: 700, color: "#f2f2f2", margin: "0 0 40px", textAlign: "center" },
    steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 },
    step: { textAlign: "center", padding: 24 },
    stepNum: { width: 40, height: 40, borderRadius: "50%", background: "#b8924a", color: "#fff", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
    stepTitle: { fontSize: 16, fontWeight: 600, color: "#f2f2f2", margin: "0 0 8px" },
    stepText: { fontSize: 14, color: "#8a9bb0", lineHeight: 1.6, margin: 0 },
    features: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 },
    featureCard: { background: "#2c2c2e", borderRadius: 14, padding: 24, border: "0.5px solid #38383a" },
    featureIcon: { fontSize: 28, display: "block", marginBottom: 12 },
    featureTitle: { fontSize: 15, fontWeight: 600, color: "#f2f2f2", margin: "0 0 8px" },
    featureText: { fontSize: 13, color: "#8a9bb0", lineHeight: 1.6, margin: 0 },
    featuresSection: { padding: "60px 24px", maxWidth: 900, margin: "0 auto", background: "#2c2c2e" },
    pricingCard: { maxWidth: 380, margin: "0 auto", background: "#2c2c2e", borderRadius: 20, padding: 32, border: "1.5px solid #b8924a" },
    planName: { fontSize: 13, fontWeight: 600, color: "#b8924a", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" },
    priceRow: { display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 },
    price: { fontSize: 48, fontWeight: 700, color: "#f2f2f2" },
    pricePer: { fontSize: 16, color: "#6e6e73" },
    priceNote: { fontSize: 13, color: "#6e6e73", margin: "0 0 20px" },
    divider: { height: 1, background: "#38383a", margin: "20px 0" },
    checkRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
    check: { color: "#6fcf97", fontWeight: 700, fontSize: 14 },
    checkText: { fontSize: 14, color: "#f2f2f2" },
    pricingBtn: { display: "block", background: "#b8924a", color: "#fff", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center", marginTop: 24 },
    pricingNote: { fontSize: 12, color: "#6e6e73", textAlign: "center", marginTop: 10 },
    cta: { background: "#2c2c2e", padding: "60px 24px", textAlign: "center", borderTop: "0.5px solid #38383a", borderBottom: "0.5px solid #38383a" },
    ctaTitle: { fontSize: 28, fontWeight: 700, color: "#f2f2f2", margin: "0 0 12px" },
    ctaSub: { fontSize: 15, color: "#8a9bb0", margin: "0 0 28px" },
    footer: { padding: "24px", textAlign: "center", borderTop: "1px solid #2e2e30" },
    footerLogo: { fontSize: 18, fontWeight: 700, color: "#f2f2f2", display: "block", marginBottom: 8 },
    footerText: { fontSize: 12, color: "#6e6e73", margin: 0 },
    navBtnOutline: { border: "1px solid #b8924a", color: "#b8924a", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, textDecoration: "none" },
  }