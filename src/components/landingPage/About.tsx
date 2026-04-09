'use client';

import { useEffect, useRef, useState } from 'react';
import { Shield, Heart, Globe, TrendingUp, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const values = [
  {
    icon: Shield,
    title: 'Trust & Security',
    description:
      'Your money is safe with bank-level security and transparent tracking',
    color: '#0A9B8E',
  },
  {
    icon: Heart,
    title: 'Community First',
    description:
      "Building on Ghana's rich tradition of communal savings and support",
    color: '#C8A96E',
  },
  {
    icon: Globe,
    title: 'Financial Inclusion',
    description: 'Making modern savings accessible to all Ghanaians',
    color: '#0A9B8E',
  },
  {
    icon: TrendingUp,
    title: 'Growth Focused',
    description: 'Empowering users to achieve their financial goals faster',
    color: '#C8A96E',
  },
];

const highlights = [
  'Bank-level encryption for all transactions',
  'Transparent group fund management',
  'Automated payment reminders',
  'Real-time balance tracking',
];

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

export function About() {
  const { ref, inView } = useInView();
  const { ref: valRef, inView: valInView } = useInView();

  return (
    <>
      <section className="about-section" id="about">
        <div className="about-inner">
          {/* Story section */}
          <div className="about-story" ref={ref}>
            <div className={`about-img-side ${inView ? 'visible' : ''}`}>
              <div style={{ position: 'relative' }}>
                <div className="about-img-deco2" />
                <div className="about-img-frame">
                  <Image
                    src="https://images.unsplash.com/photo-1758518730083-4c12527b6742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMG1lZXRpbmclMjBidXNpbmVzc3xlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Team collaboration"
                    width={600}
                    height={500}
                    className="w-full object-cover"
                    style={{ display: 'block', aspectRatio: '4/3' }}
                    priority
                  />

                  {/* Stats overlay */}
                  {/* <div className="img-stat-overlay">
                    {[
                      { value: '10k+', label: 'Users' },
                      { value: '98%', label: 'Satisfaction' },
                      { value: '₵5M+', label: 'Saved' },
                    ].map((s) => (
                      <div className="img-stat" key={s.label}>
                        <div className="img-stat-value">{s.value}</div>
                        <div className="img-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div> */}
                </div>
                <div className="about-img-deco" />
              </div>
            </div>

            <div className={`about-text-side ${inView ? 'visible' : ''}`}>
              <div className={`section-eyebrow ${inView ? 'visible' : ''}`}>
                <span className="eyebrow-line" />
                About SnappX
                <span className="eyebrow-line" />
              </div>
              <h2 className="about-heading">
                Built for Ghana,
                <br />
                powered by trust
              </h2>
              <div className="about-body">
                <p className="about-para">
                  SnappX is revolutionizing how Ghanaians save money by bringing
                  the traditional susu system into the digital age. Our platform
                  combines the trust and community of traditional savings
                  circles with the convenience and transparency of modern
                  technology.
                </p>
                <p className="about-para">
                  We understand the unique financial needs of our community and
                  are committed to using this platform to empower individuals
                  and groups to achieve their financial goals through
                  disciplined savings and mutual support.
                </p>
                <p className="about-para">
                  With mobile money integration, AI-powered financial tips, and
                  automated tracking, we are making it easier than ever for
                  Ghanaians to build wealth and secure their financial future.
                </p>
              </div>

              <ul className="highlights-list">
                {highlights.map((h, i) => (
                  <li className="highlight-item" key={i}>
                    <span className="highlight-icon">
                      <CheckCircle2 size={12} color="#0A9B8E" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Values */}
          <div ref={valRef}>
            <div className={`values-header ${valInView ? 'visible' : ''}`}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase' as const,
                  color: '#C8A96E',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    width: '2rem',
                    height: '1.5px',
                    background: '#C8A96E',
                    display: 'inline-block',
                  }}
                />
                Our Values
                <span
                  style={{
                    width: '2rem',
                    height: '1.5px',
                    background: '#C8A96E',
                    display: 'inline-block',
                  }}
                />
              </div>
              <div className="values-heading">What drives us forward</div>
            </div>

            <div className="values-grid">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div
                    key={i}
                    className={`value-card ${valInView ? 'visible' : ''}`}
                    style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <div
                      className="value-icon-wrap"
                      style={{ background: `${v.color}12` }}
                    >
                      <Icon size={22} color={v.color} />
                    </div>
                    <div className="value-title">{v.title}</div>
                    <p className="value-desc">{v.description}</p>
                    <div
                      className="value-card-accent"
                      style={{ background: `${v.color}08` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
