'use client';

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Orb 1 — indigo, top-right */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '560px', height: '560px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
          top: '-15%', right: '-10%',
          animation: 'orbFloat1 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl dark:opacity-100 opacity-0"
        style={{
          width: '560px', height: '560px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          top: '-15%', right: '-10%',
          animation: 'orbFloat1 18s ease-in-out infinite',
        }}
      />

      {/* Orb 2 — violet, bottom-left */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '480px', height: '480px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
          bottom: '-10%', left: '-8%',
          animation: 'orbFloat2 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl dark:opacity-100 opacity-0"
        style={{
          width: '480px', height: '480px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          bottom: '-10%', left: '-8%',
          animation: 'orbFloat2 22s ease-in-out infinite',
        }}
      />

      {/* Orb 3 — sky, center-left */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.35) 0%, transparent 70%)',
          top: '40%', left: '25%',
          animation: 'orbFloat3 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl dark:opacity-100 opacity-0"
        style={{
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
          top: '40%', left: '25%',
          animation: 'orbFloat3 20s ease-in-out infinite',
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(99,102,241,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 70%)',
        }}
      />

      <style jsx>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.05); }
          66% { transform: translate(20px, -20px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -25px) scale(1.08); }
          66% { transform: translate(-25px, 15px) scale(0.93); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, -35px) scale(1.06); }
        }
      `}</style>
    </div>
  );
}
