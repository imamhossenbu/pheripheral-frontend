'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        department: department || undefined,
      });
    } catch (err: any) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface-100 relative overflow-hidden p-6">
      {/* Background Decorations */}
      <div className="absolute w-[500px] h-[500px] bg-brand-200 rounded-full blur-[120px] opacity-30 -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-accent-300 rounded-full blur-[120px] opacity-20 -bottom-20 -right-20" />

      {/* Registration Card with Glass Effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-muted mt-2">Join Periphex to manage your assets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">Department</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="Engineering"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-secondary ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="email"
                required
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 py-3 rounded-xl border border-surface-300 bg-surface-0/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 mt-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </main>
  );
}