const facilityMarkers = [
  { top: '16%', side: '18%', size: 78, delay: '0s', reverse: false },
  { top: '28%', side: '12%', size: 54, delay: '1.4s', reverse: true },
  { top: '62%', side: '20%', size: 62, delay: '0.8s', reverse: false }
];

const AuthFarmBackdrop = ({ align = 'right' }) => {
  const mirrored = align === 'left';
  const prefix = mirrored ? 'farm-left' : 'farm-right';

  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(circle at 15% 18%, rgba(255, 224, 178, 0.75), transparent 24%)',
              'radial-gradient(circle at 78% 12%, rgba(187, 247, 208, 0.8), transparent 28%)',
              'radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.55), transparent 26%)',
              'linear-gradient(135deg, #edf5e8 0%, #f7f3e8 46%, #deeedc 100%)'
            ].join(', ')
          }}
        />

        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: [
              'radial-gradient(circle at 15% 18%, rgba(255, 224, 178, 0.18), transparent 24%)',
              'radial-gradient(circle at 78% 12%, rgba(187, 247, 208, 0.16), transparent 28%)',
              'radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.08), transparent 26%)',
              'linear-gradient(135deg, #11261b 0%, #1a3326 46%, #224936 100%)'
            ].join(', ')
          }}
        />

        <div
          className="farm-grid absolute inset-0 opacity-25 dark:opacity-15"
          style={{
            backgroundImage: [
              'linear-gradient(rgba(22, 101, 52, 0.09) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(22, 101, 52, 0.09) 1px, transparent 1px)'
            ].join(', '),
            backgroundSize: '120px 120px'
          }}
        />

        <div className={`absolute top-8 ${mirrored ? '-left-16' : '-right-16'} h-80 w-80 rounded-full bg-amber-200/60 blur-3xl farm-breathe dark:bg-amber-200/15`} />
        <div className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl farm-breathe-delayed dark:bg-white/10" />
        <div className={`absolute bottom-[-8rem] ${mirrored ? 'right-[-7rem]' : 'left-[-7rem]'} h-[26rem] w-[26rem] rounded-full bg-emerald-300/35 blur-3xl farm-drift-reverse dark:bg-emerald-300/16`} />

        <div className={`absolute top-12 ${mirrored ? 'right-[7%]' : 'left-[7%]'} hidden md:block h-52 w-52 rounded-[2rem] border border-white/45 bg-white/20 shadow-[0_30px_80px_-40px_rgba(20,83,45,0.55)] backdrop-blur-[3px] farm-cardFloat dark:border-white/15 dark:bg-emerald-950/20 dark:shadow-[0_30px_80px_-40px_rgba(20,83,45,0.45)]`}>
          <div className="absolute inset-4 rounded-[1.4rem] border border-emerald-900/10 dark:border-emerald-50/10" />
          <svg className="h-full w-full p-7 text-emerald-950/45 dark:text-emerald-50/30" viewBox="0 0 180 180" fill="none">
            <path d="M32 120V90l26-18 26 18v30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M92 120V82l34-24 34 24v38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 96h36M102 88h48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
            <path d="M132 58v62" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M62 120v-20h18v20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="112" cy="102" r="4.5" fill="currentColor" />
            <circle cx="128" cy="102" r="4.5" fill="currentColor" />
            <circle cx="144" cy="102" r="4.5" fill="currentColor" />
            <path d="M28 138h124" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
          </svg>
        </div>

        {facilityMarkers.map((marker, index) => (
          <div
            key={`${prefix}-marker-${index}`}
            className="absolute hidden sm:block"
            style={{
              top: marker.top,
              [mirrored ? 'right' : 'left']: marker.side
            }}
          >
            <div
              className={marker.reverse ? 'farm-float-reverse' : 'farm-float-slow'}
              style={{ animationDelay: marker.delay }}
            >
              <svg
                className="text-emerald-900/25 dark:text-emerald-50/18"
                width={marker.size}
                height={marker.size}
                viewBox="0 0 80 80"
                fill="none"
              >
                <ellipse cx="40" cy="40" rx="24" ry="30" fill="currentColor" opacity="0.18" />
                <path
                  d="M28 48c4-8 10-15 21-20"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M33 56c5-3 9-7 13-12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>
        ))}

        <div
          className={`absolute ${mirrored ? 'left-0' : 'right-0'} top-0 h-full w-[32%] opacity-45`}
          style={{
            background: mirrored
              ? 'linear-gradient(90deg, rgba(255,255,255,0.12), transparent)'
              : 'linear-gradient(270deg, rgba(255,255,255,0.12), transparent)'
          }}
        />

        <div className={`absolute bottom-0 ${mirrored ? '-left-12' : '-right-12'} w-[72rem] max-w-none opacity-90 farm-rise`}>
          <svg
            className={`${mirrored ? '-scale-x-100' : ''} h-auto w-full text-emerald-950/35 dark:text-emerald-50/16`}
            viewBox="0 0 1200 460"
            fill="none"
          >
            <defs>
              <linearGradient id={`${prefix}-ground`} x1="0" y1="0" x2="1200" y2="0">
                <stop offset="0%" stopColor="rgba(22, 101, 52, 0.06)" />
                <stop offset="55%" stopColor="rgba(22, 101, 52, 0.18)" />
                <stop offset="100%" stopColor="rgba(20, 83, 45, 0.26)" />
              </linearGradient>
              <linearGradient id={`${prefix}-barn`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.78)" />
                <stop offset="100%" stopColor="rgba(187,247,208,0.4)" />
              </linearGradient>
            </defs>

            <path d="M0 345C140 312 258 310 372 334C492 360 612 374 734 358C838 344 948 306 1200 268V460H0Z" fill={`url(#${prefix}-ground)`} />
            <path d="M0 364C212 324 356 330 530 362C728 399 905 380 1200 316" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
            <path d="M96 374C238 350 320 356 466 382C572 402 654 401 776 382" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.18" />

            <g stroke="currentColor" strokeWidth="5" strokeLinejoin="round">
              <path d="M136 250L214 194L292 250V326H136Z" fill={`url(#${prefix}-barn)`} />
              <path d="M196 326V270H232V326" opacity="0.9" />
              <path d="M160 246H268" opacity="0.75" />
              <circle cx="178" cy="286" r="7" fill="currentColor" opacity="0.45" stroke="none" />
              <circle cx="250" cy="286" r="7" fill="currentColor" opacity="0.45" stroke="none" />

              <path d="M362 238L472 170L582 238V338H362Z" fill={`url(#${prefix}-barn)`} />
              <path d="M426 338V266H474V338" opacity="0.9" />
              <path d="M392 230H552" opacity="0.75" />
              <circle cx="414" cy="282" r="8" fill="currentColor" opacity="0.4" stroke="none" />
              <circle cx="454" cy="282" r="8" fill="currentColor" opacity="0.4" stroke="none" />
              <circle cx="494" cy="282" r="8" fill="currentColor" opacity="0.4" stroke="none" />
              <circle cx="534" cy="282" r="8" fill="currentColor" opacity="0.4" stroke="none" />

              <path d="M694 252L788 188L882 252V332H694Z" fill={`url(#${prefix}-barn)`} />
              <path d="M742 332V274H790V332" opacity="0.9" />
              <path d="M720 244H856" opacity="0.75" />
              <circle cx="748" cy="286" r="7" fill="currentColor" opacity="0.4" stroke="none" />
              <circle cx="788" cy="286" r="7" fill="currentColor" opacity="0.4" stroke="none" />
              <circle cx="828" cy="286" r="7" fill="currentColor" opacity="0.4" stroke="none" />

              <path d="M948 162V334" strokeLinecap="round" />
              <path d="M984 186V334" strokeLinecap="round" opacity="0.75" />
              <path d="M924 170C924 148 942 130 964 130C986 130 1004 148 1004 170V186H924V170Z" fill={`url(#${prefix}-barn)`} />
              <path d="M1006 202H1060V332H1006Z" fill={`url(#${prefix}-barn)`} />
              <path d="M1018 220H1048" opacity="0.75" />
              <path d="M1018 248H1048" opacity="0.75" />
              <path d="M1018 276H1048" opacity="0.75" />
            </g>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes farmGridPan {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(24px, 14px, 0);
          }
        }

        @keyframes farmBreathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes farmDrift {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(18px, -14px, 0);
          }
        }

        @keyframes farmCardFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }

        @keyframes farmFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -12px, 0) rotate(-4deg);
          }
        }

        @keyframes farmFloatReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, 10px, 0) rotate(5deg);
          }
        }

        @keyframes farmRise {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }
          to {
            opacity: 0.9;
            transform: translate3d(0, 0, 0);
          }
        }

        .farm-grid {
          animation: farmGridPan 18s linear infinite alternate;
        }

        .farm-breathe {
          animation: farmBreathe 8s ease-in-out infinite;
        }

        .farm-breathe-delayed {
          animation: farmBreathe 10s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        .farm-drift-reverse {
          animation: farmDrift 12s ease-in-out infinite reverse;
        }

        .farm-cardFloat {
          animation: farmCardFloat 7s ease-in-out infinite;
        }

        .farm-float-slow {
          animation: farmFloat 7s ease-in-out infinite;
        }

        .farm-float-reverse {
          animation: farmFloatReverse 8s ease-in-out infinite;
        }

        .farm-rise {
          animation: farmRise 0.9s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .farm-grid,
          .farm-breathe,
          .farm-breathe-delayed,
          .farm-drift-reverse,
          .farm-cardFloat,
          .farm-float-slow,
          .farm-float-reverse,
          .farm-rise {
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default AuthFarmBackdrop;
