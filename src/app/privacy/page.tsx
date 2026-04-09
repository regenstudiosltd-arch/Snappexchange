'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  Eye,
  Server,
  Trash2,
  Bell,
  Globe,
  Mail,
  Phone,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'collection', label: 'Data We Collect' },
  { id: 'use', label: 'How We Use It' },
  { id: 'storage', label: 'Storage & Security' },
  { id: 'sharing', label: 'Sharing Your Data' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'retention', label: 'Data Retention' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'changes', label: 'Policy Changes' },
  { id: 'contact', label: 'Contact Us' },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('overview');
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Adaptive tokens ── */
  :root {
    /* LIGHT MODE = default (matches Tailwind + your globals.css) */
    --pp-bg:              #f4faf9;
    --pp-text:            #0c2421;
    --pp-text-muted:      rgba(12,36,33,0.65);
    --pp-text-dim:        rgba(12,36,33,0.45);
    --pp-text-dimmer:     rgba(12,36,33,0.32);
    --pp-teal:            #0a8a7e;
    --pp-gold:            #a8832a;
    --pp-nav-bg:          rgba(244,250,249,0.92);
    --pp-nav-border:      rgba(10,155,142,0.18);
    --pp-badge-bg:        rgba(10,155,142,0.08);
    --pp-badge-border:    rgba(10,155,142,0.22);
    --pp-surface:         rgba(10,155,142,0.03);
    --pp-border:          rgba(10,155,142,0.12);
    --pp-border-hover:    rgba(10,155,142,0.35);
    --pp-sidebar-active:  rgba(10,155,142,0.09);
    --pp-sidebar-hover:   rgba(10,155,142,0.06);
    --pp-dot-inactive:    rgba(12,36,33,0.15);
    --pp-section-icon-teal-bg: rgba(10,155,142,0.08);
    --pp-section-icon-teal-bd: rgba(10,155,142,0.18);
    --pp-section-icon-gold-bg: rgba(200,169,110,0.09);
    --pp-section-icon-gold-bd: rgba(200,169,110,0.2);
    --pp-list-border:     rgba(10,155,142,0.07);
    --pp-highlight-bg:    rgba(10,155,142,0.06);
    --pp-highlight-border:rgba(10,155,142,0.18);
    --pp-highlight-left:  #0a8a7e;
    --pp-gold-box-bg:     rgba(168,131,42,0.07);
    --pp-gold-box-border: rgba(168,131,42,0.18);
    --pp-gold-box-left:   #a8832a;
    --pp-data-card-bg:    #ffffff;
    --pp-data-card-border:rgba(10,155,142,0.12);
    --pp-contact-card-bg: rgba(10,155,142,0.05);
    --pp-contact-card-bd: rgba(10,155,142,0.14);
    --pp-contact-icon-bg: rgba(10,155,142,0.1);
    --pp-contact-label:   rgba(12,36,33,0.45);
    --pp-footer-bg:       rgba(10,155,142,0.03);
    --pp-footer-border:   rgba(10,155,142,0.1);
    --pp-divider:         rgba(10,155,142,0.15);
    --pp-shadow-scrolled: rgba(10,155,142,0.1);
  }

  /* DARK MODE – triggered by the .dark class (exactly how your app already works) */
  .dark {
    --pp-bg:              #050d0c;
    --pp-text:            #e8f0ef;
    --pp-text-muted:      rgba(232,240,239,0.6);
    --pp-text-dim:        rgba(232,240,239,0.4);
    --pp-text-dimmer:     rgba(232,240,239,0.3);
    --pp-teal:            #0A9B8E;
    --pp-gold:            #C8A96E;
    --pp-nav-bg:          rgba(5,13,12,0.85);
    --pp-nav-border:      rgba(10,155,142,0.15);
    --pp-badge-bg:        rgba(10,155,142,0.1);
    --pp-badge-border:    rgba(10,155,142,0.25);
    --pp-surface:         rgba(255,255,255,0.03);
    --pp-border:          rgba(255,255,255,0.07);
    --pp-border-hover:    rgba(10,155,142,0.25);
    --pp-sidebar-active:  rgba(10,155,142,0.1);
    --pp-sidebar-hover:   rgba(10,155,142,0.08);
    --pp-dot-inactive:    rgba(232,240,239,0.2);
    --pp-section-icon-teal-bg: rgba(10,155,142,0.1);
    --pp-section-icon-teal-bd: rgba(10,155,142,0.2);
    --pp-section-icon-gold-bg: rgba(200,169,110,0.1);
    --pp-section-icon-gold-bd: rgba(200,169,110,0.2);
    --pp-list-border:     rgba(255,255,255,0.04);
    --pp-highlight-bg:    rgba(10,155,142,0.07);
    --pp-highlight-border:rgba(10,155,142,0.2);
    --pp-highlight-left:  #0A9B8E;
    --pp-gold-box-bg:     rgba(200,169,110,0.07);
    --pp-gold-box-border: rgba(200,169,110,0.2);
    --pp-gold-box-left:   #C8A96E;
    --pp-data-card-bg:    rgba(255,255,255,0.03);
    --pp-data-card-border:rgba(255,255,255,0.07);
    --pp-contact-card-bg: rgba(10,155,142,0.06);
    --pp-contact-card-bd: rgba(10,155,142,0.15);
    --pp-contact-icon-bg: rgba(10,155,142,0.15);
    --pp-contact-label:   rgba(232,240,239,0.4);
    --pp-footer-bg:       rgba(255,255,255,0.02);
    --pp-footer-border:   rgba(255,255,255,0.06);
    --pp-divider:         rgba(10,155,142,0.2);
    --pp-shadow-scrolled: rgba(10,155,142,0.15);
  }

  body {
    background: var(--pp-bg);
    color: var(--pp-text);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Everything below stays exactly the same ── */
  .pp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 0 2rem;
    background: var(--pp-nav-bg);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--pp-nav-border);
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    transition: all 0.3s ease;
  }
  .pp-nav.scrolled {
    box-shadow: 0 4px 20px -4px var(--pp-shadow-scrolled);
  }
  .pp-nav-logo {
    font-family: 'Sora', sans-serif;
    font-weight: 700; font-size: 1.25rem;
    color: var(--pp-teal); text-decoration: none;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .pp-nav-logo span { color: var(--pp-gold); }
  .pp-nav-back {
    display: flex; align-items: center; gap: 0.5rem;
    color: var(--pp-text-dim); text-decoration: none;
    font-size: 0.875rem; font-weight: 500; transition: color 0.2s ease;
  }
  .pp-nav-back:hover { color: var(--pp-teal); }

  .pp-hero {
    padding: 120px 2rem 60px;
    max-width: 1200px; margin: 0 auto; text-align: center;
  }
  .pp-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--pp-badge-bg);
    border: 1px solid var(--pp-badge-border);
    border-radius: 100px; padding: 0.35rem 1rem;
    font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--pp-teal); margin-bottom: 1.5rem;
  }
  .pp-hero h1 {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800; line-height: 1.05;
    color: var(--pp-text); margin-bottom: 1.25rem;
  }
  .pp-hero h1 span { color: var(--pp-teal); }
  .pp-hero p {
    color: var(--pp-text-muted); font-size: 1.1rem;
    line-height: 1.7; max-width: 600px; margin: 0 auto 2rem;
  }
  .pp-meta {
    display: flex; align-items: center; justify-content: center;
    gap: 2rem; flex-wrap: wrap;
    font-size: 0.8rem; color: var(--pp-text-dim);
  }
  .pp-meta span { display: flex; align-items: center; gap: 0.4rem; }
  .pp-meta strong { color: var(--pp-gold); }

  .pp-layout {
    max-width: 1200px; margin: 0 auto;
    padding: 0 2rem 6rem;
    display: grid; grid-template-columns: 240px 1fr;
    gap: 4rem; align-items: start;
  }
  @media (max-width: 900px) {
    .pp-layout { grid-template-columns: 1fr; gap: 2rem; }
    .pp-sidebar { display: none; }
  }

  .pp-sidebar { position: sticky; top: 84px; }
  .pp-sidebar-label {
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--pp-gold); margin-bottom: 1rem;
  }
  .pp-sidebar-nav { list-style: none; }
  .pp-sidebar-nav li { margin-bottom: 0.125rem; }
  .pp-sidebar-nav button {
    width: 100%; text-align: left;
    background: none; border: none; cursor: pointer;
    padding: 0.5rem 0.75rem; border-radius: 8px;
    font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 0.5rem;
    transition: all 0.2s ease; color: var(--pp-text-dim);
  }
  .pp-sidebar-nav button:hover { color: var(--pp-text); background: var(--pp-sidebar-hover); }
  .pp-sidebar-nav button.active {
    color: var(--pp-teal); background: var(--pp-sidebar-active); font-weight: 600;
  }
  .pp-sidebar-nav button.active .sid-dot {
    background: var(--pp-teal); box-shadow: 0 0 6px rgba(10,155,142,0.5);
  }
  .sid-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--pp-dot-inactive); flex-shrink: 0; transition: all 0.2s ease;
  }

  .pp-content { min-width: 0; }
  .pp-section { margin-bottom: 4rem; scroll-margin-top: 90px; }
  .section-anchor {
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;
  }
  .section-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .section-icon.teal {
    background: var(--pp-section-icon-teal-bg);
    border: 1px solid var(--pp-section-icon-teal-bd);
  }
  .section-icon.gold {
    background: var(--pp-section-icon-gold-bg);
    border: 1px solid var(--pp-section-icon-gold-bd);
  }
  .pp-section h2 {
    font-family: 'Sora', sans-serif; font-size: 1.5rem;
    font-weight: 700; color: var(--pp-text);
  }
  .pp-section h3 {
    font-family: 'Sora', sans-serif; font-size: 1.05rem;
    font-weight: 600; color: var(--pp-text); margin: 2rem 0 0.75rem;
  }
  .pp-section p {
    color: var(--pp-text-muted); line-height: 1.8;
    font-size: 0.95rem; margin-bottom: 1rem;
  }
  .pp-section ul { list-style: none; margin-bottom: 1.25rem; }
  .pp-section ul li {
    color: var(--pp-text-muted); font-size: 0.95rem;
    line-height: 1.7; padding: 0.4rem 0 0.4rem 1.5rem;
    position: relative; border-bottom: 1px solid var(--pp-list-border);
  }
  .pp-section ul li::before {
    content: ''; position: absolute; left: 0; top: 0.55rem;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--pp-teal);
  }
  .pp-section ul li:last-child { border-bottom: none; }

  .highlight-box {
    background: var(--pp-highlight-bg);
    border: 1px solid var(--pp-highlight-border);
    border-left: 3px solid var(--pp-highlight-left);
    border-radius: 0 12px 12px 0;
    padding: 1.25rem 1.5rem; margin: 1.5rem 0;
  }
  .highlight-box.gold-box {
    background: var(--pp-gold-box-bg);
    border-color: var(--pp-gold-box-border);
    border-left-color: var(--pp-gold-box-left);
  }
  .highlight-box p { margin: 0; color: var(--pp-text-muted); }

  .data-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem; margin: 1.5rem 0;
  }
  .data-card {
    background: var(--pp-data-card-bg);
    border: 1px solid var(--pp-data-card-border);
    border-radius: 12px; padding: 1.25rem; transition: border-color 0.2s ease;
  }
  .data-card:hover { border-color: var(--pp-border-hover); }
  .data-card-title {
    font-family: 'Sora', sans-serif; font-size: 0.85rem;
    font-weight: 600; color: var(--pp-teal); margin-bottom: 0.5rem;
  }
  .data-card p {
    font-size: 0.8rem; color: var(--pp-text-dim); margin: 0; line-height: 1.6;
  }

  .pp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--pp-divider), transparent);
    margin: 3rem 0;
  }

  .contact-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem; margin-top: 1.5rem;
  }
  .contact-card {
    background: var(--pp-contact-card-bg);
    border: 1px solid var(--pp-contact-card-bd);
    border-radius: 12px; padding: 1.25rem;
    display: flex; align-items: flex-start; gap: 0.75rem;
  }
  .contact-card-icon {
    width: 36px; height: 36px;
    background: var(--pp-contact-icon-bg);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .contact-card-label { font-size: 0.75rem; color: var(--pp-contact-label); margin-bottom: 0.25rem; }
  .contact-card-value { font-size: 0.9rem; color: var(--pp-text); font-weight: 500; }
  .contact-card-value a { color: var(--pp-teal); text-decoration: none; }
  .contact-card-value a:hover { text-decoration: underline; }

  .pp-footer {
    background: var(--pp-footer-bg);
    border-top: 1px solid var(--pp-footer-border);
    padding: 2rem; text-align: center;
  }
  .pp-footer p { font-size: 0.8rem; color: var(--pp-text-dimmer); }
  .pp-footer a { color: var(--pp-teal); text-decoration: none; }
`}</style>

      <nav className={`pp-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" className="pp-nav-logo">
          SnappX
        </Link>
        <Link href="/" className="pp-nav-back">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </nav>

      <div className="pp-hero">
        <div className="pp-badge">
          <Shield size={12} /> Privacy First
        </div>
        <h1>
          Your Privacy,
          <br />
          <span>Our Responsibility</span>
        </h1>
        <p>
          We handle your financial data with the highest level of care. This
          policy explains exactly what we collect, why we collect it, and how we
          protect it.
        </p>
        <div className="pp-meta">
          <span>
            Last updated: <strong>April 8, 2026</strong>
          </span>
          <span>
            Effective: <strong>April 23, 2026</strong>
          </span>
        </div>
      </div>

      <div className="pp-layout">
        <aside className="pp-sidebar">
          <div className="pp-sidebar-label">On this page</div>
          <ul className="pp-sidebar-nav">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <button
                  className={activeSection === id ? 'active' : ''}
                  onClick={() => scrollTo(id)}
                >
                  <span className="sid-dot" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="pp-content">
          <section id="overview" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon teal">
                <Shield size={18} color="var(--pp-teal)" />
              </div>
              <h2>Overview</h2>
            </div>
            <p>
              SnappX is a digital savings platform designed for Ghanaians. We
              operate under Ghanaian data protection laws and are committed to
              handling your personal information responsibly and transparently.
            </p>
            <p>
              This Privacy Policy applies to all SnappX services, including our
              web application and APIs. By creating a SnappX account, you agree
              to the practices described in this policy.
            </p>
            <div className="highlight-box">
              <p>
                🔐 <strong>Key commitment:</strong> Your Mobile Money number is
                never stored in plain text. We encrypt it at rest and store only
                a one-way cryptographic hash for identity matching. Meaning even
                our engineers cannot read your MoMo number.
              </p>
            </div>
          </section>

          <div className="pp-divider" />

          <section id="collection" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon gold">
                <Eye size={18} color="var(--pp-gold)" />
              </div>
              <h2>Data We Collect</h2>
            </div>
            <p>
              We collect only the information necessary to provide our savings
              services and comply with Ghanaian financial regulations.
            </p>

            <h3>Account & Identity Information</h3>
            <ul>
              <li>Full legal name (as registered on your MoMo account)</li>
              <li>Email address</li>
              <li>Date of birth (for age verification)</li>
              <li>Ghana POST Digital Address</li>
              <li>User type (student or worker)</li>
            </ul>

            <h3>Payment & MoMo Details</h3>
            <ul>
              <li>Mobile Money provider (MTN, Telecel, or AirtelTigo)</li>
              <li>
                Mobile Money phone number. Stored encrypted, never in plain text
              </li>
              <li>Name registered on the MoMo account</li>
            </ul>

            <h3>KYC / Identity Verification (Group Admins Only)</h3>
            <ul>
              <li>Ghana Card front and back images</li>
              <li>Live selfie photo</li>
              <li>
                All KYC documents are stored in a private, access-controlled
                cloud storage with time-limited signed URLs
              </li>
            </ul>

            <div className="data-grid">
              <div className="data-card">
                <div className="data-card-title">📱 Transaction Data</div>
                <p>
                  Contribution records, payout history, wallet top-ups, and
                  cash-out requests
                </p>
              </div>
              <div className="data-card">
                <div className="data-card-title">📊 Usage Data</div>
                <p>
                  App interactions, feature usage, and session information for
                  improving your experience
                </p>
              </div>
              <div className="data-card">
                <div className="data-card-title">🔔 Communication Data</div>
                <p>
                  OTP delivery logs, email notification preferences, and in-app
                  notification history
                </p>
              </div>
              <div className="data-card">
                <div className="data-card-title">🛡️ Security Logs</div>
                <p>
                  Login attempts, IP addresses, and audit trail for all
                  financial actions
                </p>
              </div>
            </div>

            <h3>What We Do NOT Collect</h3>
            <ul>
              <li>
                Your MoMo PIN or bank account passwords. We never ask for these.
              </li>
              <li>Social media profiles or browsing history.</li>
              <li>Contact lists or device files.</li>
            </ul>
          </section>

          <div className="pp-divider" />

          <section id="use" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon teal">
                <Server size={18} color="var(--pp-teal)" />
              </div>
              <h2>How We Use Your Data</h2>
            </div>
            <ul>
              <li>To create and maintain your SnappX account</li>
              <li>
                To process group contributions and trigger payouts via Paystack
                to your registered MoMo number
              </li>
              <li>
                To verify your identity via OTP before sensitive actions (phone
                verification, password reset, MoMo number changes)
              </li>
              <li>
                To enforce contribution deadlines and send goal reminders via
                email
              </li>
              <li>To generate your personalized savings analytics dashboard</li>
              <li>
                To detect and prevent fraud, abuse, and unauthorized access
                using rate limiting and audit logs
              </li>
              <li>
                To comply with Anti-Money Laundering (AML) regulations
                applicable to Ghanaian fintech operators
              </li>
              <li>
                To provide in-app AI financial coaching. Your chat messages are
                processed in real-time and not stored permanently
              </li>
            </ul>
            <div className="highlight-box gold-box">
              <p>
                ⚠️ We do not use your data for advertising or sell it to
                marketing companies. SnappX products are completely ad-free and
                your data is never monetized for third-party marketing purposes.
              </p>
            </div>
          </section>

          <div className="pp-divider" />

          <section id="storage" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon teal">
                <Lock size={18} color="var(--pp-teal)" />
              </div>
              <h2>Storage & Security</h2>
            </div>
            <p>
              Your data is stored on Neon PostgreSQL with TLS 1.3 in transit.
              Sensitive fields like your Mobile Money number are additionally
              protected with application-level AES-256 field encryption and a
              one-way salted hash. Meaning database access alone is not
              sufficient to expose your financial identifiers.
            </p>
            <h3>How we protect your MoMo number</h3>
            <p>
              Your MoMo number is processed through a two-layer security model:
              the raw number is encrypted using AES-256 via our field-level
              encryption library before database storage. A separate salted
              SHA-256 one-way hash is stored for fast identity matching (login,
              uniqueness checks). This means even in the event of a database
              breach, your MoMo number cannot be recovered by any party.
            </p>
            <h3>KYC Document Security</h3>
            <p>
              Ghana Card images and selfies uploaded during KYC verification are
              stored in a private-type Cloudinary bucket. These files are never
              publicly accessible. Admin access generates time-limited signed
              URLs (30-minute expiry) that are not shareable or cacheable.
            </p>
            <h3>Authentication Security</h3>
            <ul>
              <li>
                JWT access tokens expire after 5 minutes; refresh tokens after
                30 days
              </li>
              <li>
                OTP codes for phone verification expire after 10 minutes and are
                single-use (invalidated immediately after successful
                verification)
              </li>
              <li>
                Repeated failed login attempts trigger automatic lockouts with
                30-minute cooldown periods
              </li>
              <li>
                All state-changing requests (contributions, cashouts, profile
                updates) require a unique idempotency key to prevent duplicate
                transactions
              </li>
            </ul>
          </section>

          <div className="pp-divider" />

          <section id="sharing" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon gold">
                <Globe size={18} color="var(--pp-gold)" />
              </div>
              <h2>Sharing Your Data</h2>
            </div>
            <p>
              We share your data only with trusted service providers who are
              contractually bound to protect it:
            </p>
            <div className="data-grid">
              <div className="data-card">
                <div className="data-card-title">💳 Paystack</div>
                <p>
                  Processes all MoMo transfers for group payouts and cashouts.
                  We share your name, MoMo number, and provider for transfer
                  recipient creation.
                </p>
              </div>
              <div className="data-card">
                <div className="data-card-title">📸 Cloudinary</div>
                <p>
                  Stores your profile picture and KYC documents in private,
                  encrypted cloud storage accessible only to authorized SnappX
                  staff.
                </p>
              </div>
              <div className="data-card">
                <div className="data-card-title">📨 SendGrid</div>
                <p>
                  Delivers transactional emails including OTP codes, payout
                  notifications, and goal reminders to your registered email
                  address.
                </p>
              </div>
              <div className="data-card">
                <div className="data-card-title">📲 Dawurobo</div>
                <p>
                  Delivers SMS OTP codes to your MoMo number for phone
                  verification. Only your phone number is shared for this
                  purpose.
                </p>
              </div>
            </div>
            <p>
              We do not share your data with group members beyond what is
              necessary for group management. Other members can see your display
              name and contribution status within shared groups, but never your
              MoMo number or personal financial details.
            </p>
          </section>

          <div className="pp-divider" />

          <section id="rights" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon teal">
                <Shield size={18} color="var(--pp-teal)" />
              </div>
              <h2>Your Rights</h2>
            </div>
            <p>
              Under Ghana&apos;s Data Protection Act (2012), you have the
              following rights:
            </p>
            <ul>
              <li>
                <strong>Right of Access:</strong> Under Sections 32 and 35 of
                the Act, you have the right to request confirmation of whether
                we hold personal data about you, a description of that data, and
                the purpose for which it is being processed. We are required to
                comply within 40 days of receiving your request. We may ask you
                to verify your identity before responding. A prescribed fee may
                apply.
              </li>
              <li>
                <strong>Right to Correction and Deletion:</strong> Under
                Sections 33 & 44, you may request that we correct or delete
                personal data about you that is inaccurate, irrelevant,
                excessive, out of date, incomplete, misleading, or obtained
                unlawfully. You may also request deletion of records we no
                longer have authorization to retain. We will either comply or
                provide you with credible evidence justifying why the data is
                accurate. Where we correct data, we are required to notify any
                third parties to whom it was previously disclosed.
              </li>
              <li>
                <strong>Right to Object to Processing:</strong> Under Sections
                20(2) & 39, you may at any time give us written notice requiring
                us to stop processing your personal data if that processing is
                causing or is likely to cause you unwarranted damage or
                distress. We must respond within 21 days, either confirming
                compliance or stating our reasons for not complying. Under
                Section 20(2), a general right to object to processing also
                exists unless the processing is required by law or contract.
              </li>
              <li>
                <strong>
                  Right to Complain to the Data Protection Commission:
                </strong>{' '}
                Under Section 77, you may request the Data Protection Commission
                (DPC) to assess whether our processing of your data complies
                with Act 843. The Commission may investigate and issue an
                enforcement notice requiring us to comply.
              </li>
            </ul>
            <div className="highlight-box">
              <p>
                To exercise any of these rights, email us at{' '}
                <strong>info@snappx.app</strong> with the subject line
                &apos;Data Rights Request&apos;. We will respond within 30 days.
              </p>
            </div>
          </section>

          <div className="pp-divider" />

          <section id="retention" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon gold">
                <Trash2 size={18} color="var(--pp-gold)" />
              </div>
              <h2>Data Retention</h2>
            </div>
            <ul>
              <li>
                <strong>Account data:</strong> Retained for the lifetime of your
                account, plus 90 days after deletion request
              </li>
              <li>
                <strong>Financial transaction records (LedgerEntries):</strong>{' '}
                Retained for 7 years in compliance with Ghanaian financial
                regulations. These are immutable audit records and cannot be
                deleted on request
              </li>
              <li>
                <strong>KYC documents:</strong> Retained for 5 years after
                account closure
              </li>
              <li>
                <strong>OTP records:</strong> Purged immediately upon
                invalidation
              </li>
              <li>
                <strong>AI chat messages:</strong> Not stored, processed in
                real-time only
              </li>
            </ul>
          </section>

          <div className="pp-divider" />

          <section id="cookies" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon teal">
                <Bell size={18} color="var(--pp-teal)" />
              </div>
              <h2>Cookies</h2>
            </div>
            <p>
              We use only essential session cookies required for authentication.
              We do not use advertising cookies, tracking pixels, or third-party
              analytics that send your data to external companies.
            </p>
            <ul>
              <li>
                <strong>Auth session cookie:</strong> Stores your login session
                securely (HttpOnly, Secure, SameSite=Strict)
              </li>
              <li>
                <strong>Theme preference:</strong> Stores your dark/light mode
                preference locally, never sent to our servers
              </li>
            </ul>
          </section>

          <div className="pp-divider" />

          <section id="changes" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon gold">
                <Globe size={18} color="var(--pp-gold)" />
              </div>
              <h2>Policy Changes</h2>
            </div>
            <p>
              When we make material changes to this policy, we will notify you
              via email and via in-app notification at least 14 days before the
              changes take effect. Continued use of SnappX after that date
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <div className="pp-divider" />

          <section id="contact" className="pp-section">
            <div className="section-anchor">
              <div className="section-icon teal">
                <Mail size={18} color="var(--pp-teal)" />
              </div>
              <h2>Contact Us</h2>
            </div>
            <p>
              For privacy-related questions, data requests, or to report a
              concern, reach our Data Protection Officer through any of the
              channels below:
            </p>
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-card-icon">
                  <Mail size={16} color="var(--pp-teal)" />
                </div>
                <div>
                  <div className="contact-card-label">Privacy Enquiries</div>
                  <div className="contact-card-value">
                    <a href="mailto:info@snappx.app">info@snappx.app</a>
                  </div>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">
                  <Phone size={16} color="var(--pp-teal)" />
                </div>
                <div>
                  <div className="contact-card-label">Support Line</div>
                  <div className="contact-card-value">
                    <a href="tel:0541413623">0541413623</a>
                  </div>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">
                  <Globe size={16} color="var(--pp-teal)" />
                </div>
                <div>
                  <div className="contact-card-label">Registered Address</div>
                  <div className="contact-card-value">Adenta, Accra, Ghana</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="pp-footer">
        <p>
          © 2026 SnappX. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/terms">Terms of Service</Link> &nbsp;·&nbsp;{' '}
          <Link href="/security">Security</Link> &nbsp;·&nbsp;{' '}
          <Link href="/faq">FAQ</Link>
        </p>
      </footer>
    </>
  );
}
