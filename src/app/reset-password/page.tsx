'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing or invalid reset token.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchAPI(`/auth/reset-password?token=${token}`, {
        method: 'POST',
        data: { password },
      });
      toast.success(res.message || 'Password reset successfully.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6">
        <p className="text-danger-500 font-medium">Invalid or missing token.</p>
        <Link href="/login" className="text-brand-600 font-bold hover:underline block mt-4">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface-100 relative overflow-hidden p-6">
      {/* Background Decor */}
      <div className="absolute w-[500px] h-[500px] bg-brand-200 rounded-full blur-[120px] opacity-30 -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-accent-300 rounded-full blur-[120px] opacity-20 -bottom-20 -right-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl relative z-10"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Reset Password</h1>
          <p className="text-text-muted mt-2 text-center text-sm">
            Please enter your new strong password below.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </main>
  );
}