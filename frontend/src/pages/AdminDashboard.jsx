// frontend/src/pages/AdminDashboard.jsx

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useToast, Spinner, SkeletonLoader } from '../components/ui';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const CHART_COLORS = ['#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'];

const statCards = [
  { label: 'Pending Receipts', key: 'pendingReceipts', icon: '📋', gradient: 'from-amber-500 to-orange-500' },
  { label: 'Approved Receipts', key: 'approvedReceipts', icon: '✅', gradient: 'from-emerald-500 to-green-500' },
  { label: 'Rejected Receipts', key: 'rejectedReceipts', icon: '❌', gradient: 'from-rose-500 to-red-500' },
  { label: 'Vouchers Issued', key: 'vouchersIssued', icon: '🎁', gradient: 'from-violet-500 to-purple-500' },
];

export default function AdminDashboard() {
  const { admin, stats, adminLoading, error, fetchStats, fetchReceipts } = useAdmin();
  const { error: toastError } = useToast();

  useEffect(() => {
    if (admin) {
      fetchStats();
      fetchReceipts();
    }
  }, [admin, fetchStats, fetchReceipts]);

  useEffect(() => {
    if (error) toastError(error);
  }, [error, toastError]);

  if (!admin || adminLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Admin dashboard
          </h2>
          <p className="mt-2 text-[15px] text-gray-500 dark:text-slate-400">
            Loading the admin data…
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map((_, i) => (
            <SkeletonLoader
              key={i}
              width="100%"
              height="80px"
              count={3}
              className="card rounded-2xl p-7"
            />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <SkeletonLoader
            width="100%"
            height="120px"
            count={2}
            className="card rounded-2xl p-7 lg:col-span-2"
          />
          <SkeletonLoader
            width="100%"
            height="120px"
            count={1}
            className="card rounded-2xl p-7"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Overview</h1>
        <p className="mt-2 text-[15px] text-gray-500 dark:text-slate-400">Welcome back, {admin?.name || admin?.email} — here are your key metrics.</p>
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
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-2xl shadow-sm`}>
              {card.icon}
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stats?.[card.key] || 0}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Link
          to="/admin/receipts"
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 lg:col-span-2"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Receipts</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Review and validate pending submissions</p>
          </div>
          <span className="flex items-center font-semibold text-indigo-600 dark:text-indigo-400">
            View Receipts <span className="ml-2">→</span>
          </span>
        </Link>

        <div className="card rounded-2xl p-7">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Receipt Status</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statCards.map((c) => ({ name: c.label.replace(' Receipts', ''), value: stats?.[c.key] || 0 }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={68}
                  paddingAngle={4}
                >
                  {statCards.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-slate-400">
            {statCards.map((c, i) => (
              <span key={c.key} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                {c.label.replace(' Receipts', '')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
