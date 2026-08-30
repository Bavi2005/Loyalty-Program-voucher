// frontend/src/pages/Dashboard.jsx

import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { SkeletonLoader } from '../components/ui';

const statCards = [
  { label: 'Pending Receipts', key: 'pendingReceipts', icon: '📋', gradient: 'from-amber-500 to-orange-500', accent: 'text-amber-600', dark: 'dark:text-amber-400' },
  { label: 'Approved Receipts', key: 'approvedReceipts', icon: '✅', gradient: 'from-emerald-500 to-green-500', accent: 'text-emerald-600', dark: 'dark:text-emerald-400' },
  { label: 'Available Vouchers', key: 'availableVouchers', icon: '🎁', gradient: 'from-violet-500 to-purple-500', accent: 'text-violet-600', dark: 'dark:text-violet-400' },
  { label: 'Total Spent', key: 'totalSpent', icon: '💰', gradient: 'from-indigo-500 to-blue-500', accent: 'text-indigo-600', dark: 'dark:text-indigo-400', prefix: '$' },
];

const COLORS = ['#f59e0b', '#10b981', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading, error, refreshStats } = useUser();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  if (loading) {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
          <p className="mt-2 text-[15px] text-gray-500 dark:text-slate-400">Loading your loyalty overview…</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map((_, i) => (
            <SkeletonLoader
              key={i}
              width="100%"
              height="80px"
              count={3}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <SkeletonLoader
            width="100%"
            height="120px"
            count={2}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2"
          />
          <SkeletonLoader
            width="100%"
            height="120px"
            count={1}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-center text-rose-500">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Pending', value: stats?.pendingReceipts || 0 },
    { name: 'Approved', value: stats?.approvedReceipts || 0 },
    { name: 'Vouchers', value: stats?.availableVouchers || 0 },
  ];

  return (
    <div className="space-y-10">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-10 text-white shadow-2xl shadow-indigo-600/25 sm:px-12 sm:py-12"
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[size:22px_22px]" />

        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100/80">Member dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {user?.name || 'there'} 👋
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-indigo-100/90">
              Every receipt moves you closer to your next reward. Upload it and we&apos;ll handle the rest.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/upload-receipt"
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Upload receipt
              </Link>
              <Link
                to="/vouchers"
                className="rounded-xl bg-white/15 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
              >
                My vouchers
              </Link>
            </div>
          </div>

          <div className="hidden rounded-2xl bg-white/15 px-7 py-6 ring-1 ring-white/25 backdrop-blur-md lg:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100/80">Total spent</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
              ${Number(stats?.totalSpent || 0).toFixed(2)}
            </p>
            <p className="mt-1 text-xs font-medium text-indigo-100/80">
              {stats?.availableVouchers || 0} voucher{stats?.availableVouchers === 1 ? '' : 's'} available
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="card card-hover rounded-2xl p-7"
          >
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-2xl shadow-lg`}>
              {card.icon}
            </div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">{card.label}</p>
            <p className={`mt-2 text-4xl font-extrabold tracking-tight ${card.accent} ${card.dark}`}>
              {card.prefix || ''}
              {stats?.[card.key] || 0}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card rounded-2xl p-7 lg:col-span-2">
          <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid gap-4">
            {[
              { to: '/receipt-history', title: 'View Receipt History', sub: 'See all your submitted receipts', icon: '🧾' },
              { to: '/vouchers', title: 'My Vouchers', sub: 'View and use your vouchers', icon: '🎟️' },
              { to: '/settings', title: 'Account Settings', sub: 'Update your profile information', icon: '⚙️' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-5 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-indigo-500/40 dark:hover:bg-slate-800"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-xl dark:from-indigo-500/10 dark:to-violet-500/10">{a.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{a.sub}</p>
                </div>
                <span className="text-gray-400 transition-transform group-hover:translate-x-1 dark:text-slate-500">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card rounded-2xl p-7">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Activity</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={4}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-5 text-xs font-medium text-gray-500 dark:text-slate-400">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
