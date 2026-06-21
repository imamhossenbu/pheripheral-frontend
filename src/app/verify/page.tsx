'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailHandler({ setStatusText, setSuccess }: { 
  setStatusText: (text: string) => void;
  setSuccess: (val: boolean | null) => void;
}) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatusText('No verification token provided.');
      setSuccess(false);
      return;
    }

    let isSubscribed = true;
    
    const verifyToken = async () => {
      try {
        const res = await fetchAPI(`/auth/verify?token=${token}`);
        if (isSubscribed) {
          setStatusText(res.message || 'Email verified successfully!');
          setSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (err: any) {
        if (isSubscribed) {
          setStatusText(err.message || 'Verification failed. The token may be expired or invalid.');
          setSuccess(false);
        }
      }
    };

    verifyToken();

    return () => {
      isSubscribed = false;
    };
  }, [token, router, setStatusText, setSuccess]);

  return null;
}

export default function VerifyPage() {
  const [statusText, setStatusText] = useState('Verifying your email token...');
  const [success, setSuccess] = useState<boolean | null>(null);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-brand-pale/20 dark:bg-brand-dark/10 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--brand-light),transparent_50%)] opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/30 shadow-2xl rounded-2xl p-8 backdrop-blur-md relative z-10 text-center"
      >
        <div className="flex flex-col items-center mb-6">
          {success === null && (
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
          {success === true && (
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/10">
              <ShieldCheck className="w-9 h-9" />
            </div>
          )}
          {success === false && (
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/10">
              <ShieldAlert className="w-9 h-9" />
            </div>
          )}
          
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-white">
            Email Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {statusText}
          </p>
        </div>

        <Suspense fallback={null}>
          <VerifyEmailHandler setStatusText={setStatusText} setSuccess={setSuccess} />
        </Suspense>

        {success !== null && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-brand-blue hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </motion.div>
    </main>
  );
}
