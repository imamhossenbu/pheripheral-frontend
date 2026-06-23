'use client';

import React from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Bell, ClipboardList, CreditCard, LayoutDashboard, User } from 'lucide-react';

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { name: 'Viewer Home', href: '/viewer', icon: LayoutDashboard },
    { name: 'My Orders', href: '/viewer/orders', icon: ClipboardList },
    { name: 'My Payments', href: '/viewer/payments', icon: CreditCard },
    { name: 'Notifications', href: '/viewer/notifications', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <DashboardShell role="VIEWER" title="Viewer Dashboard" menuItems={menuItems}>
      {children}
    </DashboardShell>
  );
}
