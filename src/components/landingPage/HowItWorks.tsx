'use client';

import { useEffect, useRef, useState } from 'react';
import { UserPlus, Users, Wallet, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description:
      'Create your free account in minutes with just your phone number',
    step: '01',
    color: '#0A9B8E',
  },
  {
    icon: Users,
    title: 'Create or Join Group',
    description: 'Start your own savings group or join an existing one',
    step: '02',
    color: '#C8A96E',
  },
  {
    icon: Wallet,
    title: 'Make Contributions',
    description:
      'Contribute regularly via mobile money with automated reminders',
    step: '03',
    color: '#0A9B8E',
  },
  {
    icon: TrendingUp,
    title: 'Receive Payouts',
    description:
      "Get your savings when it's your turn or when you reach your goal",
    step: '04',
    color: '#C8A96E',
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

export function HowItWorks() {
  const { ref, inView } = useInView();

  return (
    <>
      <section className="hiw-section" id="how-it-works">
        <div className="hiw-inner" ref={ref}>
          <div className="hiw-header">
            <div className={`section-eyebrow ${inView ? 'visible' : ''}`}>
              <span className="eyebrow-line" />
              How It Works
              <span className="eyebrow-line" />
            </div>
            <h2 className={`hiw-heading ${inView ? 'visible' : ''}`}>
              Get started in four
              <br />
              simple steps
            </h2>
            <p className={`hiw-sub ${inView ? 'visible' : ''}`}>
              Get started with SnappX in four simple steps
            </p>
          </div>

          <div className="steps-container">
            <div className="steps-connector" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className={`step-card ${inView ? 'visible' : ''}`}
                  style={{
                    transitionDelay: `${0.15 + i * 0.12}s`,
                    ['--step-color' as string]: step.color,
                  }}
                >
                  <div className="step-icon-zone">
                    <div
                      className="step-number"
                      style={{ background: step.color, fontSize: '0.55rem' }}
                    >
                      {step.step}
                    </div>

                    <div
                      className="step-icon-outer"
                      style={{ background: `${step.color}12` }}
                    >
                      <div
                        className="step-icon-ring"
                        style={{ borderColor: step.color }}
                      />
                      <div className="step-icon-inner">
                        <Icon size={26} color={step.color} />
                      </div>
                    </div>
                  </div>

                  <div className="step-title">{step.title}</div>
                  <p className="step-desc">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
