'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  onNavigate?: (view: string) => void;
}

export function Hero({ onNavigate }: HeroProps = {}) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();

      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    const hero = heroRef.current;

    if (hero) {
      hero.addEventListener('mousemove', handleMouse, { passive: true });
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouse);
      }
    };
  }, []);

  // const stats = [
  //   { value: '10k+', label: 'Active Users', icon: Users },
  //   { value: '500+', label: 'Savings Groups', icon: TrendingUp },
  //   { value: '₵5M+', label: 'Saved', icon: Shield },
  // ];

  return (
    <>
      <section className="hero-section" ref={heroRef} id="hero">
        {/* Background Elements */}
        <div
          className="hero-orb hero-orb-1"
          style={{
            transform: `translate(${(mousePos.x - 0.5) * -20}px, ${(mousePos.y - 0.5) * -20}px)`,
          }}
        />
        <div
          className="hero-orb hero-orb-2"
          style={{
            transform: `translate(${(mousePos.x - 0.5) * 15}px, ${(mousePos.y - 0.5) * 15}px)`,
          }}
        />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />

        <div className="hero-inner">
          {/* Left Content */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot">
                <Sparkles size={12} color="white" />
              </span>
              Digital Susu Made Simple
            </div>

            <h1 className="hero-heading">
              Modern Group
              <span className="line2">
                Savings for <span className="accent">Ghana</span>
              </span>
            </h1>

            <p className="hero-desc">
              Save individually or in groups with ease. Join thousands of
              Ghanaians building wealth through our trusted digital susu
              platform.
            </p>

            <div className="hero-cta-group">
              <button
                className="btn-primary"
                onClick={() => onNavigate?.('signup')}
              >
                Get Started
                <ArrowRight size={18} className="arrow-icon" />
              </button>
              <Link href="/terms" className="btn-secondary">
                Learn More
              </Link>
            </div>

            {/* <div className="hero-stats">
              {stats.map((stat) => (
                <div className="stat-item" key={stat.label}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div> */}
          </div>

          {/* Right Visual */}
          <div className="hero-visual" style={{ order: -1 }}>
            <div style={{ position: 'relative', padding: '1.5rem' }}>
              {/* Decorative ring */}
              <div className="img-decoration img-deco-1" />

              <div className="hero-img-container">
                <Image
                  // img 1
                  // src="https://media.istockphoto.com/id/2195380850/photo/black-hand-holding-various-denorminations-of-ghanaian-cedi-notes-isolated-on-green-background.jpg?s=612x612&w=0&k=20&c=GRE8XHr5iZ8MNNmGooZp6WXtfFbfmdL-lQvVyJ03SsE="
                  // img 2
                  src="https://media.istockphoto.com/id/1369041786/photo/black-hands-holding-3d-rendered-200-ghanaian-cedi-notes-closeup-of-hands-holding-ghanaian.jpg?s=612x612&w=0&k=20&c=D2PlCC625Xdskqis9vve5XyPbm_vLDUvC3Ga7SRF4y0="
                  alt="Community savings"
                  width={600}
                  height={600}
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/3', display: 'block' }}
                  priority
                />
              </div>

              {/* Floating Card 1 - Savings goal */}
              <div className="float-card float-card-1">
                <div className="card-label">Emergency Fund</div>
                <div className="card-row">
                  <div className="card-avatar">PK</div>
                  <div>
                    <div className="card-value">₵3,200</div>
                    <div className="card-sub">of ₵5,000 goal</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '64%' }} />
                </div>
              </div>

              {/* Floating Card 2 - Payout */}
              <div className="float-card float-card-2">
                <div className="card-row">
                  <div className="pulse-dot" />
                  <div>
                    <div className="card-label">Payout Ready</div>
                    <div className="card-value" style={{ fontSize: '1rem' }}>
                      ₵4,500.00
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 3 - Members */}
              <div className="float-card float-card-3 float-card-3-anim">
                <div className="card-label">Group Members</div>
                <div style={{ display: 'flex', gap: '-8px' }}>
                  {['KW', 'MB', 'EA', '+7'].map((init, i) => (
                    <div
                      key={i}
                      className="card-avatar"
                      style={{
                        marginLeft: i > 0 ? '-8px' : 0,
                        fontSize: '0.6rem',
                        width: '24px',
                        height: '24px',
                        border: '2px solid white',
                        background:
                          i === 3 ? 'rgba(10,155,142,0.15)' : undefined,
                        color: i === 3 ? '#0A9B8E' : undefined,
                      }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
