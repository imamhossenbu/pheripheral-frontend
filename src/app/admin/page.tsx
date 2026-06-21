'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Users, 
  Monitor, 
  Layers, 
  DollarSign, 
  Loader2, 
  History, 
  UserPlus, 
  TrendingUp, 
  CircleDot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardStats {
  counts: {
    users: number;
    devices: number;
    categories: number;
  };
  usersByRole: {
    ADMIN: number;
    EDITOR: number;
    VIEWER: number;
  };
  devicesByStatus: {
    AVAILABLE: number;
    IN_MAINTENANCE: number;
    DEPLOYED: number;
    RETIRED: number;
  };
  totalInventoryValue: number;
  recentLogs: Array<{
    id: string;
    deviceId: string;
    action: string;
    remarks: string | null;
    performedAt: string;
    device: {
      id: string;
      name: string;
      serialNumber: string;
    };
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/admin/dashboard');
      setStats(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
        <span className="text-sm text-gray-500">Loading dashboard analytics...</span>
      </div>
    );
  }

  if (!stats) return null;

  // Custom charts colors matching the palette:
  // 293681 (dark blue), 4274D9 (royal blue), 95CCDD (light blue), D0E7E6 (pale teal)
  const colors = ['#4274D9', '#95CCDD', '#293681', '#D0E7E6'];

  // Format status data for Bar chart
  const deviceStatusData = [
    { name: 'Available', value: stats.devicesByStatus.AVAILABLE },
    { name: 'Maintenance', value: stats.devicesByStatus.IN_MAINTENANCE },
    { name: 'Deployed', value: stats.devicesByStatus.DEPLOYED },
    { name: 'Retired', value: stats.devicesByStatus.RETIRED },
  ];

  // Format user role data for Pie chart
  const userRoleData = [
    { name: 'Viewer', value: stats.usersByRole.VIEWER },
    { name: 'Editor', value: stats.usersByRole.EDITOR },
    { name: 'Admin', value: stats.usersByRole.ADMIN },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          High-level inventory metrics, assets lifecycle distributions, and audit trails.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm flex items-center space-x-4"
        >
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Inventory Value</p>
            <h3 className="text-xl font-extrabold text-brand-dark dark:text-white mt-1">
              ${stats.totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm flex items-center space-x-4"
        >
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Active Devices</p>
            <h3 className="text-xl font-extrabold text-brand-dark dark:text-white mt-1">
              {stats.counts.devices}
            </h3>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm flex items-center space-x-4"
        >
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Total Users</p>
            <h3 className="text-xl font-extrabold text-brand-dark dark:text-white mt-1">
              {stats.counts.users}
            </h3>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm flex items-center space-x-4"
        >
          <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Categories</p>
            <h3 className="text-xl font-extrabold text-brand-dark dark:text-white mt-1">
              {stats.counts.categories}
            </h3>
          </div>
        </motion.div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Bar Chart - Device Status */}
        <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm">
          <h4 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <CircleDot className="w-4.5 h-4.5 text-brand-blue" />
            <span>Devices by Status</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceStatusData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(66, 116, 217, 0.05)' }}
                  contentStyle={{ background: '#111827', border: '1px solid #293681', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - User Roles */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm flex flex-col">
          <h4 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Users className="w-4.5 h-4.5 text-brand-blue" />
            <span>Users by Role</span>
          </h4>
          <div className="h-44 flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #293681', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Pie Legends */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
            {userRoleData.map((item, idx) => (
              <div key={item.name} className="text-xxs">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="font-semibold text-gray-500">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recents Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent Audit Logs */}
        <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-brand-blue" />
            <h4 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider">
              Recent Inventory logs
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Device</th>
                  <th className="py-2.5">Action</th>
                  <th className="py-2.5">Remarks</th>
                  <th className="py-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                {stats.recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 font-semibold text-brand-dark dark:text-white">
                      {log.device.name}
                    </td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 bg-brand-blue/5 text-brand-blue font-bold rounded text-[10px] tracking-wider uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 italic text-gray-400">
                      {log.remarks || '—'}
                    </td>
                    <td className="py-3 text-right text-xxs text-gray-400">
                      {new Date(log.performedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-brand-blue" />
            <h4 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider">
              Recent Registered Users
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                {stats.recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 font-semibold text-brand-dark dark:text-white">
                      {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Guest'}
                    </td>
                    <td className="py-3 font-mono">{u.email}</td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold rounded text-[10px] tracking-wider uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xxs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
