'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    router.replace(user.role === 'ADMIN' ? '/admin' : user.role === 'EDITOR' ? '/editor' : '/viewer');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-pale/5 dark:bg-[#080d19]">
      <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
    </div>
  );
}
