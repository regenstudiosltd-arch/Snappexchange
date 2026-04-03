// src/components/bot-integration/Botherobanner.tsx

'use client';

import { useEffect, useRef } from 'react';

export function BotHeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw animated particle/node network on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }

    const nodes: Node[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(45, 212, 191, ${(1 - dist / 110) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${n.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="bot-hero">
      <canvas ref={canvasRef} className="bot-hero__canvas" />
      <div className="bot-hero__content">
        <div className="bot-hero__badge">
          <span className="bot-hero__badge-dot" />
          Live Integration
        </div>
        <h1 className="bot-hero__title">
          SnappX <span className="bot-hero__title-accent">Bot</span>
        </h1>
        <p className="bot-hero__subtitle">
          Connect your WhatsApp or Telegram group to unlock automated reminders,
          real-time payout alerts, and contribution tracking — right where your
          susu circle already talks.
        </p>
        <div className="bot-hero__stats">
          <div className="bot-hero__stat">
            <span className="bot-hero__stat-num">2</span>
            <span className="bot-hero__stat-label">Platforms</span>
          </div>
          <div className="bot-hero__stat-divider" />
          <div className="bot-hero__stat">
            <span className="bot-hero__stat-num">24/7</span>
            <span className="bot-hero__stat-label">Monitoring</span>
          </div>
          <div className="bot-hero__stat-divider" />
          <div className="bot-hero__stat">
            <span className="bot-hero__stat-num">&lt;1s</span>
            <span className="bot-hero__stat-label">Alert Speed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
