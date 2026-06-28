'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { waiveFine, FineStatus } from '@/lib/staff/misc-api';

export function WaiveAction({ fineId, status }: { fineId: string; status: FineStatus }) {
  const router = useRouter();
  const [open, setOpen]     = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  if (status !== 'UNPAID') return null;

  const submit = async () => {
    if (!reason.trim()) { setErr('Reason is required.'); return; }
    setLoading(true); setErr(null);
    try {
      await waiveFine(fineId, { reason });
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to waive fine.');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative">
      <button className="btn btn-ghost btn-xs" onClick={() => setOpen(o => !o)}>
        Waive
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-64 card p-3 shadow-[var(--shadow-modal)] space-y-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Waive this fine?</p>
          {err && <p className="text-xs text-[var(--color-danger-500)]">{err}</p>}
          <textarea
            className="input resize-none text-sm"
            rows={2}
            placeholder="Reason for waiving…"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-xs flex-1" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-xs flex-1" onClick={submit} disabled={loading}>
              {loading ? '…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}