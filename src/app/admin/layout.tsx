'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Monitor, 
  FolderTree, 
  Users, 
  History,
  Lock,
  Loader2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Analytics Stats', href: '/admin', icon: LayoutDashboard },
    { name: 'Devices CRUD', href: '/admin/devices', icon: Monitor },
    { name: 'Category Tree', href: '/admin/categories', icon: FolderTree },
    { name: 'User Directory', href: '/admin/users', icon: Users },
    { name: 'Audit Logs', href: '/admin/logs', icon: History },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e1a]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-blue mx-auto" />
          <p className="text-sm text-gray-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Double check role guard
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e1a] px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-red-200 dark:border-red-950/20 p-8 rounded-2xl text-center shadow-xl space-y-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-sm text-gray-500">You must be logged in as an Administrator to view these panels.</p>
          <Link href="/" className="inline-block text-xs font-bold text-brand-blue hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row lg:space-x-8">
        
        {/* Admin Sidebar Navigation */}
        <aside className="w-full lg:w-60 shrink-0 mb-6 lg:mb-0">
          <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-4 shadow-sm space-y-1">
            <div className="px-3 py-2 text-xxs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 mb-3">
              Management
            </div>
            
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/10'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-brand-pale/20 dark:hover:bg-gray-800/40 hover:text-brand-dark dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Admin Page Content */}
        <section className="flex-1 min-w-0">
          {children}
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
