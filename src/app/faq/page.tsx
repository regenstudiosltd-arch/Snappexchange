'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  Search,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

const categories = [
  { id: 'all', label: 'All Questions', emoji: '🔍' },
  { id: 'account', label: 'Account & Signup', emoji: '👤' },
  { id: 'groups', label: 'Savings Groups', emoji: '👥' },
  { id: 'contributions', label: 'Contributions', emoji: '💰' },
  { id: 'payouts', label: 'Payouts', emoji: '🎉' },
  { id: 'wallet', label: 'Wallet & Payments', emoji: '👛' },
  { id: 'goals', label: 'Savings Goals', emoji: '🎯' },
  { id: 'security', label: 'Security', emoji: '🔒' },
];

const faqs = [
  // ACCOUNT
  {
    cat: 'account',
    q: 'How do I create a SnappX account?',
    a: 'Visit snappx.app and click "Get Started". You\'ll need your email address, a valid Ghana POST Digital Address (format: XX-000-0000), your Mobile Money number and provider (MTN, Telecel, or AirtelTigo), and the name registered on your MoMo account. After submitting, you\'ll receive a 6-digit OTP to your MoMo number to verify your phone. Once verified, your account is active.',
  },
  {
    cat: 'account',
    q: "I didn't receive my OTP. What should I do?",
    a: 'First, check that you entered your MoMo number correctly, including the country code or local format. OTPs expire in 10 minutes, so request a new one using the "Resend OTP" button on the verification screen. Ensure your phone is on and has mobile signal. If the issue persists, contact us at hello@snappx.app.',
  },
  {
    cat: 'account',
    q: 'Can I change my Mobile Money number after registration?',
    a: 'Yes. Go to Settings → Profile and enter your new MoMo number. Because this changes your payout destination, we will send an OTP to the new number to verify ownership before saving the change. Note: changing your MoMo number invalidates any cached Paystack transfer recipient, so your first payout after the change may take slightly longer while we register the new number.',
  },
  {
    cat: 'account',
    q: 'I forgot my password. How do I reset it?',
    a: 'Click "Forgot Password" on the login page and enter your registered MoMo number. We\'ll send an OTP to that number. Once verified, you can set a new password. For security reasons, password resets require your registered phone number, not your email. This ensures only the MoMo owner can regain access.',
  },
  {
    cat: 'account',
    q: 'What is the Ghana POST Digital Address and why do you need it?',
    a: 'Ghana POST Digital Addresses (format: XX-000-0000, e.g. GA-123-4567) are physical location identifiers issued by GhanaPostGPS. We collect this as part of our identity verification process to comply with Ghanaian financial service regulations. It is not used for any other purpose.',
  },

  // GROUPS
  {
    cat: 'groups',
    q: 'What is a SnappX savings group?',
    a: 'A SnappX savings group is a digital version of the traditional Ghanaian susu, a rotating savings circle where all members contribute the same fixed amount each cycle, and one member receives the full pot per cycle. For example, 10 people each contributing ₵500 monthly creates a ₵5,000 pot that each member receives once during the 10-month rotation.',
  },
  {
    cat: 'groups',
    q: 'How do I create a savings group?',
    a: "Go to Groups → Create Group. You'll need to provide a group name, contribution amount (₵1–₵50,000), contribution frequency (daily, weekly, or monthly), expected number of members (2–50), and optionally a description. As a group admin, you must also complete KYC verification by uploading your Ghana Card (front and back) and a live selfie. This is a one-time process. Existing KYC is reused for future groups.",
  },
  {
    cat: 'groups',
    q: 'How does the payout order work?',
    a: 'When a group reaches full capacity, payout order is assigned automatically based on join date. The earliest member (usually the admin) receives the first payout, and so on. This order is locked once the group is activated and visible to all members. It cannot be changed after activation, ensuring complete fairness and transparency.',
  },
  {
    cat: 'groups',
    q: 'What happens when a group is full?',
    a: 'When the last member joins (either through a join request approval or an invite link), the group automatically activates: a start date is set, the full payout rotation is generated, and all members receive an in-app notification. From this point, contribution cycles begin and the daily payout orchestrator monitors the group.',
  },
  {
    cat: 'groups',
    q: "Can I join a group without the admin's approval?",
    a: "If the admin shares a direct invite link, you can join immediately without going through the approval queue. The link is an admin-granted bypass. Otherwise, you submit a join request (with an optional reason), and the admin reviews and approves or rejects it. You'll be notified by email and in-app notification once a decision is made.",
  },
  {
    cat: 'groups',
    q: 'What is the difference between a "pending" and "active" group?',
    a: 'A "pending" group is one that has been created but has not yet reached full capacity. Members can join but contributions have not started. An "active" group has reached its target membership, has a set start date, and payout cycles are running. A group becomes "completed" after all members have received their payout.',
  },
  {
    cat: 'groups',
    q: "Can I leave a savings group once I've joined?",
    a: "You can request account deletion or leave arrangements informally, but SnappX does not currently support self-removal from active groups, as it would disrupt the payout cycle for other members. If you have an urgent situation, contact us at hello@snappx.app and we'll work with you and the group admin to find a resolution.",
  },

  // CONTRIBUTIONS
  {
    cat: 'contributions',
    q: 'How do I contribute to a group?',
    a: 'Ensure your SnappX wallet has sufficient funds. Then go to your group page and tap "Contribute". The fixed contribution amount is deducted from your wallet instantly. You can only contribute once per cycle. Duplicate contributions are automatically prevented. You\'ll receive a contribution confirmation with the updated cycle progress.',
  },
  {
    cat: 'contributions',
    q: 'What is a contribution cycle?',
    a: 'A cycle is one full round of contributions. For a monthly group, one cycle = one month. All members contribute during the cycle, and the designated member receives the pot at the end. The cycle number increments by 1 after each payout. For a group of 10 members, there are 10 cycles total, one per member.',
  },
  {
    cat: 'contributions',
    q: "My wallet doesn't have enough balance. What happens?",
    a: 'The contribution will be rejected with an "Insufficient wallet balance" error. Top up your wallet first via the Wallet section, then retry. We recommend topping up a few days before the contribution deadline. Scheduled contributions screen shows you upcoming deadlines and whether your current balance is sufficient.',
  },
  {
    cat: 'contributions',
    q: 'Can I contribute on behalf of another member?',
    a: "No. Each member must contribute from their own verified wallet. This is a deliberate design to maintain accountability, prevent proxy contributions, and ensure each member's identity is tied to their financial activity.",
  },

  // PAYOUTS
  {
    cat: 'payouts',
    q: 'How are payouts triggered?',
    a: "Payouts are triggered automatically every day at a scheduled time. When all verified contributions for the current cycle are confirmed and the payout date arrives, the system calculates the beneficiary, debits the group pot, and initiates a Paystack MoMo transfer to the beneficiary's registered number. You do not need to request your payout, it happens automatically.",
  },
  {
    cat: 'payouts',
    q: 'How long does a payout take to arrive?',
    a: "Once SnappX initiates the transfer via Paystack, funds typically arrive in your MoMo wallet within minutes to a few hours, depending on your provider. MTN and Telecel are usually fastest. If your payout hasn't arrived within 24 hours, contact us immediately with your group name and cycle number.",
  },
  {
    cat: 'payouts',
    q: 'What if my payout fails?',
    a: 'If a transfer fails (e.g. your MoMo account is restricted or your number has changed), SnappX automatically retries the transfer with a new reference. If retries also fail, our team is notified immediately and will contact you within 48 hours. Your funds remain safely in the system until delivery is confirmed, they are never lost.',
  },
  {
    cat: 'payouts',
    q: "Will I receive notification when I'm about to receive a payout?",
    a: "Yes. When it's your cycle to receive the payout, you'll receive both an in-app notification and an email notification with the amount and your registered MoMo number. You'll also receive a second notification when the transfer is confirmed as successful.",
  },

  // WALLET
  {
    cat: 'wallet',
    q: 'How do I top up my SnappX wallet?',
    a: "Go to Wallet → Top Up and enter the amount (minimum ₵1, maximum ₵50,000 per transaction). You'll be redirected to Paystack's secure checkout where you can pay via Mobile Money (MTN, Telecel, AirtelTigo) or card. Once payment is confirmed via Paystack's webhook, your wallet balance is credited immediately.",
  },
  {
    cat: 'wallet',
    q: 'How do I withdraw money from my wallet?',
    a: 'Go to Wallet → Cash Out and enter the amount (minimum ₵5). An 8% service fee is deducted, and the net amount is transferred to your registered MoMo number via Paystack. For example, cashing out ₵100 will send ₵92 to your MoMo. Cash-outs are typically processed within 1–24 hours.',
  },
  {
    cat: 'wallet',
    q: 'Why is there an 8% fee on cash-outs?',
    a: 'The 8% fee covers Paystack transfer fees, Dawurobo SMS costs, our infrastructure and compliance costs, and the continued development of the platform. Group payouts do not attract any fee. The fee only applies when you withdraw money from your personal wallet to your MoMo.',
  },
  {
    cat: 'wallet',
    q: 'Is my wallet balance safe if SnappX closes down?',
    a: 'Yes. Wallet funds are held in pooled accounts with Paystack, which is licensed and regulated by the Bank of Ghana. In the event of SnappX ceasing operations, all wallet balances would be refunded to registered MoMo numbers as a first priority, in compliance with Ghanaian financial service regulations.',
  },

  // GOALS
  {
    cat: 'goals',
    q: 'What is a Savings Goal?',
    a: 'A Savings Goal is a personal savings target you set for yourself, separate from group savings. You define a name (e.g. "School Fees"), a target amount, a regular contribution amount, a frequency (daily, weekly, or monthly), and a target date. The platform tracks your progress and sends reminders when contributions are due.',
  },
  {
    cat: 'goals',
    q: 'How do I contribute to a personal goal?',
    a: 'Open your goal and tap "Contribute". The fixed regular contribution amount is deducted from your wallet. You can contribute up to the point where your total saved equals the target, the system prevents over-contribution. If your contribution would exceed the remaining amount, you\'ll see exactly how much more is needed.',
  },
  {
    cat: 'goals',
    q: 'Can I change my goal target after creating it?',
    a: "Yes. Go to Goals → [your goal] → Edit. You can update the target amount, regular contribution, frequency, and target date. However, you cannot reduce the target below what you've already saved. This protects the integrity of your progress. All changes are immediately reflected in your progress calculations.",
  },
  {
    cat: 'goals',
    q: 'Will I get reminders to contribute to my goals?',
    a: 'Yes. Based on your chosen frequency, SnappX sends email and in-app reminders when a contribution is due. For example, a weekly goal gets a reminder every 7 days since your last contribution. Reminders are not sent more than once per day, and you can adjust notification preferences in your account settings.',
  },

  // SECURITY
  {
    cat: 'security',
    q: 'Is my Mobile Money number stored securely?',
    a: 'Yes, with extreme care. Your MoMo number is encrypted with AES-256 before being stored in our database. We also maintain a one-way cryptographic hash (SHA-256 with a private salt) for identity matching purposes. This means that even if our database were ever compromised, your MoMo number could not be recovered by anyone, including SnappX engineers.',
  },
  {
    cat: 'security',
    q: 'What should I do if I think my account has been compromised?',
    a: 'Act immediately: (1) Change your password via Settings → Security, (2) Contact us at hello@snappx.app or call 0541413623, (3) We can immediately lock your account upon request. We can review your login history and all financial activity to identify any unauthorized transactions. Do not share OTPs with anyone claiming to be SnappX. We will never ask for your OTP.',
  },
  {
    cat: 'security',
    q: 'How does SnappX prevent duplicate transactions?',
    a: 'Every state-changing request (contributions, cashouts, profile updates) requires a unique idempotency key. If the same request is submitted twice with the same key (e.g. due to network retries), only the first is processed. The second returns the cached response. This prevents double-charging even if your internet connection drops during a transaction.',
  },
  {
    cat: 'security',
    q: 'Can SnappX staff access my group savings or wallet balance?',
    a: 'SnappX engineering staff can view aggregated financial records for audit and compliance purposes. However, your individual MoMo number cannot be read by anyone. It is encrypted at rest. KYC documents (Ghana Card, selfie) are only accessible by compliance staff via time-limited signed URLs, and all access is logged.',
  },
];

function AccordionItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={onToggle}>
      <div className="faq-q">
        <span className="faq-q-text">{q}</span>
        <div className={`faq-chevron ${isOpen ? 'rotated' : ''}`}>
          <ChevronDown size={18} />
        </div>
      </div>
      <div className="faq-a-wrap">
        <div className="faq-a">{a}</div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 100);
  }, []);

  const filtered = faqs.filter((f) => {
    const matchCat = activeCategory === 'all' || f.cat === activeCategory;
    const matchSearch =
      search.trim() === '' ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Adaptive tokens ── */
        :root {
          --faq-bg:           #040d0c;
          --faq-surface:      rgba(255,255,255,0.03);
          --faq-surface-open: rgba(10,155,142,0.04);
          --faq-border:       rgba(255,255,255,0.07);
          --faq-border-hover: rgba(10,155,142,0.25);
          --faq-text:         #dce8e6;
          --faq-text-muted:   rgba(220,232,230,0.5);
          --faq-text-dim:     rgba(220,232,230,0.35);
          --faq-teal:         #0A9B8E;
          --faq-gold:         #C8A96E;
          --faq-nav-bg:       rgba(4,13,12,0.88);
          --faq-nav-border:   rgba(10,155,142,0.12);
          --faq-badge-bg:     rgba(10,155,142,0.1);
          --faq-badge-border: rgba(10,155,142,0.25);
          --faq-search-bg:    rgba(255,255,255,0.05);
          --faq-search-border:rgba(255,255,255,0.1);
          --faq-search-focus: rgba(10,155,142,0.4);
          --faq-cat-bg:       rgba(255,255,255,0.04);
          --faq-cat-border:   rgba(255,255,255,0.08);
          --faq-cat-bg-hov:   rgba(255,255,255,0.07);
          --faq-cat-active-bg:rgba(10,155,142,0.12);
          --faq-cat-active-bd:rgba(10,155,142,0.3);
          --faq-a-border:     rgba(255,255,255,0.05);
          --faq-cta-bg:       linear-gradient(135deg, rgba(10,155,142,0.08), rgba(200,169,110,0.05));
          --faq-cta-border:   rgba(10,155,142,0.15);
          --faq-btn-ghost-bg: rgba(255,255,255,0.05);
          --faq-btn-ghost-bd: rgba(255,255,255,0.1);
          --faq-footer-border:rgba(255,255,255,0.06);
        }

       /* Light mode = default (matches standard Tailwind behavior) */
:root {
  --faq-bg:           #f5faf9;
  --faq-surface:      rgba(10,155,142,0.03);
  --faq-surface-open: rgba(10,155,142,0.06);
  --faq-border:       rgba(10,155,142,0.12);
  --faq-border-hover: rgba(10,155,142,0.35);
  --faq-text:         #0d2421;
  --faq-text-muted:   rgba(13,36,33,0.55);
  --faq-text-dim:     rgba(13,36,33,0.38);
  --faq-teal:         #0a8a7e;
  --faq-gold:         #a8832a;
  --faq-nav-bg:       rgba(245,250,249,0.9);
  --faq-nav-border:   rgba(10,155,142,0.15);
  --faq-badge-bg:     rgba(10,155,142,0.08);
  --faq-badge-border: rgba(10,155,142,0.22);
  --faq-search-bg:    #ffffff;
  --faq-search-border:rgba(10,155,142,0.2);
  --faq-search-focus: rgba(10,155,142,0.45);
  --faq-cat-bg:       #ffffff;
  --faq-cat-border:   rgba(10,155,142,0.15);
  --faq-cat-bg-hov:   rgba(10,155,142,0.06);
  --faq-cat-active-bg:rgba(10,155,142,0.1);
  --faq-cat-active-bd:rgba(10,155,142,0.35);
  --faq-a-border:     rgba(10,155,142,0.08);
  --faq-cta-bg:       linear-gradient(135deg, rgba(10,155,142,0.07), rgba(200,169,110,0.04));
  --faq-cta-border:   rgba(10,155,142,0.2);
  --faq-btn-ghost-bg: rgba(13,36,33,0.05);
  --faq-btn-ghost-bd: rgba(13,36,33,0.12);
  --faq-footer-border:rgba(10,155,142,0.1);
}

/* Dark override via class (exactly what your globals.css already does) */
.dark {
  --faq-bg:           #040d0c;
  --faq-surface:      rgba(255,255,255,0.03);
  --faq-surface-open: rgba(10,155,142,0.04);
  --faq-border:       rgba(255,255,255,0.07);
  --faq-border-hover: rgba(10,155,142,0.25);
  --faq-text:         #dce8e6;
  --faq-text-muted:   rgba(220,232,230,0.5);
  --faq-text-dim:     rgba(220,232,230,0.35);
  --faq-teal:         #0A9B8E;
  --faq-gold:         #C8A96E;
  --faq-nav-bg:       rgba(4,13,12,0.88);
  --faq-nav-border:   rgba(10,155,142,0.12);
  --faq-badge-bg:     rgba(10,155,142,0.1);
  --faq-badge-border: rgba(10,155,142,0.25);
  --faq-search-bg:    rgba(255,255,255,0.05);
  --faq-search-border:rgba(255,255,255,0.1);
  --faq-search-focus: rgba(10,155,142,0.4);
  --faq-cat-bg:       rgba(255,255,255,0.04);
  --faq-cat-border:   rgba(255,255,255,0.08);
  --faq-cat-bg-hov:   rgba(255,255,255,0.07);
  --faq-cat-active-bg:rgba(10,155,142,0.12);
  --faq-cat-active-bd:rgba(10,155,142,0.3);
  --faq-a-border:     rgba(255,255,255,0.05);
  --faq-cta-bg:       linear-gradient(135deg, rgba(10,155,142,0.08), rgba(200,169,110,0.05));
  --faq-cta-border:   rgba(10,155,142,0.15);
  --faq-btn-ghost-bg: rgba(255,255,255,0.05);
  --faq-btn-ghost-bd: rgba(255,255,255,0.1);
  --faq-footer-border:rgba(255,255,255,0.06);
}



        body { background: var(--faq-bg); color: var(--faq-text); font-family: 'Plus Jakarta Sans', sans-serif; }

        .faq-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 2rem; height: 64px;
          background: var(--faq-nav-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--faq-nav-border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .faq-logo {
          font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.25rem;
          color: var(--faq-teal); text-decoration: none;
        }
        .faq-logo span { color: var(--faq-gold); }
        .faq-back {
          display: flex; align-items: center; gap: 0.5rem;
          color: var(--faq-text-dim); text-decoration: none;
          font-size: 0.875rem; font-weight: 500; transition: color 0.2s;
        }
        .faq-back:hover { color: var(--faq-teal); }

        /* HERO */
        .faq-hero {
          padding: 120px 2rem 60px;
          max-width: 900px; margin: 0 auto; text-align: center;
        }
        .faq-hero-in {
          opacity: 0; transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.22,1,0.36,1);
        }
        .faq-hero-in.in { opacity: 1; transform: none; }
        .faq-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--faq-badge-bg);
          border: 1px solid var(--faq-badge-border);
          border-radius: 100px; padding: 0.35rem 1rem;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--faq-teal); margin-bottom: 1.5rem;
        }
        .faq-hero h1 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800; line-height: 1.05;
          color: var(--faq-text); margin-bottom: 1.25rem;
        }
        .faq-hero h1 em { font-style: normal; color: var(--faq-teal); }
        .faq-hero p {
          font-size: 1.05rem; color: var(--faq-text-muted);
          line-height: 1.7; max-width: 520px; margin: 0 auto 2.5rem;
        }

        /* SEARCH */
        .faq-search-wrap {
          max-width: 520px; margin: 0 auto; position: relative;
        }
        .faq-search-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: var(--faq-text-dim); pointer-events: none;
        }
        .faq-search {
          width: 100%;
          background: var(--faq-search-bg);
          border: 1px solid var(--faq-search-border);
          border-radius: 100px;
          padding: 0.85rem 1.25rem 0.85rem 2.75rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; color: var(--faq-text);
          outline: none; transition: border-color 0.2s;
        }
        .faq-search:focus { border-color: var(--faq-search-focus); }
        .faq-search::placeholder { color: var(--faq-text-dim); }

        /* CATEGORIES */
        .faq-cats {
          max-width: 1100px; margin: 0 auto;
          padding: 0 2rem 2rem;
          display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;
        }
        .cat-btn {
          background: var(--faq-cat-bg);
          border: 1px solid var(--faq-cat-border);
          border-radius: 100px;
          padding: 0.45rem 1rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer; color: var(--faq-text-muted);
          transition: all 0.2s; white-space: nowrap;
        }
        .cat-btn:hover { color: var(--faq-text); background: var(--faq-cat-bg-hov); }
        .cat-btn.active {
          background: var(--faq-cat-active-bg);
          border-color: var(--faq-cat-active-bd);
          color: var(--faq-teal); font-weight: 600;
        }

        /* FAQ BODY */
        .faq-body {
          max-width: 820px; margin: 0 auto;
          padding: 0 2rem 4rem;
        }
        .faq-count {
          font-size: 0.8rem; color: var(--faq-text-dim);
          margin-bottom: 1.5rem;
        }
        .faq-count strong { color: var(--faq-gold); }

        .faq-item {
          background: var(--faq-surface);
          border: 1px solid var(--faq-border);
          border-radius: 14px; margin-bottom: 0.75rem;
          overflow: hidden; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .faq-item:hover, .faq-item.open {
          border-color: var(--faq-border-hover);
        }
        .faq-item.open { background: var(--faq-surface-open); }
        .faq-q {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; padding: 1.25rem 1.5rem;
        }
        .faq-q-text {
          font-family: 'Sora', sans-serif; font-size: 0.95rem;
          font-weight: 600; color: var(--faq-text); line-height: 1.5;
        }
        .faq-item.open .faq-q-text { color: var(--faq-teal); }
        .faq-chevron {
          color: var(--faq-text-dim); flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), color 0.2s;
        }
        .faq-chevron.rotated { transform: rotate(180deg); color: var(--faq-teal); }
        .faq-a-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }
        .faq-item.open .faq-a-wrap {
          grid-template-rows: 1fr;
        }
        .faq-a {
          min-height: 0;
          padding: 0 1.5rem 1.5rem;
          font-size: 0.9rem;
          color: var(--faq-text-muted);
          line-height: 1.8;
          border-top: 1px solid var(--faq-a-border);
          padding-top: 1rem;
        }

        .faq-empty {
          text-align: center; padding: 4rem 2rem;
          color: var(--faq-text-dim); font-size: 0.95rem;
        }
        .faq-empty .e-icon { font-size: 3rem; margin-bottom: 1rem; }

        /* CTA BOTTOM */
        .faq-cta {
          max-width: 820px; margin: 0 auto;
          padding: 0 2rem 5rem;
        }
        .faq-cta-card {
          background: var(--faq-cta-bg);
          border: 1px solid var(--faq-cta-border);
          border-radius: 20px; padding: 3rem;
          text-align: center;
        }
        .faq-cta-card h2 {
          font-family: 'Sora', sans-serif; font-size: 1.6rem;
          font-weight: 700; color: var(--faq-text); margin-bottom: 0.75rem;
        }
        .faq-cta-card p {
          color: var(--faq-text-muted); font-size: 0.9rem;
          line-height: 1.7; max-width: 400px; margin: 0 auto 2rem;
        }
        .faq-contact-row { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .fc-btn {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.75rem 1.5rem; border-radius: 100px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600; font-size: 0.875rem;
          text-decoration: none; transition: all 0.2s;
          cursor: pointer; border: none;
        }
        .fc-btn.teal { background: var(--faq-teal); color: #ffffff; }
        .fc-btn.teal:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .fc-btn.ghost {
          background: var(--faq-btn-ghost-bg);
          border: 1px solid var(--faq-btn-ghost-bd);
          color: var(--faq-text);
        }
        .fc-btn.ghost:hover { filter: brightness(0.95); }

        .faq-footer {
          border-top: 1px solid var(--faq-footer-border);
          padding: 2rem; text-align: center;
        }
        .faq-footer p { font-size: 0.8rem; color: var(--faq-text-dim); }
        .faq-footer a { color: var(--faq-teal); text-decoration: none; }
      `}</style>

      <nav className="faq-nav">
        <Link href="/" className="faq-logo">
          Snapp<span>X</span>
        </Link>
        <Link href="/" className="faq-back ">
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </nav>

      {/* HERO */}
      <div className="faq-hero">
        <div className={`faq-hero-in ${heroIn ? 'in' : ''}`}>
          <div className="faq-badge">
            <HelpCircle size={12} /> Help Center
          </div>
          <h1>
            Frequently Asked
            <br />
            <em>Questions</em>
          </h1>
          <p>
            Everything you need to know about saving with SnappX, groups,
            contributions, payouts, and more.
          </p>
          <div className="faq-search-wrap">
            <Search size={16} className="faq-search-icon" />
            <input
              type="text"
              className="faq-search"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenIndex(null);
              }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="faq-cats">
        {categories.map((c) => (
          <button
            key={c.id}
            className={`cat-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(c.id);
              setOpenIndex(null);
            }}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* FAQ LIST */}
      <div className="faq-body">
        <div className="faq-count">
          Showing <strong>{filtered.length}</strong> question
          {filtered.length !== 1 ? 's' : ''}
          {search && ` for "${search}"`}
        </div>

        {filtered.length === 0 ? (
          <div className="faq-empty">
            <div className="e-icon">🔍</div>
            <p>
              No results found for &apos;{search}&apos;.
              <br />
              Try a different search term or browse by category.
            </p>
          </div>
        ) : (
          filtered.map((f, i) => (
            <AccordionItem
              key={i}
              q={f.q}
              a={f.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))
        )}
      </div>

      {/* STILL NEED HELP */}
      <div className="faq-cta">
        <div className="faq-cta-card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
          <h2>Still have questions?</h2>
          <p>
            Our team is based in Accra and is available Monday–Saturday, 8 AM–8
            PM GMT. We typically respond within 2 hours.
          </p>
          <div className="faq-contact-row">
            <a href="mailto:hello@snappx.app" className="fc-btn teal">
              <Mail size={16} /> Email Us
            </a>
            <a href="tel:0541413623" className="fc-btn ghost">
              <Phone size={16} /> 0541413623
            </a>
            <a href="tel:0500581423" className="fc-btn ghost">
              <Phone size={16} /> 0500581423
            </a>
          </div>
        </div>
      </div>

      <footer className="faq-footer">
        <p>
          © 2026 SnappX. &nbsp;·&nbsp;{' '}
          <Link href="/privacy">Privacy Policy</Link> &nbsp;·&nbsp;{' '}
          <Link href="/terms">Terms of Service</Link> &nbsp;·&nbsp;{' '}
          <Link href="/security">Security</Link>
        </p>
      </footer>
    </>
  );
}
