// src/components/Testimonials.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Akosua Mensah',
    role: 'Small Business Owner',
    image:
      'https://images.unsplash.com/photo-1530785602389-07594beb8b73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGFmcmljYW4lMjB3b21hbnxlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    content:
      'SnappX has transformed how I save for my business. The group savings feature helped me raise capital for expansion within 6 months!',
    rating: 5,
    amount: '₵18,000',
    amountLabel: 'Raised in 6 months',
  },
  {
    name: 'Kwame Boateng',
    role: 'Teacher',
    image:
      'https://images.unsplash.com/photo-1495603889488-42d1d66e5523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBtYW58ZW58MXx8fHwxNzY0MDAwODA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    content:
      "I've tried many savings apps, but SnappX is the best. The AI tips help me budget better, and the mobile money integration is seamless.",
    rating: 5,
    amount: '₵7,500',
    amountLabel: 'Saved this year',
  },
  {
    name: 'Ama Osei',
    role: 'Nurse',
    image:
      'https://images.unsplash.com/photo-1530785602389-07594beb8b73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGFmcmljYW4lMjB3b21hbnxlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    content:
      'Our susu group of 10 nurses has saved over ₵50,000 together. SnappX makes it so easy to track contributions and manage payouts.',
    rating: 5,
    amount: '₵50,000+',
    amountLabel: 'Group savings total',
  },
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

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { ref, inView } = useInView();

  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 200);
  };

  const next = () => goTo((currentIndex + 1) % testimonials.length);
  const prev = () =>
    goTo((currentIndex - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[currentIndex];

  return (
    <>
      <section className="testimonials-section" id="testimonials">
        <div className="test-inner" ref={ref}>
          <div className={`test-header ${inView ? 'visible' : ''}`}>
            <div className={`section-eyebrow ${inView ? 'visible' : ''}`}>
              <span className="eyebrow-line" />
              Testimonials
              <span className="eyebrow-line" />
            </div>
            <h2 className="test-heading">What Our Users Say</h2>
            <p className="test-sub">
              Join thousands of satisfied Ghanaians who trust SnappX for their
              savings
            </p>
          </div>

          <div className={`test-card ${inView ? 'visible' : ''}`}>
            <div className="card-deco-corner" />
            <div className="card-deco-corner2" />

            <Quote size={80} className="quote-icon" />

            <div className="card-body">
              {/* User side */}
              <div className="user-side">
                <div className="user-avatar-wrap">
                  <div className="avatar-ring" />
                  <Image
                    src={current.image}
                    alt={current.name}
                    width={120}
                    height={120}
                    className="user-avatar"
                    style={{ opacity: isAnimating ? 0 : 1 }}
                  />
                </div>

                <div className="user-name">{current.name}</div>
                <div className="user-role">{current.role}</div>

                <div className="amount-badge">
                  <div className="amount-value">{current.amount}</div>
                  <div className="amount-label">{current.amountLabel}</div>
                </div>
              </div>

              {/* Content side */}
              <div className="content-side">
                <div className="stars">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>

                <p
                  className={`quote-text ${isAnimating ? '' : 'fadein'}`}
                  style={{ transition: 'opacity 0.3s ease' }}
                >
                  &ldquo;{current.content}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="test-nav">
            <button className="nav-btn" onClick={prev} aria-label="Previous">
              <ChevronLeft size={20} />
            </button>

            <div className="nav-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`nav-dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>

            <button className="nav-btn" onClick={next} aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// // src/components/Testimonials.tsx

// 'use client';

// import { useState } from 'react';
// import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
// import { Button } from './ui/button';
// import { Card, CardContent } from './ui/card';
// import Image from 'next/image';
// import { cn } from './ui/utils';

// const testimonials = [
//   {
//     name: 'Akosua Mensah',
//     role: 'Small Business Owner',
//     image:
//       'https://images.unsplash.com/photo-1530785602389-07594beb8b73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGFmcmljYW4lMjB3b21hbnxlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
//     content:
//       'SnappX has transformed how I save for my business. The group savings feature helped me raise capital for expansion within 6 months!',
//     rating: 5,
//   },
//   {
//     name: 'Kwame Boateng',
//     role: 'Teacher',
//     image:
//       'https://images.unsplash.com/photo-1495603889488-42d1d66e5523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBtYW58ZW58MXx8fHwxNzY0MDAwODA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
//     content:
//       "I've tried many savings apps, but SnappX is the best. The AI tips help me budget better, and the mobile money integration is seamless.",
//     rating: 5,
//   },
//   {
//     name: 'Ama Osei',
//     role: 'Nurse',
//     image:
//       'https://images.unsplash.com/photo-1530785602389-07594beb8b73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGFmcmljYW4lMjB3b21hbnxlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
//     content:
//       'Our susu group of 10 nurses has saved over ₵50,000 together. SnappX makes it so easy to track contributions and manage payouts.',
//     rating: 5,
//   },
// ];

// export function Testimonials() {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const next = () => {
//     setCurrentIndex((prev) => (prev + 1) % testimonials.length);
//   };

//   const previous = () => {
//     setCurrentIndex(
//       (prev) => (prev - 1 + testimonials.length) % testimonials.length,
//     );
//   };

//   return (
//     <section id="testimonials" className="py-16 md:py-24 bg-background">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12 space-y-3">
//           <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
//             What Our Users Say
//           </h2>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//             Join thousands of satisfied Ghanaians who trust SnappX for their
//             savings
//           </p>
//         </div>

//         <div className="max-w-4xl mx-auto">
//           <Card className="border-border bg-card relative overflow-hidden shadow-lg">
//             {/* Decorative gradient corner */}
//             <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-transparent" />

//             <CardContent className="p-8 md:p-12">
//               <Quote className="h-12 w-12 text-primary/20 mb-6" />

//               <div className="grid md:grid-cols-[200px,1fr] gap-8 items-center">
//                 {/* User Image */}
//                 <div className="mx-auto md:mx-0">
//                   <div className="relative">
//                     <div className="absolute -inset-2 bg-linear-to-br from-primary/20 via-accent/20 to-primary/20 rounded-full blur-lg opacity-50" />
//                     <Image
//                       src={testimonials[currentIndex].image}
//                       alt={testimonials[currentIndex].name}
//                       width={160}
//                       height={160}
//                       className="relative w-40 h-40 rounded-full object-cover border-4 border-background shadow-md"
//                     />
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="space-y-5">
//                   <div className="flex">
//                     {[...Array(testimonials[currentIndex].rating)].map(
//                       (_, i) => (
//                         <Star
//                           key={i}
//                           className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]"
//                         />
//                       ),
//                     )}
//                   </div>

//                   <p className="text-lg leading-relaxed text-foreground">
//                     &quot;{testimonials[currentIndex].content}&quot;
//                   </p>

//                   <div>
//                     <div className="text-lg font-medium text-foreground">
//                       {testimonials[currentIndex].name}
//                     </div>
//                     <div className="text-sm text-muted-foreground">
//                       {testimonials[currentIndex].role}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Navigation */}
//           <div className="flex items-center justify-center gap-6 mt-10">
//             <Button
//               size="icon"
//               variant="outline"
//               onClick={previous}
//               className="rounded-full"
//             >
//               <ChevronLeft className="h-5 w-5" />
//             </Button>

//             <div className="flex gap-2">
//               {testimonials.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentIndex(index)}
//                   className={cn(
//                     'h-2.5 rounded-full transition-all duration-300',
//                     index === currentIndex
//                       ? 'w-10 bg-primary'
//                       : 'w-2.5 bg-muted hover:bg-muted-foreground/70',
//                   )}
//                   aria-label={`Go to testimonial ${index + 1}`}
//                 />
//               ))}
//             </div>

//             <Button
//               size="icon"
//               variant="outline"
//               onClick={next}
//               className="rounded-full"
//             >
//               <ChevronRight className="h-5 w-5" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
