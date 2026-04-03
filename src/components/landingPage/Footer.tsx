// src/components/Footer.tsx

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

  const navLinks = ['Services', 'How It Works', 'About Us', 'Testimonials'];
  const legalLinks = ['Privacy Policy', 'Terms of Service', 'Security', 'FAQ'];

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
                {legalLinks.map((link) => (
                  <li key={link}>
                    <a href="#" className="footer-link">
                      {link}
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

// // src/components/Footer.tsx

// 'use client';

// import { useState, useEffect } from 'react';
// import { Mail, Phone, MapPin } from 'lucide-react';
// import logoImage from '../assets/logo.png';
// import Image from 'next/image';

// export function Footer() {
// const [year, setYear] = useState<number | null>(null);

// useEffect(() => {
//   // eslint-disable-next-line react-hooks/set-state-in-effect
//   setYear(new Date().getFullYear());
// }, []);

//   return (
//     <footer className="bg-background border-t border-border">
//       <div className="container mx-auto px-4 py-12 md:py-16">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
//           {/* Brand */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <Image
//                 src={logoImage}
//                 alt="SnappX Logo"
//                 className="h-10 w-10 rounded-[10px]"
//               />
//               <span className="text-xl font-semibold text-foreground">
//                 SnappX
//               </span>
//             </div>
//             <p className="text-sm text-muted-foreground">
//               Empowering Collective Growth
//             </p>
//             <p className="text-sm text-muted-foreground">
//               Modern group savings platform for Ghana, built on trust and
//               technology.
//             </p>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h3 className="text-lg font-semibold text-foreground mb-4">
//               Quick Links
//             </h3>
//             <ul className="space-y-2.5 text-sm">
//               <li>
//                 <a
//                   href="#services"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Services
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="#how-it-works"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   How It Works
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="#about"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   About Us
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="#testimonials"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Testimonials
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Legal */}
//           <div>
//             <h3 className="text-lg font-semibold text-foreground mb-4">
//               Legal
//             </h3>
//             <ul className="space-y-2.5 text-sm">
//               <li>
//                 <a
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Privacy Policy
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Terms of Service
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Security
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   FAQ
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Contact */}
//           <div>
//             <h3 className="text-lg font-semibold text-foreground mb-4">
//               Contact Us
//             </h3>
//             <ul className="space-y-3 text-sm">
//               <li className="flex items-center gap-2 text-muted-foreground">
//                 <Phone className="h-4 w-4" />
//                 <div>
//                   <a
//                     href="tel:0541413623"
//                     className="hover:text-foreground transition-colors"
//                   >
//                     0541413623
//                   </a>
//                   <br />
//                   <a
//                     href="tel:0500581423"
//                     className="hover:text-foreground transition-colors"
//                   >
//                     0500581423
//                   </a>
//                 </div>
//               </li>
//               <li className="flex items-center gap-2 text-muted-foreground">
//                 <Mail className="h-4 w-4" />
//                 <a
//                   href="mailto:hello@snappx.app"
//                   className="hover:text-foreground transition-colors"
//                 >
//                   hello@snappx.app
//                 </a>
//               </li>
//               <li className="flex items-center gap-2 text-muted-foreground">
//                 <MapPin className="h-4 w-4" />
//                 <span>Adenta, Ghana</span>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
//           <p suppressHydrationWarning>
//             &copy; {year ?? '...'} SnappX. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }
