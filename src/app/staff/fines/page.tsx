// app/staff/fines/page.tsx — Server Component

import { WaiveAction } from '@/components/staff/fines/WaiveActions';
import { fetchFines, FineQueryParams, FineStatus,
  FINE_STATUS_LABEL, FINE_STATUS_BADGE, formatCurrency, formatDate } from '@/lib/staff/misc-api';


interface PageProps {
  searchParams: { page?: string; status?: string };
}

export default async function FinesPage({ searchParams }: PageProps) {
  const params: FineQueryParams = {
    page:  searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: 15,
    ...(searchParams.status && { status: searchParams.status as FineStatus }),
  };

  const { data: fines, meta } = await fetchFines(params);
  const unpaidTotal = fines
    .filter(f => f.status === 'UNPAID')
    .reduce((s, f) => s + Number(f.amount), 0);

  return (
    <div className="dashboard-content">
      <div className="max-w-[1100px] mx-auto space-y-6">

        <div>
          <span className="text-overline mb-2 block">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)] inline-block" />
            Staff Panel
          </span>
          <h1 className="text-heading-xl">Fines</h1>
          <p className="text-body mt-1">Track late-return penalties and waive if needed.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="stat-card glow-border-top">
            <div className="flex items-center justify-between mb-3">
              <span className="tag-code">FIN-TOT</span>
              <span className="status-dot bg-[var(--color-text-muted)]" />
            </div>
            <div className="stat-value">{meta.total}</div>
            <div className="stat-label mt-1">Total Fines</div>
          </div>
          <div className="stat-card glow-border-top">
            <div className="flex items-center justify-between mb-3">
              <span className="tag-code">FIN-DUE</span>
              <span className="status-dot status-dot-danger" />
            </div>
            <div className="stat-value text-[var(--color-danger-500)]">
              {formatCurrency(unpaidTotal)}
            </div>
            <div className="stat-label mt-1">Unpaid Amount</div>
          </div>
          <div className="stat-card glow-border-top">
            <div className="flex items-center justify-between mb-3">
              <span className="tag-code">FIN-WAV</span>
              <span className="status-dot bg-[var(--color-info-500)]" />
            </div>
            <div className="stat-value">{fines.filter(f=>f.status==='WAIVED').length}</div>
            <div className="stat-label mt-1">Waived</div>
          </div>
        </div>

        {/* Filter */}
        <form method="GET" className="flex gap-1 flex-wrap">
          {(['', 'UNPAID', 'PAID', 'WAIVED'] as const).map(s => (
            <button key={s} name="status" value={s} type="submit"
              className={`btn btn-sm ${(searchParams.status ?? '') === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s === '' ? 'All' : FINE_STATUS_LABEL[s]}
            </button>
          ))}
        </form>

        {/* Table */}
        <div className="card card-lg p-0 overflow-hidden">
          <div className="table-wrap border-0 rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th><th>Device</th><th>Amount</th>
                  <th>Reason</th><th>Status</th><th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {fines.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16">
                    <span className="tag-code text-base px-4 py-2 inline-block mb-3">FIN-000</span>
                    <p className="text-[var(--color-text-muted)]">No fines found</p>
                  </td></tr>
                ) : fines.map(f => {
                  const name = [f.user.firstName, f.user.lastName].filter(Boolean).join(' ') || f.user.email;
                  return (
                    <tr key={f.id} className={f.status === 'UNPAID' ? 'bg-[var(--color-danger-50)]' : ''}>
                      <td>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
                        <p className="text-caption">{f.user.email}</p>
                      </td>
                      <td>
                        <p className="text-sm">{f.borrowRequest?.device?.name ?? '—'}</p>
                      </td>
                      <td>
                        <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                          {formatCurrency(f.amount)}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm text-[var(--color-text-secondary)] truncate max-w-[160px]" title={f.reason}>
                          {f.reason}
                        </p>
                      </td>
                      <td><span className={FINE_STATUS_BADGE[f.status]}>{FINE_STATUS_LABEL[f.status]}</span></td>
                      <td><span className="text-sm">{formatDate(f.createdAt)}</span></td>
                      <td className="text-right">
                        {/* Only ADMIN can waive — staff sees disabled state */}
                        <WaiveAction fineId={f.id} status={f.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}