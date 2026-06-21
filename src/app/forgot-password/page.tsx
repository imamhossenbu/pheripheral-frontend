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
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="text-center p-4 bg-brand-pale/10 border border-brand-pale dark:border-brand-dark/20 rounded-xl text-sm text-gray-600 dark:text-gray-300">
            A password reset email has been dispatched. Please review your inbox (and spam folder) for instructions.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
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
                <span>Request Reset Link</span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
