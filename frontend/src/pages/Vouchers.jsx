// frontend/src/pages/Vouchers.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, AlertCircle, Wallet, Tag, Timer } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast, PageHeader, SkeletonLoader, EmptyState, Modal, Button, Badge, btnGhost, btnSmPrimary } from '../components/ui';
import { formatCurrency, formatDate, timeAgoExpiry } from '../utils/formatters';
import { api as axios } from '../api';

function voucherState(v) {
  if (v.redeemedAt) return 'redeemed';
  if (v.expiresAt && new Date(v.expiresAt) < new Date()) return 'expired';
  return 'active';
}

const TABS = [
  { key: 'active', label: 'Available' },
  { key: 'redeemed', label: 'Redeemed' },
  { key: 'expired', label: 'Expired' },
];

export default function Vouchers() {
  const { vouchers, loading, error, fetchVouchers } = useUser();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('active');
  const [redeeming, setRedeeming] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [revealId, setRevealId] = useState(null);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);
  useEffect(() => { if (error) toastError('Vouchers', error); }, [error, toastError]);

  const handleRedeem = async (id) => {
    setConfirmId(null);
    setRedeeming(id);
    try {
      await axios.post(`/api/user/vouchers/${id}/redeem`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      success('Voucher redeemed!', 'Show the code at the counter.');
      await fetchVouchers();
      setTab('redeemed');
    } catch (err) {
      toastError('Redeem failed', err.response?.data?.message || 'Could not redeem voucher');
    } finally {
      setRedeeming(null);
    }
  };

  const byTab = (state) => (vouchers || []).filter((v) => voucherState(v) === state);
  const list = byTab(tab);
  const counts = { active: byTab('active').length, redeemed: byTab('redeemed').length, expired: byTab('expired').length };

  return (
    <div>
      <PageHeader
        title="Rewards"
        subtitle="Your vouchers, ready when you are. Tap one to show the code."
        action={
          <button className={btnGhost} onClick={() => navigate('/upload-receipt')}>
            Earn more
          </button>
        }
      />

      <div className="mb-6 inline-flex rounded-xl bg-gray-100 p-1 ring-1 ring-gray-200/60 dark:bg-slate-800/60 dark:ring-slate-700/50">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.label}{' '}
            <span className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${tab === t.key ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-gray-400 dark:text-slate-500'}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonLoader key={i} height="220px" className="rounded-3xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title={tab === 'active' ? 'No vouchers to redeem yet' : 'Nothing here yet'}
          description={
            tab === 'active'
              ? 'Upload receipts to earn rewards — once approved, your voucher will land here.'
              : undefined
          }
          action={tab === 'active' ? <button className={btnSmPrimary} onClick={() => navigate('/upload-receipt')}>Upload a receipt</button> : null}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((v, i) => (
            <VoucherTicket
              key={v.id}
              voucher={v}
              index={i}
              onShowCode={() => setRevealId(v.id)}
              onRedeem={() => setConfirmId(v.id)}
              redeeming={redeeming === v.id}
            />
          ))}
        </div>
      )}

      {/* Confirm redeem */}
      <Modal open={confirmId !== null} onClose={() => setConfirmId(null)} title="Redeem this voucher?">
        <p className="text-sm text-gray-600 dark:text-slate-300">
          This will mark the voucher as used at the store. You can&apos;t undo it after that.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className={btnGhost} onClick={() => setConfirmId(null)}>Cancel</button>
          <Button onClick={() => handleRedeem(confirmId)} loading={redeeming === confirmId} loadingText="Redeeming…">
            Redeem now
          </Button>
        </div>
      </Modal>

      {/* Code-reveal modal */}
      <Modal open={revealId !== null} onClose={() => setRevealId(null)} title="Show at the counter">
        {(() => {
          const v = (vouchers || []).find((x) => x.id === revealId);
          if (!v) return null;
          const state = voucherState(v);
          return (
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Voucher code</p>
              <p className="mt-2 break-all font-mono text-[28px] font-extrabold tracking-[0.18em] text-gray-900 dark:text-white">{v.code}</p>
              <div className="mt-3">
                <Badge status={state}>{state === 'active' ? 'Ready to use' : state === 'redeemed' ? 'Already redeemed' : 'Expired'}</Badge>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                From receipt {v.receipt?.orderId || 'N/A'} · {formatCurrency(Number(v.receipt?.amount || 0))} purchase
              </p>
              {state === 'active' && (
                <button
                  className={`${btnSmPrimary} mt-6 w-full rounded-xl py-3`}
                  onClick={() => { setConfirmId(v.id); }}
                >
                  Redeem this voucher
                </button>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

/* --- Ticket-style voucher card --- */
function VoucherTicket({ voucher: v, index = 0, onShowCode, onRedeem, redeeming }) {
  const state = voucherState(v);
  const amount = Number(v.receipt?.amount || 0);

  const stateStyle = {
    active: {
      header: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700',
      ring: 'ring-indigo-100 dark:ring-indigo-500/20',
      value: 'text-white',
    },
    redeemed: {
      header: 'bg-gradient-to-br from-gray-400 to-gray-500',
      ring: 'ring-gray-100 dark:ring-slate-700',
      value: 'text-white',
    },
    expired: {
      header: 'bg-gradient-to-br from-rose-400 to-red-500',
      ring: 'ring-rose-100 dark:ring-rose-500/20',
      value: 'text-white/95',
    },
  }[state];

  const expiryText = v.expiresAt ? timeAgoExpiry(v.expiresAt) : null;
  const expiryWarn = state === 'active' && v.expiresAt && (new Date(v.expiresAt).getTime() - Date.now()) < 7 * 86400000;

  return (
    <motion.button
      type="button"
      onClick={onShowCode}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`card card-hover relative flex w-full flex-col overflow-hidden rounded-3xl text-left ring-1 ${stateStyle.ring}`}
      aria-label={`Voucher ${v.code}, ${formatCurrency(amount)} purchase, ${state}`}
    >
      {/* Header */}
      <div className={`relative px-6 py-5 ${stateStyle.header}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <Tag className="h-4 w-4 opacity-80" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-90">Loyalty reward</span>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {state === 'active' ? 'Ready' : state}
          </span>
        </div>
        <p className={`mt-4 text-4xl font-extrabold tracking-tight ${stateStyle.value}`}>{formatCurrency(amount)}</p>
        <p className="mt-0.5 text-xs font-medium text-white/80">{formatDate(v.issuedAt)} · {v.receipt?.orderId || 'Receipt'}</p>
      </div>

      {/* Perforation */}
      <div className="relative flex items-center" aria-hidden="true">
        <span className="absolute -left-3 h-6 w-6 rounded-full" style={{ background: 'var(--bg)' }} />
        <span className="absolute -right-3 h-6 w-6 rounded-full" style={{ background: 'var(--bg)' }} />
        <div className="mx-5 h-px w-full border-t-2 border-dashed border-gray-200 dark:border-slate-700" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between gap-4 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">Code</p>
            <p className="mt-0.5 truncate font-mono text-base font-bold tracking-wider text-gray-900 dark:text-white">{v.code}</p>
          </div>
          <Wallet className="h-5 w-5 shrink-0 text-gray-300 dark:text-slate-600" />
        </div>

        {state === 'active' ? (
          <div className="flex items-center gap-2">
            {expiryText && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                expiryWarn
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                <Timer className="h-3.5 w-3.5" />
                {expiryText}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            {state === 'redeemed' ? `Redeemed ${formatDate(v.redeemedAt)}` : `Expired`}
          </p>
        )}

        {state === 'active' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRedeem(); }}
            disabled={redeeming}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/35 active:scale-[0.98] disabled:opacity-60"
          >
            {redeeming ? 'Redeeming…' : 'Redeem now'}
          </button>
        )}
      </div>
    </motion.button>
  );
}
