// frontend/src/pages/AdminReceipts.jsx

import { useEffect, useState, useCallback } from 'react';
import { api as axios, uploadUrl } from '../api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAdmin } from '../contexts/AdminContext';
import { useToast, PageHeader, Badge, Spinner, EmptyState } from '../components/ui';
import AdminLayout from '../components/AdminLayout';
import confetti from 'canvas-confetti';

const FILTERS = ['PENDING', 'APPROVED', 'REJECTED'];

export default function AdminReceipts() {
  const { admin } = useAdmin();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [receipts, setReceipts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (status) params.append('status', status);
      if (search.trim()) params.append('search', search.trim());
      const { data } = await axios.get(`/api/admin/receipts?${params.toString()}`);
      setReceipts(data.receipts);
      setPagination(data.pagination);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, [page, status, search, toastError]);

  useEffect(() => {
    if (admin) load();
  }, [admin, load]);

  const act = async (id, action) => {
    setBusyId(id);
    setActionError('');
    try {
      await axios.post(`/api/admin/receipts/${id}/${action}`);
      success(`Receipt ${action === 'approve' ? 'approved — voucher issued' : 'rejected'}`);
      if (action === 'approve') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
      }
      await load();
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      let friendly;
      if (status === 404 || !status) {
        friendly = `Cannot reach the API. This page is hosted on GitHub Pages (static), so there's no live backend here. Run the app locally (node proxy.js) or deploy a backend and set VITE_API_URL.`;
      } else if (status === 403) {
        friendly = 'Admin access denied — please log in again at /admin/login.';
      } else {
        friendly = serverMsg || `Failed to ${action} receipt.`;
      }
      setActionError(friendly);
      toastError(`Failed to ${action}`, friendly);
    } finally {
      setBusyId(null);
    }
  };

  const imageSrc = (r) => uploadUrl(r.imageUrl);

  return (
    <AdminLayout>
      <PageHeader
        title="Receipt Validation"
        subtitle="Review submissions and approve to issue vouchers"
        action={
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Dashboard
          </button>
        }
      />

      {actionError && (
        <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} aria-label="Dismiss" className="text-rose-500 hover:text-rose-700">✕</button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search order ID, name, email…"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-gray-100">
          <button
            onClick={() => { setStatus(''); setPage(1); }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${!status ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            All
          </button>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setStatus(f); setPage(1); }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${status === f ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>
      ) : receipts.length === 0 ? (
        <EmptyState icon="🧾" title="No receipts found" description="Try adjusting the filters or search." />
      ) : (
        <>
          <div className="space-y-4">
            {receipts.map((r) => (
              <div key={r.id} className="card card-hover rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {imageSrc(r) && /\.(jpe?g|png)$/i.test(imageSrc(r)) ? (
                      <a href={imageSrc(r)} target="_blank" rel="noreferrer">
                        <img src={imageSrc(r)} alt="receipt" className="h-14 w-14 rounded-xl border border-gray-200 object-cover" />
                      </a>
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-xl">🧾</div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{r.orderId}</p>
                      <p className="text-sm text-gray-500">{r.user?.name || r.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${Number(r.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{format(new Date(r.submittedAt), 'MMM d, yyyy')}</p>
                    </div>
                    <Badge status={r.status}>{r.status}</Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                  {r.imageUrl && (
                    <a
                      href={imageSrc(r)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-gray-100"
                    >
                      View file
                    </a>
                  )}
                  {r.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => act(r.id, 'approve')}
                        disabled={busyId === r.id}
                        className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60"
                      >
                        {busyId === r.id ? 'Working…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => act(r.id, 'reject')}
                        disabled={busyId === r.id}
                        className="rounded-lg border border-rose-200 px-4 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">
                      {r.status === 'APPROVED' ? 'Voucher issued' : 'Rejected' }
                      {r.voucher && (
                        <span className="ml-2 font-mono text-gray-500">({r.voucher.code})</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {receipts.length} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 py-1.5">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
