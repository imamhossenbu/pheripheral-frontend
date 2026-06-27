'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Loader2, 
  Plus, 
  X, 
  Calendar, 
  FileText,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DeviceItem {
  id: string;
  name: string;
  serialNumber: string;
}

interface InventoryLog {
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
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Query Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deviceIdFilter, setDeviceIdFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Manual Log Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [action, setAction] = useState('Verification');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDevicesDropdown = async () => {
    try {
      const res = await fetchAPI('/devices?limit=200');
      setDevices(res.data || []);
      if (res.data?.length > 0) {
        setDeviceId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogsList = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=12`;
      if (deviceIdFilter) query += `&deviceId=${deviceIdFilter}`;
      if (actionFilter) query += `&action=${encodeURIComponent(actionFilter)}`;
      if (startDate) query += `&startDate=${new Date(startDate).toISOString()}`;
      if (endDate) query += `&endDate=${new Date(endDate).toISOString()}`;

      const res = await fetchAPI(`/inventory-logs${query}`);
      setLogs(res.data || res || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to retrieve inventory logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevicesDropdown();
  }, []);

  useEffect(() => {
    fetchLogsList();
  }, [page, deviceIdFilter, actionFilter, startDate, endDate]);

  const handleCreateManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !action) return;

    setIsSubmitting(true);
    try {
      await fetchAPI('/inventory-logs', {
        method: 'POST',
        data: {
          deviceId,
          action,
          remarks: remarks || undefined
        }
      });
      toast.success('Inventory log recorded successfully!');
      setIsOpen(false);
      setRemarks('');
      setPage(1);
      fetchLogsList();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit inventory log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setDeviceIdFilter('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            Inventory Audit Logs
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Browse automated system event logs and manually record verification logs.
          </p>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-blue hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-brand-blue/15 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Audit log</span>
        </button>
      </div>

      {/* Query Filters */}
      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        {/* Device ID Filter */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-500">Device ID Filter</label>
          <select
            value={deviceIdFilter}
            onChange={(e) => {
              setDeviceIdFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Devices</option>
            {devices.map(dev => (
              <option key={dev.id} value={dev.id}>{dev.name} ({dev.serialNumber})</option>
            ))}
          </select>
        </div>

        {/* Action filter */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-500">Action Keyword</label>
          <input
            type="text"
            placeholder="e.g. Creation, Maintenance..."
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-500">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-500">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none"
          />
        </div>

      </div>

      {/* Audit Logs table list */}
      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <span className="text-xs text-gray-400">Loading audit history timeline...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-gray-400 italic">
            No audit logs registered under these queries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-gray-50 dark:bg-gray-900/10">
                  <th className="p-4">Device Reference</th>
                  <th className="p-4">Action Taken</th>
                  <th className="p-4">Remarks &amp; Notes</th>
                  <th className="p-4 text-right">Performed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      {log.device ? (
                        <>
                          <p className="font-extrabold text-brand-dark dark:text-white text-sm">{log.device.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">SN: {log.device.serialNumber}</p>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Deleted Asset</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-brand-blue/5 text-brand-blue font-bold rounded text-[10px] tracking-wider uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 italic text-gray-400 max-w-xs truncate" title={log.remarks || ''}>
                      {log.remarks || '—'}
                    </td>
                    <td className="p-4 text-right text-gray-400">
                      {new Date(log.performedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Audit Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 shadow-2xl rounded-2xl overflow-hidden relative z-10 flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10">
                <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-brand-blue" />
                  <span>Manual Audit Entry</span>
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualLog} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5 flex items-center">
                    <Monitor className="w-3.5 h-3.5 mr-1" />
                    <span>Select Target Device</span>
                  </label>
                  <select
                    required
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    {devices.map(dev => (
                      <option key={dev.id} value={dev.id}>{dev.name} ({dev.serialNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Action Taken</label>
                  <input
                    type="text"
                    required
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g. Maintenance inspection, Software patch"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Remarks / Details</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Cleared hardware diagnostics, verified status AVAILABLE."
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-blue hover:bg-brand-dark text-white rounded-xl font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Audit Entry</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
