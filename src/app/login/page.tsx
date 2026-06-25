'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface-100 relative overflow-hidden p-6">
      {/* Background Decor */}
      <div className="absolute w-[500px] h-[500px] bg-brand-200 rounded-full blur-[120px] opacity-30 -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-accent-300 rounded-full blur-[120px] opacity-20 -bottom-20 -right-20" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl relative z-10"
      >
        {/* Back to Home inside card */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand-600 transition-colors mb-6"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">Sign in</h1>
          <p className="text-text-muted mt-2">Welcome back to Periphex</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Forgot Password moved above button */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link href="/register" className="text-brand-600 font-semibold hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </main>
  );
}