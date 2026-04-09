'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Users,
  Wallet,
  AlertTriangle,
  Ban,
  Scale,
  CheckCircle,
  CreditCard,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'account', label: 'Your Account' },
  { id: 'groups', label: 'Savings Groups' },
  { id: 'contributions', label: 'Contributions & Payouts' },
  { id: 'wallet', label: 'Wallet & Payments' },
  { id: 'prohibited', label: 'Prohibited Conduct' },
  { id: 'termination', label: 'Termination' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'disputes', label: 'Dispute Resolution' },
  { id: 'governing', label: 'Governing Law' },
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('acceptance');
  const observerRef = useRef<IntersectionObserver | null>(null);

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
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Adaptive tokens ── */
  :root {
    /* LIGHT MODE = default */
    --tos-bg:              #f5f8fa;
    --tos-text:            #0d1f28;
    --tos-text-muted:      rgba(13,31,40,0.68);
    --tos-text-dim:        rgba(13,31,40,0.5);
    --tos-text-dimmer:     rgba(13,31,40,0.35);
    --tos-teal:            #0a8a7e;
    --tos-gold:            #a8832a;
    --tos-nav-bg:          rgba(245,248,250,0.92);
    --tos-nav-border:      rgba(168,131,42,0.15);
    --tos-hero-glow:       rgba(168,131,42,0.05);
    --tos-badge-bg:        rgba(168,131,42,0.08);
    --tos-badge-border:    rgba(168,131,42,0.22);
    --tos-meta-text:       rgba(13,31,40,0.4);
    --tos-sidebar-active:  rgba(168,131,42,0.09);
    --tos-sidebar-hover:   rgba(168,131,42,0.06);
    --tos-dot-inactive:    rgba(13,31,40,0.15);
    --tos-icon-teal-bg:    rgba(10,155,142,0.08);
    --tos-icon-teal-bd:    rgba(10,155,142,0.18);
    --tos-icon-gold-bg:    rgba(168,131,42,0.08);
    --tos-icon-gold-bd:    rgba(168,131,42,0.18);
    --tos-icon-red-bg:     rgba(220,38,38,0.07);
    --tos-icon-red-bd:     rgba(220,38,38,0.16);
    --tos-li-border:       rgba(13,31,40,0.06);
    --tos-callout-teal-bg: rgba(10,155,142,0.06);
    --tos-callout-teal-bd: rgba(10,155,142,0.18);
    --tos-callout-gold-bg: rgba(168,131,42,0.06);
    --tos-callout-gold-bd: rgba(168,131,42,0.18);
    --tos-callout-red-bg:  rgba(220,38,38,0.06);
    --tos-callout-red-bd:  rgba(220,38,38,0.14);
    --tos-rule-bg:         #ffffff;
    --tos-rule-border:     rgba(10,155,142,0.12);
    --tos-rule-hover:      rgba(168,131,42,0.2);
    --tos-rule-p:          rgba(13,31,40,0.5);
    --tos-divider:         rgba(168,131,42,0.13);
    --tos-num-bg:          rgba(168,131,42,0.1);
    --tos-num-bd:          rgba(168,131,42,0.22);
    --tos-footer-bg:       rgba(168,131,42,0.03);
    --tos-footer-border:   rgba(168,131,42,0.1);
  }

  /* DARK MODE – triggered by the .dark class */
  .dark {
    --tos-bg:              #060b0f;
    --tos-text:            #e2ebf0;
    --tos-text-muted:      rgba(226,235,240,0.65);
    --tos-text-dim:        rgba(226,235,240,0.5);
    --tos-text-dimmer:     rgba(226,235,240,0.3);
    --tos-teal:            #0A9B8E;
    --tos-gold:            #C8A96E;
    --tos-nav-bg:          rgba(6,11,15,0.88);
    --tos-nav-border:      rgba(200,169,110,0.12);
    --tos-hero-glow:       rgba(200,169,110,0.06);
    --tos-badge-bg:        rgba(200,169,110,0.1);
    --tos-badge-border:    rgba(200,169,110,0.25);
    --tos-meta-text:       rgba(226,235,240,0.35);
    --tos-sidebar-active:  rgba(200,169,110,0.1);
    --tos-sidebar-hover:   rgba(200,169,110,0.06);
    --tos-dot-inactive:    rgba(226,235,240,0.15);
    --tos-icon-teal-bg:    rgba(10,155,142,0.1);
    --tos-icon-teal-bd:    rgba(10,155,142,0.2);
    --tos-icon-gold-bg:    rgba(200,169,110,0.1);
    --tos-icon-gold-bd:    rgba(200,169,110,0.2);
    --tos-icon-red-bg:     rgba(239,68,68,0.1);
    --tos-icon-red-bd:     rgba(239,68,68,0.2);
    --tos-li-border:       rgba(255,255,255,0.04);
    --tos-callout-teal-bg: rgba(10,155,142,0.07);
    --tos-callout-teal-bd: rgba(10,155,142,0.2);
    --tos-callout-gold-bg: rgba(200,169,110,0.07);
    --tos-callout-gold-bd: rgba(200,169,110,0.2);
    --tos-callout-red-bg:  rgba(239,68,68,0.07);
    --tos-callout-red-bd:  rgba(239,68,68,0.15);
    --tos-rule-bg:         rgba(255,255,255,0.03);
    --tos-rule-border:     rgba(255,255,255,0.07);
    --tos-rule-hover:      rgba(200,169,110,0.2);
    --tos-rule-p:          rgba(226,235,240,0.45);
    --tos-divider:         rgba(200,169,110,0.15);
    --tos-num-bg:          rgba(200,169,110,0.15);
    --tos-num-bd:          rgba(200,169,110,0.25);
    --tos-footer-bg:       rgba(255,255,255,0.02);
    --tos-footer-border:   rgba(255,255,255,0.06);
  }

  body {
    background: var(--tos-bg);
    color: var(--tos-text);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── All other styles remain exactly the same ── */
  .tos-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 0 2rem;
    background: var(--tos-nav-bg);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--tos-nav-border);
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .tos-nav-logo {
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.25rem;
    color: var(--tos-gold); text-decoration: none;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .tos-nav-logo span { color: var(--tos-teal); }
  .tos-nav-back {
    display: flex; align-items: center; gap: 0.5rem;
    color: var(--tos-text-dim); text-decoration: none;
    font-size: 0.875rem; font-weight: 500; transition: color 0.2s;
  }
  .tos-nav-back:hover { color: var(--tos-gold); }

  .tos-hero {
    padding: 120px 2rem 60px;
    max-width: 1200px; margin: 0 auto; text-align: center;
    position: relative;
  }
  .tos-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, var(--tos-hero-glow), transparent 70%);
    pointer-events: none;
  }
  .tos-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--tos-badge-bg);
    border: 1px solid var(--tos-badge-border);
    border-radius: 100px; padding: 0.35rem 1rem;
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--tos-gold); margin-bottom: 1.5rem;
  }
  .tos-hero h1 {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800; line-height: 1.05;
    color: var(--tos-text); margin-bottom: 1.25rem;
  }
  .tos-hero h1 em { font-style: normal; color: var(--tos-gold); }
  .tos-hero p {
    color: var(--tos-text-dim); font-size: 1.05rem;
    line-height: 1.7; max-width: 580px; margin: 0 auto 2rem;
  }
  .tos-meta {
    display: flex; align-items: center; justify-content: center;
    gap: 2rem; flex-wrap: wrap; font-size: 0.8rem;
    color: var(--tos-meta-text);
  }
  .tos-meta strong { color: var(--tos-gold); }

  .tos-layout {
    max-width: 1200px; margin: 0 auto;
    padding: 0 2rem 6rem;
    display: grid; grid-template-columns: 240px 1fr;
    gap: 4rem; align-items: start;
  }
  @media (max-width: 900px) {
    .tos-layout { grid-template-columns: 1fr; }
    .tos-sidebar { display: none; }
  }

  .tos-sidebar { position: sticky; top: 84px; }
  .tos-sidebar-label {
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--tos-gold); margin-bottom: 1rem;
  }
  .tos-sidebar-nav { list-style: none; }
  .tos-sidebar-nav li { margin-bottom: 0.125rem; }
  .tos-sidebar-nav button {
    width: 100%; text-align: left;
    background: none; border: none; cursor: pointer;
    padding: 0.45rem 0.75rem; border-radius: 8px;
    font-size: 0.83rem; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 0.5rem;
    transition: all 0.2s; color: var(--tos-text-dim);
  }
  .tos-sidebar-nav button:hover { color: var(--tos-text); background: var(--tos-sidebar-hover); }
  .tos-sidebar-nav button.active {
    color: var(--tos-gold); background: var(--tos-sidebar-active); font-weight: 600;
  }
  .tos-sidebar-nav button.active .s-dot { background: var(--tos-gold); box-shadow: 0 0 6px rgba(200,169,110,0.5); }
  .s-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--tos-dot-inactive); flex-shrink: 0; transition: all 0.2s;
  }

  .tos-content { min-width: 0; }
  .tos-section { margin-bottom: 4rem; scroll-margin-top: 90px; }
  .section-h { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
  .s-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .s-icon.teal { background: var(--tos-icon-teal-bg); border: 1px solid var(--tos-icon-teal-bd); }
  .s-icon.gold { background: var(--tos-icon-gold-bg); border: 1px solid var(--tos-icon-gold-bd); }
  .s-icon.red  { background: var(--tos-icon-red-bg);  border: 1px solid var(--tos-icon-red-bd); }

  .tos-section h2 {
    font-family: 'Sora', sans-serif; font-size: 1.5rem;
    font-weight: 700; color: var(--tos-text);
  }
  .tos-section h3 {
    font-family: 'Sora', sans-serif; font-size: 1.05rem;
    font-weight: 600; color: var(--tos-text); margin: 2rem 0 0.75rem;
  }
  .tos-section p {
    color: var(--tos-text-muted); line-height: 1.8;
    font-size: 0.95rem; margin-bottom: 1rem;
  }
  .tos-section ul { list-style: none; margin-bottom: 1.25rem; }
  .tos-section ul li {
    color: var(--tos-text-muted); font-size: 0.93rem; line-height: 1.7;
    padding: 0.45rem 0 0.45rem 1.5rem; position: relative;
    border-bottom: 1px solid var(--tos-li-border);
  }
  .tos-section ul li:last-child { border-bottom: none; }
  .tos-section ul li::before {
    content: ''; position: absolute; left: 0; top: 50%;
    transform: translateY(-50%); width: 6px; height: 6px;
    border-radius: 50%; background: var(--tos-gold);
  }
  .tos-section ul.teal-bullets li::before { background: var(--tos-teal); }
  .tos-section ul.red-bullets li::before { background: #ef4444; }

  .callout {
    border-radius: 0 12px 12px 0; padding: 1.25rem 1.5rem; margin: 1.5rem 0;
  }
  .callout.gold {
    background: var(--tos-callout-gold-bg);
    border: 1px solid var(--tos-callout-gold-bd);
    border-left: 3px solid var(--tos-gold);
  }
  .callout.teal {
    background: var(--tos-callout-teal-bg);
    border: 1px solid var(--tos-callout-teal-bd);
    border-left: 3px solid var(--tos-teal);
  }
  .callout.red {
    background: var(--tos-callout-red-bg);
    border: 1px solid var(--tos-callout-red-bd);
    border-left: 3px solid #ef4444;
  }
  .callout p { margin: 0; color: var(--tos-text-muted); }

  .rule-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem; margin: 1.5rem 0;
  }
  .rule-card {
    background: var(--tos-rule-bg);
    border: 1px solid var(--tos-rule-border);
    border-radius: 12px; padding: 1.25rem; transition: border-color 0.2s;
  }
  .rule-card:hover { border-color: var(--tos-rule-hover); }
  .rule-card-icon { font-size: 1.5rem; margin-bottom: 0.6rem; }
  .rule-card-title {
    font-family: 'Sora', sans-serif; font-size: 0.85rem;
    font-weight: 600; color: var(--tos-gold); margin-bottom: 0.4rem;
  }
  .rule-card p { font-size: 0.8rem; color: var(--tos-rule-p); margin: 0; line-height: 1.6; }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--tos-divider), transparent);
    margin: 3rem 0;
  }

  .number-list { list-style: none; counter-reset: item; margin-bottom: 1.25rem; }
  .number-list li {
    counter-increment: item;
    color: var(--tos-text-muted); font-size: 0.93rem; line-height: 1.7;
    padding: 0.5rem 0 0.5rem 2.5rem; position: relative;
    border-bottom: 1px solid var(--tos-li-border);
  }
  .number-list li:last-child { border-bottom: none; }
  .number-list li::before {
    content: counter(item);
    position: absolute; left: 0; top: 0.5rem;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--tos-num-bg);
    border: 1px solid var(--tos-num-bd);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 700; color: var(--tos-gold);
    font-family: 'Sora', sans-serif;
  }

  .tos-footer {
    background: var(--tos-footer-bg);
    border-top: 1px solid var(--tos-footer-border);
    padding: 2rem; text-align: center;
  }
  .tos-footer p { font-size: 0.8rem; color: var(--tos-text-dimmer); }
  .tos-footer a { color: var(--tos-gold); text-decoration: none; }
`}</style>
      <nav className="tos-nav">
        <Link href="/" className="tos-nav-logo">
          SnappX
        </Link>
        <Link href="/" className="tos-nav-back">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </nav>

      <div className="tos-hero">
        <div className="tos-badge">
          <FileText size={12} /> Legal Agreement
        </div>
        <h1>
          Terms of <em>Service</em>
        </h1>
        <p>
          Please read these terms carefully before using SnappX. By creating an
          account, you agree to be bound by these terms and our community
          standards for fair savings.
        </p>
        <div className="tos-meta">
          <span>
            Last updated: <strong>April 8, 2026</strong>
          </span>
          <span>
            Effective: <strong>April 23, 2026</strong>
          </span>
        </div>
      </div>

      <div className="tos-layout">
        <aside className="tos-sidebar">
          <div className="tos-sidebar-label">Contents</div>
          <ul className="tos-sidebar-nav">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <button
                  className={activeSection === id ? 'active' : ''}
                  onClick={() => scrollTo(id)}
                >
                  <span className="s-dot" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="tos-content">
          <section id="acceptance" className="tos-section">
            <div className="section-h">
              <div className="s-icon gold">
                <CheckCircle size={18} color="var(--tos-gold)" />
              </div>
              <h2>Acceptance of Terms</h2>
            </div>
            <p>
              These Terms of Service constitute a legally binding agreement
              between you and SnappX Technologies Ltd.
            </p>
            <p>
              By registering for an account, joining a savings group, or making
              a contribution, you confirm that you have read, understood, and
              agree to these Terms and our Privacy Policy. If you do not agree,
              you must not use the service.
            </p>
            <div className="callout teal">
              <p>
                📅 We reserve the right to update these Terms. When changes are
                material, we will notify you via email and in-app notification
                at least 14 days before they take effect. Continued use after
                that date constitutes acceptance.
              </p>
            </div>
          </section>

          <div className="divider" />

          <section id="eligibility" className="tos-section">
            <div className="section-h">
              <div className="s-icon teal">
                <Users size={18} color="var(--tos-teal)" />
              </div>
              <h2>Eligibility</h2>
            </div>
            <p>To create a SnappX account, you must:</p>
            <ul className="teal-bullets">
              <li>Be at least 18 years of age</li>
              <li>
                Be a resident or citizen of Ghana or have a valid Ghanaian
                Mobile Money account
              </li>
              <li>Have a valid Ghana POST Digital Address</li>
              <li>Own the Mobile Money account you register with SnappX</li>
              <li>Not have been previously banned or suspended from SnappX</li>
              <li>
                Not be prohibited by Ghanaian law from participating in digital
                financial services
              </li>
            </ul>
            <p>
              You may only create one account per person. Creating multiple
              accounts to circumvent restrictions or gain unfair advantage is
              prohibited.
            </p>
          </section>

          <div className="divider" />

          <section id="account" className="tos-section">
            <div className="section-h">
              <div className="s-icon gold">
                <Scale size={18} color="var(--tos-gold)" />
              </div>
              <h2>Your Account</h2>
            </div>
            <h3>Account Security</h3>
            <p>
              You are solely responsible for maintaining the confidentiality of
              your password and all activities that occur under your account.
              You must notify us immediately at{' '}
              <strong>hello@snappx.app</strong> if you suspect any unauthorized
              access.
            </p>
            <ul>
              <li>
                Never share your OTP codes with anyone. SnappX will never ask
                for your OTP by phone or email.
              </li>
              <li>
                Use a strong, unique password not used on other platforms.
              </li>
              <li>
                Log out of shared or public devices immediately after use.
              </li>
            </ul>
            <h3>Account Verification</h3>
            <p>
              Your account must be verified via SMS OTP before you can
              contribute to groups or receive payouts. Users who create savings
              groups must complete our KYC (Know Your Customer) process by
              uploading a valid Ghana Card and a live selfie. Unverified
              accounts have restricted access to financial features.
            </p>
            <h3>Accurate Information</h3>
            <p>
              You agree to provide accurate, current, and complete information
              during registration and to update your information promptly if it
              changes. Providing false information including falsifying your
              Ghana Card or live selfie will result in immediate account
              termination and may be reported to relevant authorities.
            </p>
          </section>

          <div className="divider" />

          <section id="groups" className="tos-section">
            <div className="section-h">
              <div className="s-icon teal">
                <Users size={18} color="var(--tos-teal)" />
              </div>
              <h2>Savings Groups</h2>
            </div>
            <p>
              SnappX facilitates digital susu savings groups. Each group
              operates under the following rules:
            </p>

            <h3>Group Creation</h3>
            <ul className="teal-bullets">
              <li>
                Group admins must complete KYC verification before creating a
                group.
              </li>
              <li>Groups must have between 2 and 50 members.</li>
              <li>
                Contribution amounts must be between ₵1.00 and ₵50,000 per
                cycle.
              </li>
              <li>
                Group names must be unique across the platform and not contain
                offensive content.
              </li>
              <li>
                The admin is automatically added as the first member and holds
                the first payout position.
              </li>
            </ul>

            <h3>Group Administration</h3>
            <p>
              As a group admin, you are responsible for reviewing and approving
              or rejecting member join requests in a timely manner. Admins must
              act fairly and without discrimination. Misuse of admin powers
              including approving fake members, manipulating payout order, or
              extracting funds through unauthorized means is grounds for
              termination and potential legal action.
            </p>

            <h3>Payout Order</h3>
            <p>
              Payout order is determined by join date (earliest members receive
              payout first) and is set automatically when a group reaches full
              capacity. The payout rotation is displayed transparently to all
              members. SnappX does not allow admins to manually reorder payout
              positions after the group has been activated.
            </p>

            <h3>Group Invite Links</h3>
            <p>
              Admins may generate invite links to share groups privately. Invite
              links bypass the standard join request approval flow. Admins who
              misuse invite links to add unauthorized or fraudulent members are
              fully liable for resulting disputes.
            </p>
          </section>

          <div className="divider" />

          <section id="contributions" className="tos-section">
            <div className="section-h">
              <div className="s-icon gold">
                <CreditCard size={18} color="var(--tos-gold)" />
              </div>
              <h2>Contributions & Payouts</h2>
            </div>

            <h3>Making Contributions</h3>
            <p>
              Contributions are debited from your SnappX wallet balance. Your
              wallet must have sufficient funds before contributing. You are
              responsible for topping up your wallet in advance of contribution
              deadlines.
            </p>
            <div className="rule-grid">
              <div className="rule-card">
                <div className="rule-card-icon">⏱️</div>
                <div className="rule-card-title">One Per Cycle</div>
                <p>
                  Only one contribution per member per cycle is accepted.
                  Duplicate payments are automatically rejected.
                </p>
              </div>
              <div className="rule-card">
                <div className="rule-card-icon">✅</div>
                <div className="rule-card-title">Verified = Final</div>
                <p>
                  Contributions are marked verified after successful wallet
                  debit. Verified contributions cannot be reversed except in
                  documented error cases.
                </p>
              </div>
              <div className="rule-card">
                <div className="rule-card-icon">🔒</div>
                <div className="rule-card-title">Idempotent</div>
                <p>
                  Our system uses idempotency keys to prevent accidental double
                  payments. Include X-Idempotency-Key headers for API users.
                </p>
              </div>
            </div>

            <h3>Payout Processing</h3>
            <p>
              Payouts are triggered automatically when all group members have
              contributed for the current cycle. Funds are transferred via
              Paystack to the beneficiary&apos;s registered MoMo number. SnappX
              targets same-day processing; actual delivery depends on your MoMo
              provider (typically within 24 hours).
            </p>
            <p>
              If a payout transfer fails (e.g. incorrect MoMo details, network
              error), SnappX will automatically retry the transfer. If retries
              fail, our team will contact you within 48 hours to resolve the
              issue. Your funds are never lost. They remain safely in the system
              until delivery is confirmed.
            </p>

            <h3>Service Fees</h3>
            <ul className="teal-bullets">
              <li>Group contributions: No service fee.</li>
              <li>
                Wallet top-ups: No fee charged by SnappX (Paystack processing
                fees may apply).
              </li>
              <li>
                Cash-out (wallet to MoMo): 8% service fee deducted from
                withdrawal amount.
              </li>
              <li>
                Group payouts: No fee. Beneficiary receives the full group pot.
              </li>
            </ul>
          </section>

          <div className="divider" />

          <section id="wallet" className="tos-section">
            <div className="section-h">
              <div className="s-icon teal">
                <Wallet size={18} color="var(--tos-teal)" />
              </div>
              <h2>Wallet & Payments</h2>
            </div>
            <p>
              Your SnappX wallet is an internal account that holds funds pending
              group contributions or available for cash-out. It is not a bank
              account and does not attract interest.
            </p>
            <ul className="teal-bullets">
              <li>Minimum top-up: ₵1.00 | Maximum: ₵50,000 per transaction.</li>
              <li>Minimum cash-out: ₵5.00</li>
              <li>
                Wallet balance can never go below ₵0.00. The system enforces
                this at the database level.
              </li>
              <li>
                All financial records are immutable. Every transaction is
                permanently recorded in our ledger and cannot be deleted.
              </li>
              <li>
                Wallet funds are held in pooled accounts with our payment
                partner Paystack, which is licensed by the Bank of Ghana.
              </li>
            </ul>
            <div className="callout gold">
              <p>
                💰 Your wallet balance is backed by real funds in licensed
                accounts. In the unlikely event of SnappX ceasing operations,
                all wallet balances will be refunded to your registered MoMo
                number within 30 days.
              </p>
            </div>
          </section>

          <div className="divider" />

          <section id="prohibited" className="tos-section">
            <div className="section-h">
              <div className="s-icon red">
                <Ban size={18} color="#ef4444" />
              </div>
              <h2>Prohibited Conduct</h2>
            </div>
            <p>
              The following activities are strictly prohibited and will result
              in immediate account suspension and possible legal action:
            </p>
            <ul className="red-bullets">
              <li>Creating fake accounts or impersonating another person.</li>
              <li>
                Using SnappX for money laundering, fraud, or any other illegal
                financial activity.
              </li>
              <li>
                Deliberately defaulting on agreed group contributions while
                remaining a member.
              </li>
              <li>
                Using multiple accounts to gain extra payout cycles or bypass
                group limits.
              </li>
              <li>
                Attempting to manipulate payout order, contribution records, or
                any other group data.
              </li>
              <li>
                Interfering with or attempting to hack SnappX systems, APIs, or
                infrastructure.
              </li>
              <li>
                Using automated tools or bots to interact with the platform.
              </li>
              <li>
                Coercing or threatening other members regarding contributions or
                payouts.
              </li>
              <li>
                Uploading fraudulent KYC documents (fake Ghana Cards, photos of
                others, etc.)
              </li>
              <li>
                Sharing your account credentials with third parties for
                financial gain.
              </li>
            </ul>
            <div className="callout red">
              <p>
                ⚠️ SnappX reserves the right to report suspected fraud or money
                laundering activities to the Financial Intelligence Centre (FIC)
                of Ghana and other relevant law enforcement authorities.
              </p>
            </div>
          </section>

          <div className="divider" />

          <section id="termination" className="tos-section">
            <div className="section-h">
              <div className="s-icon gold">
                <AlertTriangle size={18} color="var(--tos-gold)" />
              </div>
              <h2>Termination</h2>
            </div>
            <p>
              SnappX may suspend or terminate your account at any time for
              violations of these Terms, fraudulent activity, or conduct that
              harms other users or the platform.
            </p>
            <h3>Effect of Termination</h3>
            <ul>
              <li>
                Any wallet balance will be refunded to your registered MoMo
                number after deducting any outstanding obligations.
              </li>
              <li>
                If you are a group admin, you must designate a replacement admin
                before your account can be closed.
              </li>
              <li>
                If you are an active group member, you remain liable for any
                pending contributions for the current cycle.
              </li>
              <li>
                Transaction records are retained as required by law (minimum 7
                years) even after account closure.
              </li>
            </ul>
            <h3>Voluntary Account Deletion</h3>
            <p>
              You may request account deletion at any time by emailing{' '}
              <strong>hello@snappx.app</strong>. We will process your request
              within 30 days, subject to the conditions above. You cannot delete
              your account while you have an active admin role in a savings
              group.
            </p>
          </section>

          <div className="divider" />

          <section id="liability" className="tos-section">
            <div className="section-h">
              <div className="s-icon teal">
                <Scale size={18} color="var(--tos-teal)" />
              </div>
              <h2>Limitation of Liability</h2>
            </div>
            <p>
              SnappX is a platform facilitating savings groups. We are not a
              bank, investment firm, or licensed financial advisor. While we
              take every reasonable measure to protect your funds:
            </p>
            <ul className="teal-bullets">
              <li>
                We are not liable for delays in MoMo transfers caused by your
                mobile money provider or Paystack.
              </li>
              <li>
                We are not liable for losses arising from member default within
                a private savings group. Your group&apos;s social contract is
                your own.
              </li>
              <li>
                We are not liable for financial losses resulting from your
                breach of these Terms.
              </li>
              <li>
                Our maximum liability to you for any claim shall not exceed the
                total amount you have deposited with us in the preceding 6
                months.
              </li>
            </ul>
            <p>
              Nothing in these Terms excludes liability for death or personal
              injury caused by our negligence, fraud, or any liability that
              cannot be excluded by Ghanaian law.
            </p>
          </section>

          <div className="divider" />

          <section id="disputes" className="tos-section">
            <div className="section-h">
              <div className="s-icon gold">
                <Scale size={18} color="var(--tos-gold)" />
              </div>
              <h2>Dispute Resolution</h2>
            </div>
            <p>
              In the event of a dispute between members of a savings group,
              SnappX encourages good-faith negotiation first. If unresolved:
            </p>
            <ol className="number-list">
              <li>
                Contact SnappX Support at <strong>hello@snappx.app</strong>{' '}
                within 30 days of the dispute arising.
              </li>
              <li>
                We will review the transaction records, contribution history,
                and communications within 14 business days.
              </li>
              <li>
                Our decision on financial disputes involving platform errors is
                final and binding.
              </li>
              <li>
                For inter-member disputes beyond platform scope, we will provide
                a formal record of transactions to support mediation.
              </li>
              <li>
                Unresolved legal disputes shall be submitted to the jurisdiction
                of Ghanaian courts.
              </li>
            </ol>
          </section>

          <div className="divider" />

          <section id="governing" className="tos-section">
            <div className="section-h">
              <div className="s-icon teal">
                <Scale size={18} color="var(--tos-teal)" />
              </div>
              <h2>Governing Law</h2>
            </div>
            <p>
              These Terms are governed by the laws of the Republic of Ghana. Any
              legal action or proceeding relating to these Terms shall be
              brought exclusively in the courts of Ghana.
            </p>
            <p>
              For questions about these Terms, contact us at{' '}
              <strong>hello@snappx.app</strong> or call{' '}
              <strong>0541413623</strong>.
            </p>
          </section>
        </main>
      </div>

      <footer className="tos-footer">
        <p>
          © 2026 SnappX. &nbsp;·&nbsp;{' '}
          <Link href="/privacy">Privacy Policy</Link> &nbsp;·&nbsp;{' '}
          <Link href="/security">Security</Link> &nbsp;·&nbsp;{' '}
          <Link href="/faq">FAQ</Link>
        </p>
      </footer>
    </>
  );
}
