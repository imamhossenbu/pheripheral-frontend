'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function VerifyComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    if (!token) {
      setStatus('error');
      return;
    }

    const verifyEmail = async () => {
      try {

        await fetchAPI(`/auth/verify?token=${token}`, { method: 'GET' });
        setStatus('success');
        toast.success('Email verified successfully!');


        setTimeout(() => router.push('/login'), 3000);
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus('error');
        toast.error(err.message || 'Verification failed or link expired.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="text-center w-full">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-brand-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-text-primary">Verifying...</h2>
          <p className="text-text-muted mt-2">Please wait while we activate your account.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-text-primary">Email Verified!</h2>
          <p className="text-text-muted mt-2">Your account is now active. Redirecting to login...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-text-primary">Verification Failed</h2>
          <p className="text-text-muted mt-2">The link is invalid, expired, or already used.</p>
          <Link href="/login" className="mt-6 inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-all">
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface-100 relative overflow-hidden p-6">
      <div className="absolute w-[500px] h-[500px] bg-brand-200 rounded-full blur-[120px] opacity-30 -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-accent-300 rounded-full blur-[120px] opacity-20 -bottom-20 -right-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
            <Mail className="w-7 h-7" />
          </div>
        </div>


        <Suspense fallback={<div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
          <VerifyComponent />
        </Suspense>
      </motion.div>
    </main>
  );
}