"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import logoImage from "figma:asset/0ed25e47149e7d72733dec05c2993c034a158749.png";

interface HeaderProps {
  onNavigate?: (view: string) => void;
}

export function Header({ onNavigate }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="SnappX Logo" className="h-10 w-10 rounded-lg" />
            <div className="hidden sm:block">
              <div className="text-xl">SnappX</div>
              <div className="text-xs text-muted-foreground">Empowering Collective Growth</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-foreground/80 hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </a>
            <a href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors">
              Testimonials
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => onNavigate?.("login")}>Login</Button>
            <Button className="bg-cyan-500 hover:bg-cyan-600" onClick={() => onNavigate?.("signup")}>Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <a
              href="#services"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#about"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#testimonials"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="outline" className="w-full" onClick={() => { onNavigate?.("login"); setMobileMenuOpen(false); }}>Login</Button>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600" onClick={() => { onNavigate?.("signup"); setMobileMenuOpen(false); }}>Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}