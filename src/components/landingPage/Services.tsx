// src/components/Services.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Target, Smartphone, BookOpen } from 'lucide-react';

const services = [
  {
    icon: Users,
    title: 'Digital Susu Groups',
    description:
      'Create or join savings circles with automated tracking and transparent management',
    accent: '#0A9B8E',
    tag: 'Most Popular',
  },
  {
    icon: Target,
    title: 'Individual Goals',
    description:
      'Save for personal targets with discipline and track your progress in real-time',
    accent: '#C8A96E',
    tag: 'Personal',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money Integration',
    description:
      'Seamless payments with Telecel, MTN, and Airtel mobile money platforms',
    accent: '#0A9B8E',
    tag: 'Seamless',
  },
  {
    icon: BookOpen,
    title: 'Financial Literacy',
    description:
      'AI-powered tips and budgeting tools to help you make smarter financial decisions',
    accent: '#C8A96E',
    tag: 'AI-Powered',
  },
];

function useInView(threshold = 0.15) {
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

export function Services() {
  const { ref, inView } = useInView();

  return (
    <>
      <section className="services-section" id="services">
        <div className="section-inner" ref={ref}>
          <div className="section-header">
            <div className={`section-eyebrow ${inView ? 'visible' : ''}`}>
              <span className="eyebrow-line" />
              Our Services
              <span className="eyebrow-line" />
            </div>
            <h2 className={`section-heading ${inView ? 'visible' : ''}`}>
              Everything you need to
              <br />
              grow your wealth
            </h2>
            <p className={`section-sub ${inView ? 'visible' : ''}`}>
              Everything you need to achieve your savings goals, whether
              individually or as a group
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div
                  key={i}
                  className={`service-card ${inView ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
                >
                  <span
                    className="card-tag"
                    style={{
                      background: `${service.accent}15`,
                      color: service.accent,
                    }}
                  >
                    {service.tag}
                  </span>

                  <div
                    className="card-icon-wrap"
                    style={{
                      background: `${service.accent}12`,
                    }}
                  >
                    <Icon size={24} color={service.accent} />
                  </div>

                  <div className="card-title">{service.title}</div>
                  <p className="card-desc">{service.description}</p>

                  <div
                    className="card-progress"
                    style={{
                      background: `linear-gradient(90deg, ${service.accent}, ${service.accent}80)`,
                    }}
                  />

                  <div className="card-number">0{i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// // src/components/Services.tsx

// import { Users, Target, Smartphone, BookOpen } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { cn } from './ui/utils';

// const services = [
//   {
//     icon: Users,
//     title: 'Digital Susu Groups',
//     description:
//       'Create or join savings circles with automated tracking and transparent management',
//     color: 'text-primary',
//     bgColor: 'bg-primary/10',
//   },
//   {
//     icon: Target,
//     title: 'Individual Goals',
//     description:
//       'Save for personal targets with discipline and track your progress in real-time',
//     color: 'text-primary',
//     bgColor: 'bg-primary/10',
//   },
//   {
//     icon: Smartphone,
//     title: 'Mobile Money Integration',
//     description:
//       'Seamless payments with Telecel, MTN, and Airtel mobile money platforms',
//     color: 'text-primary',
//     bgColor: 'bg-primary/10',
//   },
//   {
//     icon: BookOpen,
//     title: 'Financial Literacy',
//     description:
//       'AI-powered tips and budgeting tools to help you make smarter financial decisions',
//     color: 'text-primary',
//     bgColor: 'bg-primary/10',
//   },
// ];

// export function Services() {
//   return (
//     <section id="services" className="py-16 md:py-24 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12 space-y-3">
//           <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
//             Our Services
//           </h2>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//             Everything you need to achieve your savings goals, whether
//             individually or as a group
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {services.map((service, index) => {
//             const Icon = service.icon;
//             return (
//               <Card
//                 key={index}
//                 className="border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 bg-card group"
//               >
//                 <CardHeader className="pb-4">
//                   <div
//                     className={cn(
//                       'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
//                       service.bgColor,
//                     )}
//                   >
//                     <Icon className={cn('h-6 w-6', service.color)} />
//                   </div>
//                   <CardTitle className="font-semibold text-xl text-foreground">
//                     {service.title}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-muted-foreground">{service.description}</p>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }
