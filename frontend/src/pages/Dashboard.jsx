// frontend/src/pages/Dashboard.jsx

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, ReceiptText, Clock, Wallet, ArrowRight, ChevronRight, UploadCloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { SkeletonLoader, Badge, ProgressBar } from '../components/ui';
import { Logo } from '../components/Navbar';
import { formatCurrency, formatDateTime, timeAgoExpiry } from '../utils/formatters';

const REWARD_TARGET = 500;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function memberTier(spent) {
  if (spent >= 2000) return { name: 'Platinum', ring: 'ring-cyan-200/30', text: 'from-sky-400/90 to-cyan-200/90' };
  if (spent >= 500) return { name: 'Gold', ring: 'ring-amber-300/30', text: 'from-amber-300 to-yellow-200' };
  if (spent >= 100) return { name: 'Silver', ring: 'ring-slate-300/30', text: 'from-slate-200 to-gray-100' };
  return { name: 'Bronze', ring: 'ring-orange-300/30', text: 'from-orange-300 to-amber-200' };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, receipts, vouchers, loading, error, refreshStats, fetchReceipts, fetchVouchers } = useUser();

  useEffect(() => {
    refreshStats();
    fetchReceipts();
    fetchVouchers();
  }, [refreshStats, fetchReceipts, fetchVouchers]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <SkeletonLoader width="50%" height="36px" />
        <SkeletonLoader height="180px" className="rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <SkeletonLoader key={i} height="110px" className="rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card mx-auto max-w-md rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-rose-600">{error}</p>
        <button onClick={refreshStats} className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  const spent = Number(stats?.totalSpent || 0);
  const pct = Math.min(100, Math.round((spent / REWARD_TARGET) * 100));
  const remaining = Math.max(0, REWARD_TARGET - spent);
  const tier = memberTier(spent);
  const pending = stats?.pendingReceipts || 0;
  const available = (vouchers || []).filter((v) => !v.redeemedAt && (!v.expiresAt || new Date(v.expiresAt) > new Date())).length;
  const recent = (receipts || []).slice(0, 5);

  const quickStats = [
    { label: 'Available rewards', value: available, icon: Gift },
    { label: 'Being reviewed', value: pending, icon: Clock },
    { label: 'Rewarded purchases', value: stats?.approvedReceipts || 0, icon: ReceiptText },
    { label: 'Lifetime rewarded spend', value: formatCurrency(spent), icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          {greeting()}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1.5 text-[15px] text-gray-500 dark:text-slate-400">
          {remaining > 0
            ? <>You're <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(remaining)}</span> away from your next reward.</>
            : 'Your next reward is ready 🎉'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Membership card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-[#0F172A] p-6 text-white shadow-xl shadow-indigo-900/20 sm:p-8 lg:col-span-3 ring-1 ${tier.ring}`}
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:24px_24px]" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="text-sm font-semibold tracking-wide text-white/90">LoyaltyPro</span>
            </div>
            <span className={`bg-gradient-to-r bg-clip-text text-sm font-extrabold uppercase tracking-widest text-transparent ${tier.text}`}>
              {tier.name} member
            </span>
          </div>

          <div className="relative mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200/80">Reward balance</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{formatCurrency(spent)}</p>
            <p className="mt-1 text-sm font-medium text-indigo-200/80">qualifying spend</p>
          </div>

          <div className="relative mt-6">
            <div className="flex items-end justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200/80">Next reward</p>
              <p className="text-sm font-bold tabular-nums">
                {formatCurrency(spent)} <span className="text-indigo-200/60">/ {formatCurrency(REWARD_TARGET)}</span>
              </p>
            </div>
            <div className="mt-2.5">
              <ProgressBar value={pct} tone="gold" className="!h-2 !bg-white/15" />
            </div>
            <p className="mt-2 text-xs font-medium text-indigo-100/90">
              {remaining > 0 ? `${formatCurrency(remaining)} to go — upload your next receipt.` : 'You did it — a new voucher is ready.'}
            </p>
            <Link
              to="/upload-receipt"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <UploadCloud className="h-4 w-4" />
              Upload receipt
            </Link>
          </div>
        </motion.section>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-2">
          {quickStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 + i * 0.05 }}
              className="card rounded-2xl p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card rounded-2xl p-6 sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent activity</h2>
          <Link to="/receipt-history" className="group inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-xl bg-gray-50 px-6 py-10 text-center dark:bg-slate-800/60">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-300">No activity yet</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
              <Link to="/upload-receipt" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Upload your first receipt</Link> to start earning.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-slate-700/60">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900 dark:text-white">{r.orderId}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{formatDateTime(r.submittedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-gray-900 dark:text-white">{formatCurrency(r.amount)}</p>
                  <Badge status={r.status}>
                    {r.status === 'PENDING' ? 'Under review' : r.status === 'APPROVED' ? 'Rewarded' : 'Rejected'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      {/* Available vouchers teaser */}
      {available > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card flex flex-wrap items-center justify-between gap-4 rounded-2xl border-l-4 border-l-amber-400 p-6"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                {available} reward{available === 1 ? '' : 's'} ready to use
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {vouchers.filter((v) => !v.redeemedAt && v.expiresAt).slice(0, 1).map((v) => {
                  const t = timeAgoExpiry(v.expiresAt);
                  return t ? `Next expiry: ${t}` : '';
                })}
              </p>
            </div>
          </div>
          <Link to="/vouchers" className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500">
            View rewards
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.section>
      )}
    </div>
  );
}
