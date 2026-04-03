// src/components/CTA.tsx

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

// // src/components/CTA.tsx

// import { ArrowRight, Sparkles } from 'lucide-react';
// import { Button } from './ui/button';

// interface CTAProps {
//   onNavigate?: (view: string) => void;
// }

// export function CTA({ onNavigate }: CTAProps = {}) {
//   return (
//     <section className="py-16 md:py-24 bg-linear-to-br from-primary/90 via-primary to-accent/90 text-primary-foreground relative overflow-hidden">
//       {/* Background pattern */}
//       <div className="absolute inset-0 opacity-10">
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNi0yLjY4Ni02LTYtNnoiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] bg-repeat" />
//       </div>

//       <div className="container mx-auto px-4 relative z-10">
//         <div className="max-w-3xl mx-auto text-center space-y-8">
//           <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
//             <Sparkles className="h-4 w-4" />
//             <span className="text-sm font-medium">
//               Start Your Journey Today
//             </span>
//           </div>

//           <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
//             Ready to Start Your Savings Journey?
//           </h2>

//           <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
//             Join thousands of Ghanaians who are building wealth through smart
//             savings. Create your free account in minutes and start saving today.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
//             <Button
//               size="lg"
//               variant="secondary"
//               className="bg-white/95 text-primary hover:bg-white group dark:text-primary-foreground"
//               onClick={() => onNavigate?.('signup')}
//             >
//               Create Account
//               <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//             </Button>

//             <Button
//               size="lg"
//               variant="outline"
//               className="text-primary-foreground border-white/30 hover:bg-white/10 dark:border-none"
//               onClick={() => onNavigate?.('login')}
//             >
//               Login
//             </Button>
//           </div>

//           <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-10 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="h-2.5 w-2.5 rounded-full bg-teal-300" />
//               <span>100% Secure</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="h-2.5 w-2.5 rounded-full bg-teal-300" />
//               <span>No Hidden Fees</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="h-2.5 w-2.5 rounded-full bg-teal-300" />
//               <span>24/7 Support</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
