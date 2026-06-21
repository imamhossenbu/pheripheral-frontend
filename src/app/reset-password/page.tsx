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
        body: JSON.stringify({ password }),
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
        <p className="text-red-500 font-medium">Invalid or missing password reset token.</p>
        <Link href="/login" className="text-brand-blue font-bold hover:underline block mt-4">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          New Password (Min 6 chars)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Lock className="w-5 h-5" />
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Confirm New Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Lock className="w-5 h-5" />
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-blue hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-blue/20 hover:shadow-brand-dark/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span>Reset Password</span>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-brand-pale/20 dark:bg-brand-dark/10 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--brand-light),transparent_50%)] opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/30 shadow-2xl rounded-2xl p-8 backdrop-blur-md relative z-10"
      >
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-semibold text-brand-blue hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-white text-center">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Establish a new, strong password for your account.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </main>
  );
}
