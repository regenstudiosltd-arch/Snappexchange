// src/components/About.tsx

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
                  <div className="img-stat-overlay">
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
                  </div>
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
                  Founded by a team of Ghanaian fintech experts, we understand
                  the unique financial needs of our community. We are committed
                  to building a platform that empowers individuals and groups to
                  achieve their financial goals through disciplined savings and
                  mutual support.
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

// // src/components/About.tsx

// import { Shield, Heart, Globe, TrendingUp } from 'lucide-react';
// import Image from 'next/image';

// const values = [
//   {
//     icon: Shield,
//     title: 'Trust & Security',
//     description:
//       'Your money is safe with bank-level security and transparent tracking',
//   },
//   {
//     icon: Heart,
//     title: 'Community First',
//     description:
//       "Building on Ghana's rich tradition of communal savings and support",
//   },
//   {
//     icon: Globe,
//     title: 'Financial Inclusion',
//     description: 'Making modern savings accessible to all Ghanaians',
//   },
//   {
//     icon: TrendingUp,
//     title: 'Growth Focused',
//     description: 'Empowering users to achieve their financial goals faster',
//   },
// ];

// export function About() {
//   return (
//     <section id="about" className="py-16 md:py-24 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
//           {/* Left Image */}
//           <div className="relative order-2 lg:order-1">
//             <div className="absolute -inset-8 md:-inset-12 bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-40" />
//             <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
//               <Image
//                 src="https://images.unsplash.com/photo-1758518730083-4c12527b6742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMG1lZXRpbmclMjBidXNpbmVzc3xlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
//                 alt="Team collaboration"
//                 width={600}
//                 height={600}
//                 className="w-full h-auto aspect-square md:aspect-4/3 lg:aspect-square object-cover"
//                 priority
//               />
//             </div>
//           </div>

//           {/* Right Content */}
//           <div className="space-y-6 order-1 lg:order-2">
//             <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
//               About SnappX
//             </h2>

//             <div className="space-y-5 text-muted-foreground leading-relaxed">
//               <p>
//                 SnappX is revolutionizing how Ghanaians save money by bringing
//                 the traditional susu system into the digital age. Our platform
//                 combines the trust and community of traditional savings circles
//                 with the convenience and transparency of modern technology.
//               </p>
//               <p>
//                 Founded by a team of Ghanaian fintech experts, we understand the
//                 unique financial needs of our community. We are committed to
//                 building a platform that empowers individuals and groups to
//                 achieve their financial goals through disciplined savings and
//                 mutual support.
//               </p>
//               <p>
//                 With mobile money integration, AI-powered financial tips, and
//                 automated tracking, we are making it easier than ever for
//                 Ghanaians to build wealth and secure their financial future.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Values Grid */}
//         <div className="space-y-12">
//           <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground">
//             Our Values
//           </h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {values.map((value, index) => {
//               const Icon = value.icon;
//               return (
//                 <div key={index} className="text-center space-y-5 group">
//                   <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
//                     <Icon className="h-8 w-8 text-primary" />
//                   </div>
//                   <h4 className="text-xl font-semibold text-foreground">
//                     {value.title}
//                   </h4>
//                   <p className="text-muted-foreground">{value.description}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
