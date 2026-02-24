"use client";

import { useState, useEffect, useRef } from "react";
import ChatWidget from "@/components/ChatWidget";

const LogoSvg = ({ id = "logo-gradient" }: { id?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill={`url(#${id})`} />
    <path d="M20 10L10 18V28C10 28.55 10.45 29 11 29H17V23H23V29H29C29.55 29 30 28.55 30 28V18L20 10Z" fill="white" opacity="0.95" />
    <path d="M25 14.5C26.5 16 27.5 18 27.5 20.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M28 12C30.2 14.2 31.5 17 31.5 20.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.35" />
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#FF6B35" />
        <stop offset="1" stopColor="#FF8A5B" />
      </linearGradient>
    </defs>
  </svg>
);

const CheckIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
  </svg>
);

export default function Home() {
  const [theme, setTheme] = useState("midnight");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [navCtaVisible, setNavCtaVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Init theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hc-theme") || "midnight";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  const changeTheme = (t: string) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem("hc-theme", t);
  };

  // Nav scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
      setNavCtaVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "#") return;
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      videoRef.current.controls = true;
      setVideoPlayed(true);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const faqs = [
    {
      q: "What hardware do I need?",
      a: "Nothing extra — we provide a pre-configured edge device as part of your plan. It's a compact computer that sits in your home or office (about the size of a paperback). Just plug it in and connect to Wi-Fi.",
    },
    {
      q: 'What does "local AI" actually mean?',
      a: "It means the AI brain runs on the device in your building — not on Amazon's, Google's, or anyone else's servers. Your voice commands, camera feeds, and routines are processed right there, in your home. Nothing leaves.",
    },
    {
      q: "Does it work without internet?",
      a: "Yes! Core features — voice control, automations, camera alerts, the dashboard — all work completely offline. Internet is only needed for software updates and optional remote access.",
    },
    {
      q: "Which devices are compatible?",
      a: "HabaCasa builds on Home Assistant, which supports over 2,000 brands and thousands of devices — Philips Hue, Nest, Ring, Sonos, IKEA, and many more. If it's a smart device, chances are it works.",
    },
    {
      q: "How is this different from Google Home or Alexa?",
      a: "Google and Amazon process your data on their servers — they can hear your conversations, see your cameras, and sell your usage patterns. HabaCasa does everything locally. We literally cannot access your data. That's not a policy — it's the architecture.",
    },
    {
      q: "Can I try before I buy?",
      a: "We offer a 30-day money-back guarantee. If HabaCasa isn't right for you, return the device and we'll refund your first month — no questions asked.",
    },
  ];

  return (
    <>
      {/* Orbs */}
      <div className="orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Nav */}
      <nav className={`nav${navScrolled ? " scrolled" : ""}`} id="nav">
        <div className="container nav-inner">
          <a href="#" className="nav-logo" aria-label="HabaCasa home" onClick={(e) => handleAnchorClick(e, "#")}>
            <LogoSvg id="logo-gradient" />
            <span>HabaCasa</span>
          </a>

          <div className="nav-links">
            <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>Features</a>
            <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, "#how-it-works")}>How It Works</a>
            <a href="#pricing" onClick={(e) => handleAnchorClick(e, "#pricing")}>Pricing</a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, "#faq")}>FAQ</a>
          </div>

          <div className="nav-right">
            <div className="theme-toggle" aria-label="Switch theme">
              <button className={`theme-btn${theme === "midnight" ? " active" : ""}`} onClick={() => changeTheme("midnight")} title="Midnight">🌙</button>
              <button className={`theme-btn${theme === "dawn" ? " active" : ""}`} onClick={() => changeTheme("dawn")} title="Dawn">☀️</button>
              <button className={`theme-btn${theme === "ocean" ? " active" : ""}`} onClick={() => changeTheme("ocean")} title="Ocean">🌊</button>
            </div>
            <a
              href="#pricing"
              className="btn btn-primary btn-sm"
              style={{ display: navCtaVisible ? "inline-flex" : "none" }}
              onClick={(e) => handleAnchorClick(e, "#pricing")}
            >
              Get Started
            </a>
            <button
              className="hamburger"
              id="hamburger"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
        <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>Features</a>
        <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, "#how-it-works")}>How It Works</a>
        <a href="#pricing" onClick={(e) => handleAnchorClick(e, "#pricing")}>Pricing</a>
        <a href="#faq" onClick={(e) => handleAnchorClick(e, "#faq")}>FAQ</a>
      </div>

      {/* Hero */}
      <section className="hero section" id="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge reveal">
                <span className="hero-badge-dot" />
                <span className="accent" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Now accepting early access</span>
              </div>
              <h1 className="reveal">Your space,<br /><span className="gradient-text">truly smart.</span></h1>
              <p className="subtitle reveal">The AI that manages your home or business — without sending your data to the cloud. Private by design. Powerful by nature.</p>
              <div className="hero-ctas reveal">
                <a href="#pricing" className="btn btn-primary" onClick={(e) => handleAnchorClick(e, "#pricing")}>Join Early Access →</a>
                <a href="#demo" className="btn btn-secondary" onClick={(e) => handleAnchorClick(e, "#demo")}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Watch Demo
                </a>
              </div>
              <div className="hero-trust reveal">
                <div className="hero-trust-item"><CheckIcon /> 100% on-premises</div>
                <div className="hero-trust-item"><CheckIcon /> No subscriptions to lose</div>
                <div className="hero-trust-item"><CheckIcon /> Set up in 30 minutes</div>
              </div>
            </div>

            <div className="reveal reveal-delay-2" id="demo" style={{ position: "relative" }}>
              <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--glass-border, rgba(255,255,255,0.08))", boxShadow: "0 16px 64px rgba(0,0,0,0.3)", aspectRatio: "16/9", background: "#000", position: "relative" }}>
                <video
                  ref={videoRef}
                  width="100%"
                  height="100%"
                  style={{ objectFit: "cover" }}
                  poster="/images/family-living-room.jpg"
                  playsInline
                  preload="metadata"
                >
                  <source src="/images/hero-video.mp4" type="video/mp4" />
                </video>
                {!videoPlayed && (
                  <div
                    onClick={handleVideoPlay}
                    style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(0,0,0,0.3)", transition: "opacity 0.3s" }}
                  >
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,var(--orange),var(--orange-light))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(255,107,53,0.4)" }}>
                      <svg viewBox="0 0 24 24" fill="#fff" width="32" height="32"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <div className="divider" />
      <section className="section" style={{ padding: "60px 0" }}>
        <div className="container">
          <div className="stats reveal">
            <div className="stat"><div className="stat-number accent">500+</div><div className="stat-label">Devices managed</div></div>
            <div className="stat"><div className="stat-number">30min</div><div className="stat-label">Average setup time</div></div>
            <div className="stat"><div className="stat-number">0</div><div className="stat-label">Data sent to cloud</div></div>
            <div className="stat"><div className="stat-number">24/7</div><div className="stat-label">Works without internet</div></div>
          </div>
        </div>
      </section>
      <div className="divider" />

      {/* Problem */}
      <section className="section">
        <div className="container text-center">
          <h2 className="reveal" style={{ marginBottom: "20px" }}>Smart devices have a problem.<br /><span className="text-3">They&apos;re not working for you.</span></h2>
          <p className="subtitle centered reveal">Every voice command, camera feed, and daily routine gets sent to someone else&apos;s server. Your habits become their data. Your privacy becomes their product.</p>
          <div style={{ marginTop: "48px" }} className="reveal">
            <div className="glass privacy-quote glass-refract">
              <p>We <span className="accent">can&apos;t</span> see your data.<br /><span className="text-2">Because we designed it that way.</span></p>
            </div>
          </div>
        </div>
      </section>
      <div className="divider" />

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "64px" }}>
            <h2 className="reveal">Everything you need.<br /><span className="gradient-text">Nothing you don&apos;t.</span></h2>
            <p className="subtitle centered reveal" style={{ marginTop: "16px" }}>A complete system that makes your space work better — while keeping your life private.</p>
          </div>
          <div className="grid grid-3">
            <div className="glass glass-refract feature-card reveal">
              <div className="feature-icon"><svg width="28" height="28" fill="none" stroke="var(--orange)" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div>
              <h3>Voice Control</h3>
              <p>Talk naturally to your home. &quot;Turn off the kitchen lights&quot; — processed entirely on your device. No cloud. No recordings.</p>
            </div>
            <div className="glass glass-refract feature-card reveal reveal-delay-1">
              <div className="feature-icon"><svg width="28" height="28" fill="none" stroke="#4A9FF5" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
              <h3>Smart Routines</h3>
              <p>Your morning sequence, exactly how you like it. Lights, heating, music — all triggered with one word or scheduled automatically.</p>
            </div>
            <div className="glass glass-refract feature-card reveal reveal-delay-2">
              <div className="feature-icon"><svg width="28" height="28" fill="none" stroke="#34D399" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
              <h3>Intelligent Cameras</h3>
              <p>Know who&apos;s at the door without paying monthly fees. Face recognition and alerts — all processed locally on your hardware.</p>
            </div>
            <div className="glass glass-refract feature-card reveal reveal-delay-1">
              <div className="feature-icon"><svg width="28" height="28" fill="none" stroke="#FBBF24" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div>
              <h3>Energy Savings</h3>
              <p>See exactly where your energy goes. Automated schedules that save money without you lifting a finger.</p>
            </div>
            <div className="glass glass-refract feature-card reveal reveal-delay-2">
              <div className="feature-icon"><svg width="28" height="28" fill="none" stroke="#A78BFA" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
              <h3>Beautiful Dashboard</h3>
              <p>One screen for everything. Check in on your home from any device on your network — clean, fast, intuitive.</p>
            </div>
            <div className="glass glass-refract feature-card reveal reveal-delay-3">
              <div className="feature-icon"><svg width="28" height="28" fill="none" stroke="#F472B6" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
              <h3>Always On, Always Yours</h3>
              <p>No internet? No problem. Your space keeps running. No company can switch off your smart home by shutting down a server.</p>
            </div>
          </div>

          {/* Lifestyle image showcase */}
          <div className="img-showcase reveal">
            <img src="/images/yoga-sunrise.jpg" alt="Morning yoga in perfectly lit room" className="img-wide" loading="lazy" />
            <img src="/images/children-playing.jpg" alt="Children playing in comfortable home" loading="lazy" />
            <img src="/images/romantic-dinner.jpg" alt="Romantic dinner with perfect ambiance" loading="lazy" />
            <img src="/images/welcome-home.jpg" alt="Coming home to warmth" loading="lazy" />
            <img src="/images/elderly-reading.jpg" alt="Peaceful reading in sunlit room" className="img-wide" loading="lazy" />
          </div>
        </div>
      </section>
      <div className="divider" />

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "64px" }}>
            <h2 className="reveal">Three steps.<br /><span className="gradient-text">Zero cloud.</span></h2>
            <p className="subtitle centered reveal" style={{ marginTop: "16px" }}>We install a small, powerful computer in your building. That&apos;s where the magic lives.</p>
          </div>
          <div className="grid grid-3">
            <div className="glass glass-refract step reveal">
              <div className="step-number n1">1</div>
              <h3>We set up your device</h3>
              <p>A compact edge computer arrives pre-configured. Plug it in, connect to Wi-Fi, and you&apos;re live in under 30 minutes.</p>
            </div>
            <div className="glass glass-refract step reveal reveal-delay-1">
              <div className="step-number n2">2</div>
              <h3>Connect your things</h3>
              <p>Lights, cameras, thermostats, locks — HabaCasa works with thousands of devices through the open-source Home Assistant ecosystem.</p>
            </div>
            <div className="glass glass-refract step reveal reveal-delay-2">
              <div className="step-number n3">3</div>
              <h3>Let the AI learn</h3>
              <p>Your personal AI assistant learns your routines, optimises your energy, and keeps things running perfectly — all processed locally.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="divider" />

      {/* Use Cases */}
      <section className="section" id="use-cases">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "64px" }}>
            <h2 className="reveal">For homes.<br />For businesses.<br /><span className="gradient-text">For anyone who values privacy.</span></h2>
          </div>

          <div className="img-split reveal">
            <img src="/images/family-living-room.jpg" alt="Family laughing in warm living room" loading="lazy" />
            <div className="img-split-text">
              <h3>🏠 Your Home</h3>
              <p>The perfect temperature when you wake up. Lights that shift to match the time of day. A home that just knows. No fiddling with apps — your space works for you, invisibly.</p>
            </div>
          </div>

          <div className="img-split reverse reveal" style={{ marginTop: "48px" }}>
            <img src="/images/restaurant-evening.jpg" alt="Restaurant with perfect ambiance" loading="lazy" />
            <div className="img-split-text">
              <h3>🏨 Hospitality &amp; Business</h3>
              <p>Guests walk into the perfect atmosphere — every time. Lighting, temperature, and ambiance managed invisibly. Their data stays on your property. That&apos;s not a limitation — it&apos;s your competitive advantage.</p>
            </div>
          </div>

          <div className="img-split reveal" style={{ marginTop: "48px" }}>
            <img src="/images/peaceful-sleep.jpg" alt="Family sleeping peacefully" loading="lazy" />
            <div className="img-split-text">
              <h3>😴 Rest &amp; Wellbeing</h3>
              <p>Blinds that close at sunset. Lights that dim to a warm glow. The perfect sleeping temperature, every night. You don&apos;t manage your home — it takes care of you.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="divider" />

      {/* Pricing */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "64px" }}>
            <h2 className="reveal">Simple, honest pricing.</h2>
            <p className="subtitle centered reveal" style={{ marginTop: "16px" }}>Edge device included. No per-device fees. No hidden costs.</p>
          </div>
          <div className="pricing-grid">
            <div className="glass glass-refract price-card reveal">
              <div className="price-tier">Starter</div>
              <div className="price-amount">£29<span className="price-period">/mo</span></div>
              <div className="price-desc">Perfect for homes</div>
              <ul className="price-features">
                <li><CheckIcon /> Up to 50 devices</li>
                <li><CheckIcon /> 6 users</li>
                <li><CheckIcon /> 4 AI cameras</li>
                <li><CheckIcon /> Voice control</li>
                <li><CheckIcon /> Energy dashboard</li>
              </ul>
              <a href="/signup" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>Get Started</a>
            </div>
            <div className="glass glass-refract price-card featured reveal reveal-delay-1">
              <div className="price-badge">Most Popular</div>
              <div className="price-tier">Pro</div>
              <div className="price-amount accent">£99<span className="price-period">/mo</span></div>
              <div className="price-desc">For businesses</div>
              <ul className="price-features">
                <li><CheckIcon /> Up to 200 devices</li>
                <li><CheckIcon /> 25 users</li>
                <li><CheckIcon /> 16 AI cameras</li>
                <li><CheckIcon /> Everything in Starter</li>
                <li><CheckIcon /> Priority support</li>
              </ul>
              <a href="/signup" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Get Started</a>
            </div>
            <div className="glass glass-refract price-card reveal reveal-delay-2">
              <div className="price-tier">Enterprise</div>
              <div className="price-amount">Custom</div>
              <div className="price-desc">For large deployments</div>
              <ul className="price-features">
                <li><CheckIcon /> Unlimited everything</li>
                <li><CheckIcon /> Custom integrations</li>
                <li><CheckIcon /> On-site setup</li>
                <li><CheckIcon /> SLA &amp; dedicated support</li>
                <li><CheckIcon /> Multi-site management</li>
              </ul>
              <a href="mailto:hello@haba.casa" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>Contact Sales</a>
            </div>
          </div>
        </div>
      </section>
      <div className="divider" />

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container" style={{ maxWidth: "720px" }}>
          <div className="text-center" style={{ marginBottom: "48px" }}>
            <h2 className="reveal">Common questions.</h2>
          </div>
          <div className="reveal">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button className={`faq-q${openFaq === idx ? " open" : ""}`} onClick={() => toggleFaq(idx)}>
                  {faq.q} <PlusIcon />
                </button>
                <div className={`faq-a${openFaq === idx ? " open" : ""}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="divider" />

      {/* Final CTA */}
      <section className="section cta-section">
        <div className="container">
          <h2 className="reveal" style={{ marginBottom: "16px" }}>Ready for a smarter space?</h2>
          <p className="subtitle centered reveal" style={{ marginBottom: "40px" }}>Join early access and get founder pricing for life.</p>
          <div className="reveal">
            <a href="/signup" className="btn btn-primary">Join Early Access →</a>
          </div>
          <p className="text-3 reveal" style={{ marginTop: "16px", fontSize: "0.85rem" }}>No spam. No cloud. Obviously.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#" className="nav-logo" style={{ marginBottom: "16px" }} onClick={(e) => handleAnchorClick(e, "#")}>
                <LogoSvg id="logo-gradient-2" />
                <span>HabaCasa</span>
              </a>
              <p className="text-3" style={{ fontSize: "0.9rem", maxWidth: "280px", lineHeight: 1.6 }}>AI-native smart environment management by Edge-AI LTD. Based in the UK.</p>
            </div>
            <div>
              <h4>Product</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>Features</a>
                <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, "#how-it-works")}>How It Works</a>
                <a href="#pricing" onClick={(e) => handleAnchorClick(e, "#pricing")}>Pricing</a>
                <a href="#faq" onClick={(e) => handleAnchorClick(e, "#faq")}>FAQ</a>
              </div>
            </div>
            <div>
              <h4>Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a href="mailto:hello@haba.casa">hello@haba.casa</a>
                <a href="https://www.youtube.com/channel/UC8a3MtomYBHmtaf7x_AHwNQ" target="_blank" rel="noopener noreferrer">YouTube</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Edge-AI LTD. All rights reserved.</p>
            <p>Your space, truly smart.™</p>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </>
  );
}
