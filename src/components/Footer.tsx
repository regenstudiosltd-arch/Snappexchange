'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImage from '../assets/logo.png';
import Image from 'next/image';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src={logoImage}
                alt="SnappX Logo"
                className="h-10 w-10 rounded-[10px]"
              />
              <span className="text-xl">SnappX</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering Collective Growth
            </p>
            <p className="text-gray-400 text-sm">
              Modern group savings platform for Ghana, built on trust and
              technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#services"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <div>
                  <a
                    href="tel:0541413623"
                    className="hover:text-white transition-colors"
                  >
                    0541413623
                  </a>
                  <br />
                  <a
                    href="tel:0500581423"
                    className="hover:text-white transition-colors"
                  >
                    0500581423
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:hello@snappx.app"
                  className="hover:text-white transition-colors"
                >
                  hello@snappx.app
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Adenta, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p suppressHydrationWarning>
            &copy; {year ?? '...'} SnappX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
