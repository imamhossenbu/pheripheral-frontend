'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  UserCheck, 
  ShieldAlert as ShieldIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserItem {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isVerified, setIsVerified] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (role) query += `&role=${role}`;
      if (isVerified !== '') query += `&isVerified=${isVerified}`;

      const res = await fetchAPI(`/users${query}`);
      setUsers(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [page, role, isVerified]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsersList();
  };

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    setUpdatingUserId(userId);
    try {
      await fetchAPI(`/users/${userId}`, {
        method: 'PATCH',
        data: { role: newRole },
      });
      toast.success('User role updated!');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    try {
      const nextStatus = !currentStatus;
      await fetchAPI(`/users/${userId}`, {
        method: 'PATCH',
        data: { isVerified: nextStatus },
      });
      toast.success(nextStatus ? 'User verified successfully!' : 'User marked unverified.');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: nextStatus } : u));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user verification.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this user account?')) return;
    try {
      await fetchAPI(`/users/${userId}`, { method: 'DELETE' });
      toast.success('User account removed!');
      fetchUsersList();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">
          User Directory &amp; RBAC
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Monitor directory users, toggle verification parameters, and scale security access controls.
        </p>
      </div>

      {/* Query Filters */}
      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search email, name, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-3" />
        </form>

        {/* Role Filter */}
        <div className="w-full md:w-44">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>

        {/* Verification Filter */}
        <div className="w-full md:w-44">
          <select
            value={isVerified}
            onChange={(e) => {
              setIsVerified(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Statuses</option>
            <option value="true">Verified Users</option>
            <option value="false">Unverified Users</option>
          </select>
        </div>

      </div>

      {/* Users Datatable */}
      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <span className="text-xs text-gray-400">Loading user directory database...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-gray-400 italic">
            No registered users matches discovered.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-gray-50 dark:bg-gray-900/10">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Role Access</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <p className="font-extrabold text-brand-dark dark:text-white text-sm">
                        {item.firstName || item.lastName ? `${item.firstName || ''} ${item.lastName || ''}`.trim() : 'Guest User'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Joined: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 font-mono text-gray-500">{item.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-semibold text-gray-500">
                        {item.department || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      {updatingUserId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                      ) : (
                        <select
                          value={item.role}
                          onChange={(e) => handleUpdateRole(item.id, e.target.value as any)}
                          className="text-xs p-1 bg-gray-50 dark:bg-[#1f2937] border border-gray-300 dark:border-gray-800 rounded-lg text-brand-dark dark:text-white outline-none"
                        >
                          <option value="VIEWER">Viewer (Read Only)</option>
                          <option value="EDITOR">Editor (Write)</option>
                          <option value="ADMIN">Admin (Root)</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVerification(item.id, item.isVerified)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wider uppercase border ${
                          item.isVerified 
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30' 
                            : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30'
                        }`}
                      >
                        {item.isVerified ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3" />
                            <span>Unverified</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        className="p-2 bg-red-50 dark:bg-red-950/10 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
