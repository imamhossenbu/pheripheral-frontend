'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const res = await fetchAPI('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      toast.success(res.message || 'Reset link sent to your email.');
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to request reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface-100 relative overflow-hidden p-6">
      {/* Background Decor */}
      <div className="absolute w-[500px] h-[500px] bg-brand-200 rounded-full blur-[120px] opacity-30 -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-accent-300 rounded-full blur-[120px] opacity-20 -bottom-20 -right-20" />

      {/* Card with Glass Effect */}
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
          <h1 className="text-2xl font-bold text-text-primary">Forgot Password</h1>
          <p className="text-text-muted mt-2 text-center text-sm">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center p-6 bg-brand-50 border border-brand-100 rounded-2xl text-sm text-text-secondary">
            Check your inbox! We've sent a reset link to your email address.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}