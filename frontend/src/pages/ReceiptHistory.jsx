// frontend/src/pages/ReceiptHistory.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { useToast, PageHeader, Badge, Spinner, EmptyState } from '../components/ui';

function ReceiptRow({ receipt, expandedId, setExpandedId }) {
  const isExpanded = expandedId === receipt.id;
  const imageSrc = receipt.imageUrl ? `/uploads/${receipt.imageUrl.split('/').pop()}` : null;
  const isImage = imageSrc && /\.(jpe?g|png)$/i.test(imageSrc);

  return (
    <>
      <tr className="border-t border-gray-100 transition hover:bg-gray-50">
        <td className="px-5 py-4 text-sm font-medium text-gray-900">{receipt.orderId}</td>
        <td className="px-5 py-4 text-sm text-gray-500">{format(new Date(receipt.purchaseDate), 'MMM d, yyyy')}</td>
        <td className="px-5 py-4 text-sm font-semibold text-gray-900">${Number(receipt.amount).toFixed(2)}</td>
        <td className="px-5 py-4"><Badge status={receipt.status}>{receipt.status}</Badge></td>
        <td className="px-5 py-4 text-sm text-gray-500">{format(new Date(receipt.submittedAt), 'MMM d, yyyy')}</td>
        <td className="px-5 py-4">
          <button
            onClick={() => setExpandedId(isExpanded ? null : receipt.id)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {isExpanded ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-indigo-50/40">
          <td colSpan={6} className="px-5 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Detail label="Order ID" value={receipt.orderId} />
                <Detail label="Purchase Date" value={format(new Date(receipt.purchaseDate), 'MMM d, yyyy')} />
                <Detail label="Amount" value={`$${Number(receipt.amount).toFixed(2)}`} />
                <Detail label="Submitted" value={format(new Date(receipt.submittedAt), 'MMM d, yyyy h:mm a')} />
                {imageSrc && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Receipt</p>
                    {isImage ? (
                      <a href={imageSrc} target="_blank" rel="noreferrer">
                        <img src={imageSrc} alt="Receipt" className="mt-1 max-h-48 rounded-xl border border-gray-200 object-contain" />
                      </a>
                    ) : (
                      <a href={imageSrc} target="_blank" className="text-sm font-medium text-indigo-600 hover:underline">
                        Download receipt file
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div>
                {receipt.voucher ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <h4 className="font-semibold text-emerald-800">Voucher Generated</h4>
                    <p className="mt-1 text-sm text-emerald-700">
                      Code: <span className="font-mono font-semibold">{receipt.voucher.code}</span>
                    </p>
                    <p className="text-sm text-emerald-700">
                      Issued: {format(new Date(receipt.voucher.issuedAt), 'MMM d, yyyy')}
                    </p>
                    {receipt.voucher.expiresAt && (
                      <p className="text-sm text-emerald-700">
                        Expires: {format(new Date(receipt.voucher.expiresAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                    {receipt.status === 'PENDING'
                      ? 'Awaiting admin review. A voucher will appear here once approved.'
                      : 'No voucher was issued for this receipt.'}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

export default function ReceiptHistory() {
  const { receipts, loading, error, fetchReceipts } = useUser();
  const { error: toastError } = useToast();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  useEffect(() => {
    if (error) toastError(error);
  }, [error, toastError]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Receipt History"
        subtitle="All your submitted receipts and their review status"
        action={
          <button
            onClick={() => navigate('/upload-receipt')}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700"
          >
            Upload Receipt
          </button>
        }
      />

      {receipts.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No receipts yet"
          description="Submit your first purchase receipt to start earning vouchers."
          action={
            <button
              onClick={() => navigate('/upload-receipt')}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700"
            >
              Upload Receipt
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700/60">
              <thead>
                <tr className="bg-gray-50/70 dark:bg-slate-900/40">
                  {['Order ID', 'Purchase Date', 'Amount', 'Status', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {receipts.map((r) => (
                  <ReceiptRow key={r.id} receipt={r} expandedId={expandedId} setExpandedId={setExpandedId} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
