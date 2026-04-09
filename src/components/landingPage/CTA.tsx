'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTAProps {
  onNavigate?: (view: string) => void;
}

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

export function CTA({ onNavigate }: CTAProps = {}) {
  const { ref, inView } = useInView(0.15);

  return (
    <>
      <section className="cta-section">
        <div className="cta-inner" ref={ref}>
          <div className={`cta-card ${inView ? 'visible' : ''}`}>
            <div className="cta-mesh">
              <div className="mesh-orb mesh-orb-1" />
              <div className="mesh-orb mesh-orb-2" />
            </div>
            <div className="cta-grid-overlay" />

            <div className="cta-content">
              <div className="cta-badge">
                <Sparkles size={12} />
                Start Your Journey Today
              </div>

              <h2 className="cta-heading">
                Ready to Start Your
                <br />
                <span className="gold">Savings Journey?</span>
              </h2>

              <p className="cta-desc">
                Join thousands of Ghanaians who are building wealth through
                smart savings. Create your free account in minutes and start
                saving today.
              </p>

              <div className="cta-buttons">
                <button
                  className="btn-white"
                  onClick={() => onNavigate?.('signup')}
                >
                  Create Account
                  <ArrowRight size={18} className="cta-arrow" />
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => onNavigate?.('login')}
                >
                  Login
                </button>
              </div>

              <div className="cta-trust">
                {['100% Secure', 'No Hidden Fees', '24/7 Support'].map((t) => (
                  <div className="trust-item" key={t}>
                    <span className="trust-dot" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
