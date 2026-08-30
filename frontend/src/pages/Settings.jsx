// frontend/src/pages/Settings.jsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useToast, PageHeader, Field, btnSmPrimary } from '../components/ui';

const SettingsSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    confirmNewPassword: z.string().optional(),
  })
  .refine((d) => !d.newPassword || d.newPassword === d.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

export default function Settings() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(SettingsSchema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updateData = { name: data.name, email: data.email, phone: data.phone };
      if (data.currentPassword && data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      await axios.put(`/api/user/profile`, updateData);
      success('Profile updated successfully!');
      setValue('currentPassword', '');
      setValue('newPassword', '');
      setValue('confirmNewPassword', '');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Account Settings"
        subtitle="Keep your details up to date so your rewards always reach the right person."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-8">
        <section className="card rounded-3xl p-8 sm:p-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            This is how we greet you across the app.
          </p>

          <div className="mt-8 space-y-6">
            <Field
              id="name"
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Field
              id="phone"
              label="Phone number"
              type="tel"
              placeholder="+1 555 000 0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </section>

        <section className="card rounded-3xl p-8 sm:p-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change password</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Leave these blank to keep your current password.
          </p>

          <div className="mt-8 space-y-6">
            <Field
              id="currentPassword"
              label="Current password"
              type="password"
              placeholder="••••••••"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field
                id="newPassword"
                label="New password"
                type="password"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <Field
                id="confirmNewPassword"
                label="Confirm new password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmNewPassword?.message}
                {...register('confirmNewPassword')}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pb-4">
          <button type="submit" disabled={loading} className={btnSmPrimary}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
