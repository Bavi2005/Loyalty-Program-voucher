import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function BrandMark({ compact = false }) {
  return (
    <Link to="/login" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-base font-bold text-white ring-1 ring-white/25 backdrop-blur">
        LP
      </div>
      <span className={`text-lg font-bold tracking-tight text-white ${compact ? '' : 'drop-shadow'}`}>
        LoyaltyPro
      </span>
    </Link>
  );
}

const STAGGER = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  headline,
  brandPoints = [],
  admin = false,
}) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* ---------- Brand / showcase panel ---------- */}
      <div
        className={`relative hidden flex-1 flex-col justify-between overflow-hidden px-14 py-12 lg:flex xl:px-16 ${
          admin
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950'
            : 'bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700'
        }`}
      >
        {/* ambient glow + dot texture */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-16 h-[26rem] w-[26rem] rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:26px_26px]" />

        <motion.div variants={STAGGER} initial="hidden" animate="show" custom={0}>
          <BrandMark />
        </motion.div>

        <div className="relative">
          <motion.h1
            variants={STAGGER}
            initial="hidden"
            animate="show"
            custom={1}
            className="max-w-xl text-5xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-6xl"
          >
            {headline}
          </motion.h1>
          <motion.p
            variants={STAGGER}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-md text-[17px] leading-relaxed text-indigo-100/90"
          >
            {subtitle}
          </motion.p>

          <div className="mt-12 space-y-5">
            {brandPoints.map((point, i) => (
              <motion.div
                key={point}
                variants={STAGGER}
                initial="hidden"
                animate="show"
                custom={3 + i}
                className="flex items-center gap-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] font-medium text-white">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* floating loyalty card mock */}
        <motion.div
          initial={{ opacity: 0, y: 28, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
          className="absolute bottom-16 right-14 hidden w-72 rounded-2xl bg-white/10 p-6 ring-1 ring-white/25 backdrop-blur-md xl:block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-100">Gold Member</p>
            <span className="text-2xl">🏅</span>
          </div>
          <p className="mt-5 text-3xl font-extrabold text-white">2,450</p>
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-200">Points balance</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-pink-400"
            />
          </div>
          <p className="mt-3 text-xs text-indigo-100/90">$170 more to next reward</p>
        </motion.div>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="flex flex-1 items-center justify-center px-6 py-14 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-10 lg:hidden">
            <Link to="/login" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-bold text-white shadow-lg shadow-indigo-600/30">
                LP
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">LoyaltyPro</span>
            </Link>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>

          <div className="mt-10">{children}</div>

          {footer}
        </motion.div>
      </div>
    </div>
  );
}
