// frontend/src/components/ui.jsx

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ---------------- Animation presets ---------------- */
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const MotionDiv = motion.div;
export { AnimatePresence };

/* ---------------- Spinner ---------------- */
export function Spinner({ className = 'h-12 w-12' }) {
  return (
    <div
      className={`${className} animate-spin rounded-full border-4 border-indigo-600 border-t-transparent`}
    />
  );
}

/* ---------------- Status Badge ---------------- */
const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700 ring-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-700 ring-rose-200',
  active: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  redeemed: 'bg-gray-100 text-gray-600 ring-gray-200',
  expired: 'bg-rose-100 text-rose-700 ring-rose-200',
};

export function Badge({ status, children }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 ring-gray-200';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {children}
    </span>
  );
}

/* ---------------- Empty State ---------------- */
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white px-8 py-24 text-center dark:border-slate-700 dark:bg-slate-800/60">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 text-4xl shadow-inner dark:from-indigo-500/10 dark:to-violet-500/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-gray-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

/* ---------------- Page Header ---------------- */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-gray-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------------- Toast System ---------------- */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (type, message) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = {
    toast,
    success: (m) => toast('success', m),
    error: (m) => toast('error', m),
    info: (m) => toast('info', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 transition ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white ring-emerald-700'
                : t.type === 'error'
                ? 'bg-rose-600 text-white ring-rose-700'
                : 'bg-gray-900 text-white ring-gray-800'
            }`}
          >
            <span className="text-lg leading-none">{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            <p className="text-sm font-medium">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-auto text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { success() {}, error() {}, info() {} };
  return ctx;
}

/* ---------------- Skeleton Loader ---------------- */
export function SkeletonLoader({ width = '100%', height = '16px', radius = '4px', count = 1, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ width, height, borderRadius: radius }}
        />
      ))}
    </div>
  );
}

/* ---------------- Form primitives ---------------- */
export const inputCls =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20';

export const labelCls = 'mb-2 block text-[13px] font-semibold text-gray-700 dark:text-slate-300';

export const btnPrimaryCls =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-600/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none';

export const btnSmPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-600/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-200/60 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-slate-700';

export function Field({ id, label, error, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`${inputCls} ${
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10 dark:border-rose-500/40' : ''
        }`}
      />
      {error && <p className="mt-1.5 text-[13px] font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

export function Button({ loading = false, loadingText = 'Please wait…', className = '', ...props }) {
  return (
    <button disabled={props.disabled || loading} {...props} className={`${btnPrimaryCls} ${className}`}>
      {loading ? loadingText : props.children}
    </button>
  );
}

export function Alert({ children }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
      <span aria-hidden="true">⚠</span>
      <p>{children}</p>
    </div>
  );
}

/* ---------------- Ripple Effect ---------------- */
export function Ripple({ children, className = '' }) {
  const [ripple, setRipple] = useState(null);

  const handleClick = (e) => {
    const btnRect = e.currentTarget.getBoundingClientRect();
    const rippleSize = Math.max(btnRect.width, btnRect.height);
    setRipple({
      x: e.clientX - btnRect.left - rippleSize / 2,
      y: e.clientY - btnRect.top - rippleSize / 2,
      size: rippleSize,
    });
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      ref={(el) => {
        // Cleanup if needed
      }}
    >
      <span className="relative inline-flex items-center px-4 py-2">{children}</span>
      {ripple && (
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            animation: 'ripple 0.6s ease-out',
          }}
        >
          <style jsx>{`
            @keyframes ripple {
              to {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
              }
            }
          `}</style>
        </span>
      )}
    </button>
  );
}