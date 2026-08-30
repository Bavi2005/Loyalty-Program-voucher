// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout';
import { Field, Button, Alert } from '../components/ui';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError('');
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.response?.data?.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track your points, upload receipts and unlock rewards."
      headline="Loyalty that keeps customers coming back."
      brandPoints={[
        'Upload receipts and earn points instantly',
        'Redeem vouchers the moment they unlock',
        'Watch your progress toward the next reward',
      ]}
      footer={
        <div className="mt-10 space-y-3 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Create one
            </Link>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Are you staff?{' '}
            <Link to="/admin/login" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
              Admin portal
            </Link>
          </p>
        </div>
      }
    >
      {authError && <Alert>{authError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Field
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={loading} loadingText="Signing in…">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
