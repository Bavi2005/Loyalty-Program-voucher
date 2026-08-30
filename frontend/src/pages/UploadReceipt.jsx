// frontend/src/pages/UploadReceipt.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { useToast, PageHeader, btnGhost, btnSmPrimary, inputCls, labelCls } from '../components/ui';

const UploadReceiptSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
});

export default function UploadReceipt() {
  const { refreshStats } = useUser();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(UploadReceiptSchema),
    mode: 'onChange',
  });

  const imageFile = watch('image');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('orderId', data.orderId);
      formData.append('purchaseDate', data.purchaseDate);
      formData.append('amount', data.amount);
      formData.append('receipt', imageFile);

      await axios.post(`/api/user/receipts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('Receipt submitted! It is now pending review.');
      reset();
      setPreview(null);
      await refreshStats();
      setTimeout(() => navigate('/receipt-history'), 1200);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <PageHeader
        title="Upload Receipt"
        subtitle="Submit a purchase receipt for admin validation. New receipts start as PENDING."
        action={
          <button
            onClick={() => navigate('/receipt-history')}
            className={btnGhost}
          >
            View history
          </button>
        }
      />

      <div className="mx-auto max-w-2xl">
        <div className="card rounded-3xl p-8 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className={labelCls}>Order ID</label>
              <input
                {...register('orderId')}
                type="text"
                className={inputCls}
                placeholder="e.g. ORD-100245"
              />
              {errors.orderId && <p className="mt-1.5 text-[13px] font-medium text-rose-600">{errors.orderId.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Purchase Date</label>
              <input
                {...register('purchaseDate')}
                type="date"
                max={today}
                className={inputCls}
              />
              {errors.purchaseDate && <p className="mt-1.5 text-[13px] font-medium text-rose-600">{errors.purchaseDate.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Amount</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`${inputCls} pl-8`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="mt-1.5 text-[13px] font-medium text-rose-600">{errors.amount.message}</p>}
            </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Receipt File</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-14 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10">
                <svg className="h-14 w-14 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-4 text-[15px] text-gray-600 dark:text-slate-300">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-slate-500">JPEG, PNG, or PDF up to 5MB</p>
                <input {...register('image')} type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleImageChange} className="hidden" />
              </label>
              {errors.image && <p className="mt-1 text-sm text-rose-600">{errors.image.message}</p>}

              {preview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Preview</p>
                  {preview.startsWith('data:image') ? (
                    <img src={preview} alt="Receipt preview" className="max-h-56 rounded-xl border border-gray-200 object-contain" />
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                      PDF selected
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-8 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className={btnGhost}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={btnSmPrimary}
              >
                {loading ? 'Uploading…' : 'Submit Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
