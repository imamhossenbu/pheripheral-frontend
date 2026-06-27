/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  inventoryLogService,
  InventoryLog,
  DeviceItem,
} from "@/lib/api/inventoryApi";
import {
  Loader2,
  Plus,
  X,
  FileText,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Create Modal ──────────────────────────────────────────────────────────────

function CreateLogModal({
  devices,
  onClose,
  onCreated,
}: {
  devices: DeviceItem[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [deviceId, setDeviceId] = useState(devices[0]?.id ?? "");
  const [action, setAction] = useState("Verification");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    if (!deviceId || !action.trim()) return;
    startTransition(async () => {
      try {
        await inventoryLogService.create({
          deviceId,
          action: action.trim(),
          remarks: remarks.trim() || undefined,
        });
        toast.success("Audit log recorded");
        onCreated();
        onClose();
      } catch (err: any) {
        toast.error(err.message || "Failed to save log");
      }
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Manual Audit Entry
                </h2>
                <p className="text-xs text-slate-400">
                  Record a verification or maintenance log
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" /> Device
              </label>
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-colors"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.serialNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Action <span className="text-red-400">*</span>
              </label>
              <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. Maintenance inspection"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Remarks
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes about this log entry..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !deviceId || !action.trim()}
              className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Action Badge ──────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  verification: "bg-orange-50 text-orange-600 border-orange-200",
  maintenance: "bg-amber-50  text-amber-600  border-amber-200",
  creation: "bg-emerald-50 text-emerald-600 border-emerald-200",
  deployment: "bg-blue-50   text-blue-600   border-blue-200",
  retired: "bg-slate-100 text-slate-500  border-slate-200",
};

function ActionBadge({ action }: { action: string }) {
  const key = action.toLowerCase().split(" ")[0];
  const cls =
    ACTION_COLORS[key] ?? "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}
    >
      {action}
    </span>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────

interface Props {
  initialLogs: InventoryLog[];
  initialMeta: { page: number; totalPages: number; total: number };
  devices: DeviceItem[];
}

export function LogsClient({ initialLogs, initialMeta, devices }: Props) {
  const [logs, setLogs] = useState(initialLogs);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [deviceIdFilter, setDeviceIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async (p = page) => {
    setLoading(true);
    try {
      const res = await inventoryLogService.getAll({
        page: p,
        deviceId: deviceIdFilter || undefined,
        action: actionFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      toast.error(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page, deviceIdFilter, actionFilter, startDate, endDate]);

  const hasFilters = !!(deviceIdFilter || actionFilter || startDate || endDate);

  const resetFilters = () => {
    setDeviceIdFilter("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400">
              Device
            </label>
            <select
              value={deviceIdFilter}
              onChange={(e) => {
                setDeviceIdFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 min-w-[180px]"
            >
              <option value="">All devices</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.serialNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400">
              Action
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Maintenance"
                className="pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-300 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 w-[160px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
            />
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 self-end"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <p className="text-xs text-slate-400">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No logs found</p>
            <p className="text-xs text-slate-300 mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Device", "Action", "Remarks", "Performed At"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 ${i === 3 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      {log.device ? (
                        <div>
                          <p className="font-semibold text-slate-800">
                            {log.device.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {log.device.serialNumber}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">
                          Deleted device
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      {log.remarks ? (
                        <span
                          className="text-xs text-slate-500 truncate block"
                          title={log.remarks}
                        >
                          {log.remarks}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-slate-400">
                        {new Date(log.performedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Page {meta.page} of {meta.totalPages} &middot;{" "}
              <span className="font-medium text-slate-600">
                {meta.total} entries
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <CreateLogModal
          devices={devices}
          onClose={() => setModalOpen(false)}
          onCreated={() => fetchLogs(1)}
        />
      )}

      {/* FAB — fixed bottom right */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-200 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Record Log
      </button>
    </div>
  );
}
