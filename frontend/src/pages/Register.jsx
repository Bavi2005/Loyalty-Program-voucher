// frontend/src/pages/Register.jsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout';
import { Field, Button, Alert } from '../components/ui';

const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError('');
    try {
      const { confirmPassword, ...userData } = data;
      await authRegister(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join LoyaltyPro in seconds — no fees, no cards, just rewards."
      headline="Turn every purchase into progress."
      brandPoints={[
        'Sign up and get your first bonus voucher',
        'Snap receipts — we handle the points',
        'Exclusive rewards for loyal members',
      ]}
      footer={
        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Sign in
          </Link>
        </p>
      }
    >
      {authError && <Alert>{authError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          label="Phone (optional)"
          type="tel"
          placeholder="+1 555 000 0000"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Field
            id="confirmPassword"
            label="Confirm"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
        <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
          Use at least 6 characters. A mix of letters and numbers works best.
        </p>
        <Button type="submit" loading={loading} loadingText="Creating account…">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
