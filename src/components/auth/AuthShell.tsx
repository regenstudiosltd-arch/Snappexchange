// src/somponents/auth/AuthShell.tsx

'use client';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#080B10]">
      {/* Ambient gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #DC2626 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 w-125 h-125 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #059669 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #F59E0B 0%, transparent 60%)',
          filter: 'blur(120px)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

/** SnappX brand mark — used in every auth card header */
export function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-white text-lg tracking-tighter select-none"
        style={{
          background:
            'linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #059669 100%)',
        }}
      >
        SX
      </div>
      <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
        SnappX
      </span>
    </div>
  );
}
