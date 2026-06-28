// app/staff/borrow-requests/page.tsx — Server Component

import Link from 'next/link';
import { fetchBorrows, BorrowQueryParams, BorrowStatus,
  BORROW_STATUS_LABEL, BORROW_STATUS_BADGE, formatDate } from '@/lib/staff/borrow-api';
import { BorrowModal } from '@/components/staff/borrow-requests/BorrowModal';

interface PageProps {
  searchParams: { page?: string; status?: string; modal?: string };
}

function StatusTabs({ active }: { active: string }) {
  const tabs = [
    { value: '', label: 'All' },
    { value: 'PENDING',  label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'RETURNED', label: 'Returned' },
  ];
  return (
    <form method="GET" className="flex items-center gap-1 flex-wrap">
      {tabs.map(t => (
        <button key={t.value} name="status" value={t.value} type="submit"
          className={`btn btn-sm ${active === t.value ? 'btn-primary' : 'btn-ghost'}`}>
          {t.label}
        </button>
      ))}
    </form>
  );
}

export default async function BorrowRequestsPage({ searchParams }: PageProps) {
  const params: BorrowQueryParams = {
    page:  searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: 15,
    ...(searchParams.status && { status: searchParams.status as BorrowStatus }),
  };

  const { data: borrows, meta } = await fetchBorrows(params);
  const pendingCount = borrows.filter(b => b.status === 'PENDING').length;

  const modalHref = (id: string) => {
    const p = new URLSearchParams({ ...(searchParams.status ? { status: searchParams.status! } : {}), modal: id });
    return `/staff/borrow-requests?${p}`;
  };

  return (
    <div className="dashboard-content">
      <div className="max-w-[1100px] mx-auto space-y-6">

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-overline mb-2 block">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)] inline-block" />
              Staff Panel
            </span>
            <h1 className="text-heading-xl">Borrow Requests</h1>
            <p className="text-body mt-1">Review and manage device borrow requests.</p>
          </div>
          {pendingCount > 0 && (
            <div className="alert alert-warning self-start py-2 px-3 mt-1">
              <span className="font-semibold">{pendingCount} pending review</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { tag:'BRW-TOT', label:'Total',    value: meta.total,                                            dot:'bg-[var(--color-text-muted)]' },
            { tag:'BRW-PND', label:'Pending',  value: borrows.filter(b=>b.status==='PENDING').length,        dot:'status-dot-warning' },
            { tag:'BRW-APR', label:'Approved', value: borrows.filter(b=>b.status==='APPROVED').length,       dot:'status-dot-success' },
            { tag:'BRW-RET', label:'Returned', value: borrows.filter(b=>b.status==='RETURNED').length,       dot:'bg-[var(--color-info-500)]' },
          ] as const).map(s => (
            <div key={s.tag} className="stat-card glow-border-top">
              <div className="flex items-center justify-between mb-3">
                <span className="tag-code">{s.tag}</span>
                <span className={`status-dot ${s.dot}`} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card card-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-surface-300)] flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-heading-sm">Requests</h2>
              <span className="badge badge-muted">{meta.total}</span>
            </div>
            <StatusTabs active={searchParams.status ?? ''} />
          </div>

          <div className="table-wrap border-0 rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Device</th><th>Student</th><th>Period</th>
                  <th>Status</th><th>Reason</th><th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {borrows.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16">
                    <span className="tag-code text-base px-4 py-2 block w-fit mx-auto mb-3">BRW-000</span>
                    <p className="text-[var(--color-text-muted)]">No requests found</p>
                  </td></tr>
                ) : borrows.map(b => {
                  const name = [b.user.firstName, b.user.lastName].filter(Boolean).join(' ') || b.user.email;
                  const isPending = b.status === 'PENDING';
                  return (
                    <tr key={b.id} className={isPending ? 'bg-[var(--color-warning-50)]' : ''}>
                      <td>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">{b.device.name}</p>
                          <p className="text-caption">{b.device.brand}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
                          {b.user.department && <p className="text-caption">{b.user.department}</p>}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <span>{formatDate(b.startDate)}</span>
                          <span className="text-caption mx-1">→</span>
                          <span>{formatDate(b.endDate)}</span>
                        </div>
                      </td>
                      <td><span className={BORROW_STATUS_BADGE[b.status]}>{BORROW_STATUS_LABEL[b.status]}</span></td>
                      <td>
                        <p className="text-sm text-[var(--color-text-secondary)] truncate max-w-[160px]" title={b.reason}>
                          {b.reason}
                        </p>
                      </td>
                      <td className="text-right">
                        <Link href={modalHref(b.id)} className={`btn btn-xs ${isPending ? 'btn-primary' : 'btn-ghost'}`}>
                          {isPending ? 'Review' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {searchParams.modal && <BorrowModal borrowId={searchParams.modal} />}
    </div>
  );
}