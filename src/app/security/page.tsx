'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  Lock,
  Server,
  Key,
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Mail,
  Phone,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const pillars = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    desc: 'Your Mobile Money number is encrypted with AES-256 before it ever touches our database. We also store a salted one-way hash for identity matching, meaning the plaintext can never be recovered.',
    color: '#0A9B8E',
    colorLight: '#0a8a7e',
    stat: 'AES-256',
    statLabel: 'Encryption Standard',
  },
  {
    icon: Key,
    title: 'Zero-Knowledge Architecture',
    desc: 'SnappX engineers cannot read your MoMo number. Our field-level encryption is designed so that even a complete database dump reveals no actionable financial identifiers.',
    color: '#C8A96E',
    colorLight: '#a8832a',
    stat: '0',
    statLabel: 'Plaintext MoMo exposure',
  },
  {
    icon: Server,
    title: 'Immutable Ledger',
    desc: 'Every financial transaction is recorded in an append-only ledger. Entries cannot be updated, deleted, or modified, not even by admins. This creates a tamper-proof audit trail for every cedis moved on the platform.',
    color: '#0A9B8E',
    colorLight: '#0a8a7e',
    stat: '100%',
    statLabel: 'Immutable records',
  },
  {
    icon: Shield,
    title: 'Paystack-Grade Payments',
    desc: 'All money movement is processed through Paystack, which is licensed by the Bank of Ghana under the Payment Systems and Services Act. We never handle raw card or MoMo credentials in our servers.',
    color: '#C8A96E',
    colorLight: '#a8832a',
    stat: 'BoG',
    statLabel: 'Licensed Partner',
  },
];

const authLayers = [
  {
    title: 'JWT Access Tokens',
    detail:
      '5-minute expiry. Short-lived tokens limit the window of any stolen credential.',
    icon: '⏱️',
  },
  {
    title: 'Refresh Tokens',
    detail: '30-day validity with rotation, invalidated on every new login.',
    icon: '🔄',
  },
  {
    title: 'SMS OTP Verification',
    detail:
      '6-digit numeric OTPs expire in 10 minutes and are single-use, invalidated immediately after verification.',
    icon: '📲',
  },
  {
    title: 'Brute Force Protection',
    detail:
      'Accounts are automatically locked after 5 failed login attempts with a 30-minute cooling period.',
    icon: '🚫',
  },
  {
    title: 'Rate Limiting',
    detail:
      'Every sensitive endpoint (login, OTP send, contributions, cashouts) is rate-limited per IP and per user.',
    icon: '⚡',
  },
  {
    title: 'Idempotency Keys',
    detail:
      'Every write request requires a unique X-Idempotency-Key header, preventing duplicate financial operations.',
    icon: '🔑',
  },
];

const kycFeatures = [
  'Stored in a private-access Cloudinary bucket. Files are never publicly accessible via URL',
  'Access generates time-limited signed URLs with a 30-minute expiry',
  'Signed URLs cannot be shared, cached, or forwarded after expiry',
  'Images are automatically transformed (compressed) on upload to reduce unnecessary data retention',
  'KYC documents can only be viewed by authorized SnappX compliance staff',
  'All document access is logged with timestamp, admin ID, and purpose',
];

export default function SecurityPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref: pillarRef, inView: pillarIn } = useInView(0.05);
  const { ref: authRef, inView: authIn } = useInView(0.05);
  const { ref: kycRef, inView: kycIn } = useInView(0.05);
  const { ref: reportRef, inView: reportIn } = useInView(0.1);
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Adaptive tokens ── */
  :root {
    /* LIGHT MODE = default */
    --sec-bg:             #f3faf9;
    --sec-text:           #0b2220;
    --sec-text-muted:     rgba(11,34,32,0.65);
    --sec-text-dim:       rgba(11,34,32,0.5);
    --sec-text-dimmer:    rgba(11,34,32,0.35);
    --sec-teal:           #0a8a7e;
    --sec-gold:           #a8832a;
    --sec-nav-bg:         rgba(243,250,249,0.92);
    --sec-nav-border:     rgba(10,155,142,0.15);
    --sec-badge-bg:       rgba(10,155,142,0.08);
    --sec-badge-border:   rgba(10,155,142,0.22);
    --sec-hero-glow:      rgba(10,155,142,0.08);
    --sec-grid-line:      rgba(10,155,142,0.06);
    --sec-trust-dot:      #0a8a7e;
    --sec-trust-text:     rgba(11,34,32,0.5);
    --sec-pillar-bg:      #ffffff;
    --sec-pillar-border:  rgba(10,155,142,0.12);
    --sec-pillar-hover:   rgba(10,155,142,0.3);
    --sec-pillar-stat-label: rgba(11,34,32,0.4);
    --sec-pillar-icon-bg: rgba(10,155,142,0.06);
    --sec-pillar-icon-bd: rgba(10,155,142,0.14);
    --sec-pillar-desc:    rgba(11,34,32,0.6);
    --sec-auth-bg:        rgba(10,155,142,0.05);
    --sec-auth-border:    rgba(10,155,142,0.14);
    --sec-auth-hover:     rgba(10,155,142,0.28);
    --sec-auth-detail:    rgba(11,34,32,0.55);
    --sec-infra-bg:       #ffffff;
    --sec-infra-border:   rgba(10,155,142,0.12);
    --sec-infra-icon-bg:  rgba(168,131,42,0.09);
    --sec-infra-icon-bd:  rgba(168,131,42,0.2);
    --sec-infra-li:       rgba(11,34,32,0.65);
    --sec-infra-li-bd:    rgba(10,155,142,0.07);
    --sec-infra-check:    #0a8a7e;
    --sec-kyc-bg:         rgba(168,131,42,0.04);
    --sec-kyc-border:     rgba(168,131,42,0.14);
    --sec-kyc-icon-bg:    rgba(168,131,42,0.1);
    --sec-kyc-icon-bd:    rgba(168,131,42,0.22);
    --sec-kyc-li:         rgba(11,34,32,0.65);
    --sec-kyc-li-bd:      rgba(168,131,42,0.08);
    --sec-kyc-bullet-bg:  rgba(168,131,42,0.1);
    --sec-kyc-bullet-bd:  rgba(168,131,42,0.25);
    --sec-report-bg:      linear-gradient(135deg, rgba(10,155,142,0.06), rgba(168,131,42,0.04));
    --sec-report-border:  rgba(10,155,142,0.18);
    --sec-report-p:       rgba(11,34,32,0.6);
    --sec-report-note:    rgba(11,34,32,0.35);
    --sec-report-ghost-bg: rgba(11,34,32,0.05);
    --sec-report-ghost-bd: rgba(11,34,32,0.12);
    --sec-divider:        rgba(10,155,142,0.12);
    --sec-footer-border:  rgba(10,155,142,0.1);
    --sec-eyebrow:        #0a8a7e;
    --sec-section-title:  #0b2220;
  }

  /* DARK MODE – triggered by the .dark class */
  .dark {
    --sec-bg:             #030a09;
    --sec-text:           #ddeeed;
    --sec-text-muted:     rgba(221,238,237,0.55);
    --sec-text-dim:       rgba(221,238,237,0.45);
    --sec-text-dimmer:    rgba(221,238,237,0.3);
    --sec-teal:           #0A9B8E;
    --sec-gold:           #C8A96E;
    --sec-nav-bg:         rgba(3,10,9,0.9);
    --sec-nav-border:     rgba(10,155,142,0.12);
    --sec-badge-bg:       rgba(10,155,142,0.1);
    --sec-badge-border:   rgba(10,155,142,0.25);
    --sec-hero-glow:      rgba(10,155,142,0.12);
    --sec-grid-line:      rgba(10,155,142,0.04);
    --sec-trust-dot:      #0A9B8E;
    --sec-trust-text:     rgba(221,238,237,0.5);
    --sec-pillar-bg:      rgba(255,255,255,0.03);
    --sec-pillar-border:  rgba(255,255,255,0.07);
    --sec-pillar-hover:   rgba(10,155,142,0.25);
    --sec-pillar-stat-label: rgba(221,238,237,0.35);
    --sec-pillar-icon-bg: rgba(255,255,255,0.04);
    --sec-pillar-icon-bd: rgba(255,255,255,0.08);
    --sec-pillar-desc:    rgba(221,238,237,0.55);
    --sec-auth-bg:        rgba(10,155,142,0.04);
    --sec-auth-border:    rgba(10,155,142,0.12);
    --sec-auth-hover:     rgba(10,155,142,0.3);
    --sec-auth-detail:    rgba(221,238,237,0.5);
    --sec-infra-bg:       rgba(255,255,255,0.02);
    --sec-infra-border:   rgba(255,255,255,0.06);
    --sec-infra-icon-bg:  rgba(200,169,110,0.1);
    --sec-infra-icon-bd:  rgba(200,169,110,0.2);
    --sec-infra-li:       rgba(221,238,237,0.6);
    --sec-infra-li-bd:    rgba(255,255,255,0.04);
    --sec-infra-check:    #0A9B8E;
    --sec-kyc-bg:         rgba(200,169,110,0.04);
    --sec-kyc-border:     rgba(200,169,110,0.12);
    --sec-kyc-icon-bg:    rgba(200,169,110,0.12);
    --sec-kyc-icon-bd:    rgba(200,169,110,0.25);
    --sec-kyc-li:         rgba(221,238,237,0.65);
    --sec-kyc-li-bd:      rgba(200,169,110,0.08);
    --sec-kyc-bullet-bg:  rgba(200,169,110,0.15);
    --sec-kyc-bullet-bd:  rgba(200,169,110,0.3);
    --sec-report-bg:      linear-gradient(135deg, rgba(10,155,142,0.08), rgba(200,169,110,0.06));
    --sec-report-border:  rgba(10,155,142,0.2);
    --sec-report-p:       rgba(221,238,237,0.6);
    --sec-report-note:    rgba(221,238,237,0.3);
    --sec-report-ghost-bg: rgba(255,255,255,0.05);
    --sec-report-ghost-bd: rgba(255,255,255,0.1);
    --sec-divider:        rgba(10,155,142,0.15);
    --sec-footer-border:  rgba(255,255,255,0.06);
    --sec-eyebrow:        #0A9B8E;
    --sec-section-title:  #ddeeed;
  }

  body {
    background: var(--sec-bg);
    color: var(--sec-text);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  /* ── All component styles remain unchanged ── */
  .sec-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 0 2rem; height: 64px;
    background: var(--sec-nav-bg);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--sec-nav-border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .sec-logo {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.25rem;
    color: var(--sec-teal); text-decoration: none;
  }
  .sec-logo span { color: var(--sec-gold); }
  .sec-back {
    display: flex; align-items: center; gap: 0.5rem;
    color: var(--sec-text-dim); text-decoration: none;
    font-size: 0.875rem; font-weight: 500; transition: color 0.2s;
  }
  .sec-back:hover { color: var(--sec-teal); }

  /* HERO */
  .sec-hero {
    padding: 130px 2rem 80px;
    max-width: 1100px; margin: 0 auto;
    position: relative; overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, var(--sec-hero-glow), transparent 70%);
    pointer-events: none;
  }
  .hero-grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--sec-grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--sec-grid-line) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; mask-image: radial-gradient(ellipse, black, transparent 70%);
  }
  .hero-content {
    position: relative; text-align: center;
    opacity: 0; transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.22,1,0.36,1);
  }
  .hero-content.in { opacity: 1; transform: none; }
  .sec-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--sec-badge-bg);
    border: 1px solid var(--sec-badge-border);
    border-radius: 100px; padding: 0.35rem 1rem;
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--sec-teal); margin-bottom: 1.5rem;
  }
  .sec-hero h1 {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2.8rem, 6vw, 4.5rem);
    font-weight: 800; line-height: 1.0;
    color: var(--sec-text); margin-bottom: 1.5rem;
  }
  .sec-hero h1 .teal { color: var(--sec-teal); }
  .sec-hero h1 .gold { color: var(--sec-gold); }
  .sec-hero p {
    font-size: 1.1rem; color: var(--sec-text-muted);
    line-height: 1.7; max-width: 600px; margin: 0 auto 3rem;
  }
  .hero-trust-row {
    display: flex; align-items: center; justify-content: center;
    gap: 2rem; flex-wrap: wrap;
  }
  .trust-chip {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.8rem; color: var(--sec-trust-text);
    font-family: 'Space Mono', monospace;
  }
  .trust-chip-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--sec-trust-dot); box-shadow: 0 0 6px rgba(10,155,142,0.6);
  }

  /* SECTIONS */
  .sec-section { max-width: 1100px; margin: 0 auto; padding: 0 2rem 5rem; }
  .sec-section-label {
    text-align: center; margin-bottom: 3rem;
    opacity: 0; transform: translateY(15px); transition: all 0.6s ease;
  }
  .sec-section-label.in { opacity: 1; transform: none; }
  .eyebrow {
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--sec-eyebrow); margin-bottom: 0.5rem;
  }
  .section-title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 700; color: var(--sec-section-title);
  }
  .section-title span { color: var(--sec-teal); }

  .pillars-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;
  }
  .pillar-card {
    background: var(--sec-pillar-bg);
    border: 1px solid var(--sec-pillar-border);
    border-radius: 16px; padding: 2rem;
    position: relative; overflow: hidden;
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.3s ease;
  }
  .pillar-card.in { opacity: 1; transform: none; }
  .pillar-card:hover { border-color: var(--sec-pillar-hover); }
  .pillar-card::before {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px; background: var(--c); opacity: 0.4; transition: opacity 0.3s;
  }
  .pillar-card:hover::before { opacity: 0.8; }
  .pillar-stat {
    font-family: 'Space Mono', monospace;
    font-size: 2rem; font-weight: 700; color: var(--c); margin-bottom: 0.25rem;
  }
  .pillar-stat-label {
    font-size: 0.7rem; color: var(--sec-pillar-stat-label);
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem;
  }
  .pillar-icon-wrap {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem;
    background: var(--sec-pillar-icon-bg);
    border: 1px solid var(--sec-pillar-icon-bd);
  }
  .pillar-title {
    font-family: 'Sora', sans-serif; font-size: 1rem;
    font-weight: 600; color: var(--sec-text); margin-bottom: 0.75rem;
  }
  .pillar-desc { font-size: 0.875rem; color: var(--sec-pillar-desc); line-height: 1.7; }

  /* AUTH */
  .auth-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;
  }
  .auth-card {
    background: var(--sec-auth-bg);
    border: 1px solid var(--sec-auth-border);
    border-radius: 12px; padding: 1.25rem;
    display: flex; align-items: flex-start; gap: 1rem;
    opacity: 0; transform: translateX(-10px);
    transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.2s ease;
  }
  .auth-card.in { opacity: 1; transform: none; }
  .auth-card:hover { border-color: var(--sec-auth-hover); }
  .auth-emoji { font-size: 1.5rem; flex-shrink: 0; line-height: 1; }
  .auth-title {
    font-family: 'Sora', sans-serif; font-size: 0.9rem;
    font-weight: 600; color: var(--sec-text); margin-bottom: 0.35rem;
  }
  .auth-detail { font-size: 0.82rem; color: var(--sec-auth-detail); line-height: 1.6; }

  /* INFRA */
  .infra-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;
  }
  @media (max-width: 700px) { .infra-row { grid-template-columns: 1fr; } }
  .infra-block {
    background: var(--sec-infra-bg);
    border: 1px solid var(--sec-infra-border);
    border-radius: 16px; padding: 2rem;
  }
  .infra-block-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem;
    background: var(--sec-infra-icon-bg);
    border: 1px solid var(--sec-infra-icon-bd);
  }
  .infra-block-title {
    font-family: 'Sora', sans-serif; font-size: 1.15rem;
    font-weight: 700; color: var(--sec-text); margin-bottom: 0.75rem;
  }
  .infra-block ul { list-style: none; }
  .infra-block ul li {
    display: flex; align-items: flex-start; gap: 0.6rem;
    color: var(--sec-infra-li); font-size: 0.875rem;
    line-height: 1.6; padding: 0.45rem 0;
    border-bottom: 1px solid var(--sec-infra-li-bd);
  }
  .infra-block ul li:last-child { border-bottom: none; }
  .infra-check { color: var(--sec-infra-check); flex-shrink: 0; margin-top: 2px; }

  /* KYC */
  .kyc-block {
    background: var(--sec-kyc-bg);
    border: 1px solid var(--sec-kyc-border);
    border-radius: 16px; padding: 2.5rem;
  }
  .kyc-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
  .kyc-icon-wrap {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--sec-kyc-icon-bg);
    border: 1px solid var(--sec-kyc-icon-bd);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .kyc-title { font-family: 'Sora', sans-serif; font-size: 1.3rem; font-weight: 700; color: var(--sec-text); }
  .kyc-sub { font-size: 0.85rem; color: var(--sec-text-dim); margin-top: 0.2rem; }
  .kyc-list { list-style: none; }
  .kyc-list li {
    display: flex; align-items: flex-start; gap: 0.75rem;
    color: var(--sec-kyc-li); font-size: 0.9rem;
    line-height: 1.7; padding: 0.6rem 0;
    border-bottom: 1px solid var(--sec-kyc-li-bd);
  }
  .kyc-list li:last-child { border-bottom: none; }
  .kyc-bullet {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--sec-kyc-bullet-bg);
    border: 1px solid var(--sec-kyc-bullet-bd);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
    font-size: 0.6rem; color: var(--sec-gold); font-weight: 700;
  }

  /* REPORT */
  .report-block {
    background: var(--sec-report-bg);
    border: 1px solid var(--sec-report-border);
    border-radius: 20px; padding: 3rem; text-align: center;
    opacity: 0; transform: translateY(20px); transition: all 0.7s ease;
  }
  .report-block.in { opacity: 1; transform: none; }
  .report-block h2 {
    font-family: 'Sora', sans-serif;
    font-size: 1.8rem; font-weight: 700; color: var(--sec-text); margin-bottom: 0.75rem;
  }
  .report-block p { color: var(--sec-report-p); font-size: 0.95rem; line-height: 1.7; max-width: 520px; margin: 0 auto 2rem; }
  .report-contacts { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; }
  .report-btn {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.75rem 1.5rem; border-radius: 100px;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem;
    text-decoration: none; transition: all 0.2s ease;
  }
  .report-btn.primary { background: var(--sec-teal); color: #ffffff; }
  .report-btn.primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .report-btn.secondary {
    background: var(--sec-report-ghost-bg);
    border: 1px solid var(--sec-report-ghost-bd);
    color: var(--sec-text);
  }
  .report-btn.secondary:hover { filter: brightness(0.95); }

  .sec-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--sec-divider), transparent);
    margin: 1rem 2rem 4rem;
    max-width: 1100px; margin-left: auto; margin-right: auto;
  }
  .sec-footer {
    border-top: 1px solid var(--sec-footer-border);
    padding: 2rem; text-align: center;
  }
  .sec-footer p { font-size: 0.8rem; color: var(--sec-text-dimmer); }
  .sec-footer a { color: var(--sec-teal); text-decoration: none; }
`}</style>

      <nav className="sec-nav">
        <Link href="/" className="sec-logo">
          Snapp<span>X</span>
        </Link>
        <Link href="/" className="sec-back">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </nav>

      {/* HERO */}
      <div className="sec-hero" ref={heroRef}>
        <div className="hero-glow" />
        <div className="hero-grid-bg" />
        <div className={`hero-content ${heroIn ? 'in' : ''}`}>
          <div className="sec-badge">
            <Shield size={12} /> Security Center
          </div>
          <h1>
            Your Money.
            <br />
            <span className="teal">Protected</span> at Every
            <br />
            <span className="gold">Layer.</span>
          </h1>
          <p>
            From the moment you create an account to every cedis moved, SnappX
            applies enterprise-grade security practices designed for the
            realities of Ghanaian fintech.
          </p>
          <div className="hero-trust-row">
            {[
              'AES-256 Encryption',
              'Immutable Ledger',
              'Rate Limited APIs',
              'Single-Use OTPs',
              'Private KYC Storage',
            ].map((t) => (
              <div className="trust-chip" key={t}>
                <div className="trust-chip-dot" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECURITY PILLARS */}
      <div className="sec-section" ref={pillarRef}>
        <div className={`sec-section-label ${pillarIn ? 'in' : ''}`}>
          <div className="eyebrow">Core Protections</div>
          <div className="section-title">
            Four pillars of <span>security</span>
          </div>
        </div>
        <div className="pillars-grid">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className={`pillar-card ${pillarIn ? 'in' : ''}`}
                style={
                  {
                    '--c': p.color,
                    transitionDelay: `${i * 0.1}s`,
                  } as React.CSSProperties
                }
              >
                <div className="pillar-stat" style={{ color: p.color }}>
                  {p.stat}
                </div>
                <div className="pillar-stat-label">{p.statLabel}</div>
                <div className="pillar-icon-wrap">
                  <Icon size={22} color={p.color} />
                </div>
                <div className="pillar-title">{p.title}</div>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sec-divider" />

      {/* AUTHENTICATION LAYERS */}
      <div className="sec-section" ref={authRef}>
        <div className={`sec-section-label ${authIn ? 'in' : ''}`}>
          <div className="eyebrow">Authentication</div>
          <div className="section-title">
            Six layers of <span>access control</span>
          </div>
        </div>
        <div className="auth-grid">
          {authLayers.map((a, i) => (
            <div
              key={i}
              className={`auth-card ${authIn ? 'in' : ''}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="auth-emoji">{a.icon}</div>
              <div>
                <div className="auth-title">{a.title}</div>
                <div className="auth-detail">{a.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec-divider" />

      {/* INFRASTRUCTURE */}
      <div className="sec-section">
        <div className="sec-section-label in">
          <div className="eyebrow">Infrastructure</div>
          <div className="section-title">
            Built on <span>rock-solid</span> foundations
          </div>
        </div>
        <div className="infra-row">
          <div className="infra-block">
            <div className="infra-block-icon">
              <Server size={22} color="var(--sec-gold)" />
            </div>
            <div className="infra-block-title">Database & Storage</div>
            <ul>
              {[
                'Neon PostgreSQL with AES-256 encryption at rest',
                'TLS 1.3 for all data in transit',
                'Database-level CHECK constraints prevent negative wallet balances',
                'Unique constraints on ledger references prevent duplicate transactions',
                'Automated daily backups with point-in-time recovery',
              ].map((item, i) => (
                <li key={i}>
                  <CheckCircle2 size={14} className="infra-check" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="infra-block">
            <div className="infra-block-icon">
              <Zap size={22} color="var(--sec-gold)" />
            </div>
            <div className="infra-block-title">API & Application Layer</div>
            <ul>
              {[
                'HTTPS-only — all HTTP requests are rejected',
                'CORS restricted to approved SnappX frontend origins only',
                'CSRF protection on all state-changing endpoints',
                'SQL injection prevention via parameterized ORM queries',
                'Custom request ID tracking for complete audit trails on every request',
              ].map((item, i) => (
                <li key={i}>
                  <CheckCircle2 size={14} className="infra-check" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="sec-divider" />

      {/* KYC SECURITY */}
      <div className="sec-section" ref={kycRef}>
        <div className={`sec-section-label ${kycIn ? 'in' : ''}`}>
          <div className="eyebrow">KYC & Identity</div>
          <div className="section-title">
            Your <span>documents</span> stay private
          </div>
        </div>
        <div className="kyc-block">
          <div className="kyc-header">
            <div className="kyc-icon-wrap">
              <Eye size={24} color="var(--sec-gold)" />
            </div>
            <div>
              <div className="kyc-title">Ghana Card & Selfie Protection</div>
              <div className="kyc-sub">
                KYC documents required for group admin verification, handled
                with utmost care
              </div>
            </div>
          </div>
          <ul className="kyc-list">
            {kycFeatures.map((f, i) => (
              <li key={i}>
                <div className="kyc-bullet">{i + 1}</div>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sec-divider" />

      {/* PAYSTACK */}
      <div className="sec-section">
        <div className="sec-section-label in">
          <div className="eyebrow">Payments</div>
          <div className="section-title">
            Money moves through <span>licensed rails</span>
          </div>
        </div>
        <div className="infra-row">
          <div className="infra-block">
            <div className="infra-block-icon">
              <RefreshCw size={22} color="var(--sec-gold)" />
            </div>
            <div className="infra-block-title">Paystack Integration</div>
            <ul>
              {[
                'Paystack is licensed by the Bank of Ghana under the Payment Systems and Services Act (2019)',
                "We use Paystack's Transfer Recipient API. Your MoMo number is registered once, securely, and reused thereafter",
                'Paystack webhook signatures are verified with HMAC-SHA512 on every event before processing',
                'All payout references follow strict Paystack format rules (a-z, 0-9, hyphens only) to prevent transfer rejections',
                'Stale pending transfers are automatically checked and synced hourly',
                'Failed payouts are retried automatically with a fresh reference. Funds are never silently lost',
              ].map((item, i) => (
                <li key={i}>
                  <CheckCircle2 size={14} className="infra-check" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="infra-block">
            <div className="infra-block-icon">
              <AlertTriangle size={22} color="var(--sec-gold)" />
            </div>
            <div className="infra-block-title">Fraud & Anomaly Detection</div>
            <ul>
              {[
                'Automated daily reconciliation compares our immutable ledger against wallet balances. Any drift triggers an immediate admin alert',
                'Amount mismatch detection on Paystack webhooks: if payment amount differs from expected, the wallet is NOT credited and admins are notified',
                'IP-based rate limiting on all auth and payment endpoints',
                'Transaction anomalies trigger structured alerts to our engineering team via email',
                'All financial operations are actor-attributed. Every ledger entry records who initiated the action',
              ].map((item, i) => (
                <li key={i}>
                  <CheckCircle2 size={14} className="infra-check" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="sec-divider" />

      {/* REPORT */}
      <div className="sec-section" ref={reportRef}>
        <div className={`report-block ${reportIn ? 'in' : ''}`}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
          <h2>Found a Security Issue?</h2>
          <p>
            We take security reports seriously and respond within 24 hours.
            Responsible disclosure is rewarded with acknowledgment in our
            security hall of fame and, for critical issues, a cash reward.
          </p>
          <div className="report-contacts">
            <a href="mailto:hello@snappx.app" className="report-btn primary">
              <Mail size={16} /> hello@snappx.app
            </a>
            <a href="tel:0541413623" className="report-btn secondary">
              <Phone size={16} /> 0541413623
            </a>
          </div>
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '0.8rem',
              color: 'var(--sec-report-note)',
            }}
          >
            Please do not publicly disclose vulnerabilities before we have had a
            chance to address them.
          </p>
        </div>
      </div>

      <footer className="sec-footer">
        <p>
          © 2026 SnappX. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/privacy">Privacy Policy</Link> &nbsp;·&nbsp;{' '}
          <Link href="/terms">Terms of Service</Link> &nbsp;·&nbsp;{' '}
          <Link href="/faq">FAQ</Link>
        </p>
      </footer>
    </>
  );
}
