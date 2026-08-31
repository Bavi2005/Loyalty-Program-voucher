// frontend/src/pages/Vouchers.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as axios } from '../api';
import confetti from 'canvas-confetti';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast, PageHeader, Badge, Spinner, EmptyState, btnSmPrimary, btnGhost } from '../components/ui';

function voucherState(v) {
  if (v.redeemedAt) return 'redeemed';
  if (v.expiresAt && new Date(v.expiresAt) < new Date()) return 'expired';
  return 'active';
}

const STATE_ART = {
  active: { cls: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-100 dark:ring-emerald-500/20' },
  redeemed: { cls: 'from-gray-300 to-gray-400', ring: 'ring-gray-100 dark:ring-slate-700' },
  expired: { cls: 'from-rose-400 to-red-500', ring: 'ring-rose-100 dark:ring-rose-500/20' },
};

export default function Vouchers() {
  const { vouchers, loading, error, fetchVouchers } = useUser();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  useEffect(() => {
    if (error) toastError(error);
  }, [error, toastError]);

  const handleRedeem = async (id) => {
    setRedeeming(id);
    try {
      await axios.post(`/api/user/vouchers/${id}/redeem`);
      success('Voucher redeemed successfully!');
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
      await fetchVouchers();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to redeem voucher');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const activeCount = vouchers.filter((v) => voucherState(v) === 'active').length;

  return (
    <div>
      <PageHeader
        title="My Vouchers"
        subtitle={
          activeCount > 0
            ? `You have ${activeCount} active voucher${activeCount === 1 ? '' : 's'} ready to use.`
            : 'Your rewards will appear here as receipts are approved.'
        }
        action={
          <button className={btnGhost} onClick={() => navigate('/upload-receipt')}>
            Earn more
          </button>
        }
      />

      {vouchers.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No vouchers yet"
          description="Upload a receipt and once an admin approves it, your reward voucher will appear here."
          action={
            <button className={btnSmPrimary} onClick={() => navigate('/upload-receipt')}>
              Upload your first receipt
            </button>
          }
        />
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {vouchers.map((v, idx) => {
            const state = voucherState(v);
            const art = STATE_ART[state];
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="card card-hover relative flex flex-col overflow-hidden rounded-3xl"
              >
                {/* Gradient header */}
                <div className={`relative flex items-center justify-between bg-gradient-to-br ${art.cls} px-7 py-6`}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
                      🎟️
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Reward</p>
                      <p className="text-lg font-extrabold tracking-tight text-white">
                        ${Number(v.receipt?.amount || 0).toFixed(2)} value
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {state}
                  </span>
                </div>

                {/* Perforated ticket divider */}
                <div className="relative flex items-center" aria-hidden="true">
                  <span className="absolute -left-3 h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-950" />
                  <span className="absolute -right-3 h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-950" />
                  <div className="mx-5 h-0 flex-1 border-t-2 border-dashed border-gray-200 dark:border-slate-700" />
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-5 px-7 py-6">
                  <div className="rounded-2xl bg-gray-50 px-5 py-4 text-center ring-1 ring-inset ring-gray-100 dark:bg-slate-800/70 dark:ring-slate-700">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
                      Voucher Code
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold tracking-[0.18em] text-gray-900 dark:text-white">
                      {v.code}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">From receipt</dt>
                      <dd className="mt-0.5 font-semibold text-gray-900 dark:text-white">{v.receipt?.orderId || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Issued</dt>
                      <dd className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                        {format(new Date(v.issuedAt), 'MMM d, yyyy')}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                        {state === 'redeemed' ? 'Redeemed on' : 'Valid until'}
                      </dt>
                      <dd className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                        {format(new Date(state === 'redeemed' ? v.redeemedAt : v.expiresAt), 'MMM d, yyyy')}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-1">
                    {state === 'active' ? (
                      <button
                        onClick={() => handleRedeem(v.id)}
                        disabled={redeeming === v.id}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-600/40 active:scale-[0.98] disabled:opacity-60"
                      >
                        {redeeming === v.id ? 'Redeeming…' : 'Redeem now'}
                      </button>
                    ) : (
                      <button
                        onClick={() => info(state === 'expired' ? 'This voucher has expired.' : 'This voucher was already used.')}
                        className="w-full cursor-pointer rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-gray-200 dark:bg-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        {state === 'expired' ? 'Expired' : 'Redeemed'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
