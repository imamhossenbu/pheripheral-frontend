import { Payment, formatCurrency, PaymentTransactionStatus } from '@/lib/api/payment-api';

interface PaymentStatsProps {
  payments: Payment[];
  total: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  dotClass: string;
  tagCode: string;
}

function StatCard({ label, value, sub, dotClass, tagCode }: StatCardProps) {
  return (
    <div className="stat-card glow-border-top">
      <div className="flex items-center justify-between mb-3">
        <span className="tag-code">{tagCode}</span>
        <span className={`status-dot ${dotClass}`} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label mt-1">{label}</div>
      {sub && <div className="text-caption mt-1">{sub}</div>}
    </div>
  );
}

export function PaymentStats({ payments, total }: PaymentStatsProps) {
  const successful = payments.filter((p) => p.status === 'SUCCESS');
  const pending    = payments.filter((p) => p.status === 'PENDING').length;
  const failed     = payments.filter((p) => p.status === 'FAILED').length;
  const revenue    = successful.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        tagCode="PMT-TOT"
        label="Total Transactions"
        value={total}
        sub="All time"
        dotClass="bg-[var(--color-text-muted)]"
      />
      <StatCard
        tagCode="PMT-REV"
        label="Revenue Collected"
        value={formatCurrency(revenue)}
        sub={`${successful.length} successful`}
        dotClass="status-dot-success"
      />
      <StatCard
        tagCode="PMT-PND"
        label="Pending"
        value={pending}
        sub="Awaiting confirmation"
        dotClass="status-dot-warning"
      />
      <StatCard
        tagCode="PMT-ERR"
        label="Failed / Issues"
        value={failed}
        sub="Requires attention"
        dotClass="status-dot-danger"
      />
    </div>
  );
}