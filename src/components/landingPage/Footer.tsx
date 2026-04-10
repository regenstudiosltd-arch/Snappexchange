'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';
import logoImage from '../../assets/logo.png';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  const navLinks = ['Services', 'How It Works', 'About', 'Testimonials'];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-main">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-img">
                  <Image
                    src={logoImage}
                    alt="SnappX"
                    width={40}
                    height={40}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div>
                  <div className="footer-logo-text">SnappX</div>
                  <div className="footer-tagline">
                    Empowering Collective Growth
                  </div>
                </div>
              </div>
              <p className="footer-desc">
                Modern group savings platform for Ghana, built on trust and
                technology.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                {navLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="footer-link"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-col">
              <h3>Legal</h3>
              <ul className="footer-links">
                {legalLinks.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="footer-link">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h3>Contact Us</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                }}
              >
                <div className="contact-item">
                  <Phone size={14} className="contact-icon" />
                  <div>
                    <a href="tel:0541413623" className="contact-link">
                      0541413623
                    </a>
                    <a href="tel:0500581423" className="contact-link">
                      0500581423
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail size={14} className="contact-icon" />
                  <a href="mailto:hello@snappx.app" className="contact-link">
                    hello@snappx.app
                  </a>
                </div>
                <div className="contact-item">
                  <MapPin size={14} className="contact-icon" />
                  <span>Adenta, Ghana</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy" suppressHydrationWarning>
              &copy; {year ?? '...'} SnappX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
