'use client';

import React from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Boxes, ClipboardList, CreditCard, FolderTree, History, LayoutDashboard } from 'lucide-react';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { name: 'Editor Home', href: '/editor', icon: LayoutDashboard },
    { name: 'Devices', href: '/editor/devices', icon: Boxes },
    { name: 'Categories', href: '/editor/categories', icon: FolderTree },
    { name: 'Orders', href: '/editor/orders', icon: ClipboardList },
    { name: 'Payments', href: '/editor/payments', icon: CreditCard },
    { name: 'Audit Logs', href: '/editor/logs', icon: History },
  ];

  return (
    <DashboardShell role="EDITOR" title="Editor Dashboard" menuItems={menuItems}>
      {children}
    </DashboardShell>
  );
}
