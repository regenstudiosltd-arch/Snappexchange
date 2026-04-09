'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import logoImage from '../../assets/logo.png';

interface HeaderProps {
  onNavigate?: (view: string) => void;
}

export function Header({ onNavigate }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Lock body scroll while menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { href: '#services', label: 'Services', number: '01' },
    { href: '#how-it-works', label: 'How It Works', number: '02' },
    { href: '#about', label: 'About', number: '03' },
    { href: '#testimonials', label: 'Testimonials', number: '04' },
  ];

  return (
    <>
      {/* ─── Sticky Header ─── */}
      {/* <header className={`snapp-header${scrolled ? ' scrolled' : ''}`}> */}
      <header
        className={`snapp-header bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60border-b border-border${scrolled ? ' scrolled' : ''}`}
      >
        <div className="header-inner">
          {/* Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
          >
            <div className="logo-mark">
              <Image
                src={logoImage}
                alt="SnappX"
                width={38}
                height={38}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div className="logo-text">SnappX</div>
              <div className="logo-sub">Empowering Collective Growth</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="nav-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop auth buttons */}
          <div className="header-actions">
            <button className="btn-login" onClick={() => onNavigate?.('login')}>
              Login
            </button>
            <button className="btn-cta" onClick={() => onNavigate?.('signup')}>
              Get Started
            </button>
          </div>

          {/* Hamburger — hidden on md+ via CSS */}
          <button
            className={`hb-btn${mobileMenuOpen ? ' hb-btn--active' : ''}`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hb-bar hb-bar--1" />
            <span className="hb-bar hb-bar--2" />
            <span className="hb-bar hb-bar--3" />
          </button>
        </div>
      </header>

      {/* ─── Fullscreen Mobile Nav ─── */}
      <div
        className={`fn${mobileMenuOpen ? ' fn--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="fn-orb fn-orb--1" />
        <div className="fn-orb fn-orb--2" />
        <div className="fn-orb fn-orb--3" />
        <div className="fn-grid" />
        <div className="fn-stripe" />

        {/* Top bar */}
        <div className="fn-topbar">
          <div className="fn-brand">
            <div className="fn-logo-mark">
              <Image
                src={logoImage}
                alt="SnappX"
                width={36}
                height={36}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div className="fn-logo-text">SnappX</div>
              <div className="fn-logo-sub">Empowering Collective Growth</div>
            </div>
          </div>
          <button
            className="fn-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="fn-nav">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className="fn-link"
              style={{
                transitionDelay: mobileMenuOpen
                  ? `${0.25 + i * 0.075}s`
                  : `${(navLinks.length - 1 - i) * 0.04}s`,
              }}
              onClick={closeMenu}
            >
              <span className="fn-link-bar" />
              <span className="fn-link-num">{link.number}</span>
              <span className="fn-link-label">{link.label}</span>
              <span className="fn-link-arr">
                <ArrowRight size={22} strokeWidth={2} />
              </span>
            </a>
          ))}
        </nav>

        {/* Footer CTA */}
        <div
          className="fn-footer"
          style={{ transitionDelay: mobileMenuOpen ? '0.55s' : '0s' }}
        >
          <div className="fn-footer-divider" />
          <div className="fn-footer-btns">
            <button
              className="fn-btn fn-btn--ghost"
              onClick={() => {
                onNavigate?.('login');
                closeMenu();
              }}
            >
              Login
            </button>
            <button
              className="fn-btn fn-btn--primary"
              onClick={() => {
                onNavigate?.('signup');
                closeMenu();
              }}
            >
              Get Started Free
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
          <p className="fn-trust-line">
            <span className="fn-trust-dot" />
            Trusted by 10,000+ Ghanaians
          </p>
        </div>
      </div>
    </>
  );
}
