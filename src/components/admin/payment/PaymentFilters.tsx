import { PaymentTransactionStatus, PaymentMethod, METHOD_LABELS, STATUS_LABELS } from '@/lib/api/payment-api';

interface PaymentFiltersProps {
    searchParams: {
        status?: string;
        method?: string;
        page?: string;
    };
}

export function PaymentFilters({ searchParams }: PaymentFiltersProps) {
    const activeStatus = searchParams.status ?? '';
    const activeMethod = searchParams.method ?? '';

    const statusOptions = [
        { value: '', label: 'All statuses' },
        ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
    ];

    const methodOptions = [
        { value: '', label: 'All methods' },
        ...Object.entries(METHOD_LABELS).map(([v, l]) => ({ value: v, label: l })),
    ];

    return (
        <div className="flex flex-wrap items-center gap-3">
            <form method="GET" className="contents">
                {activeMethod && <input type="hidden" name="method" value={activeMethod} />}

                <select
                    name="status"
                    defaultValue={activeStatus}
                    className="input select text-sm py-2 min-w-[148px]"
                >
                    {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>

                <select
                    name="method"
                    defaultValue={activeMethod}
                    className="input select text-sm py-2 min-w-[156px]"
                >
                    {methodOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>

                <noscript>
                    <button type="submit" className="btn btn-ghost btn-sm">Apply</button>
                </noscript>
            </form>

            {(activeStatus || activeMethod) && (
                <div className="flex items-center gap-2">
                    {activeStatus && (
                        <span className="badge badge-brand">
                            {STATUS_LABELS[activeStatus as PaymentTransactionStatus]}
                        </span>
                    )}
                    {activeMethod && (
                        <span className="badge badge-info">
                            {METHOD_LABELS[activeMethod as PaymentMethod]}
                        </span>
                    )}
                    <a href="/admin/payments" className="btn btn-ghost btn-xs">
                        ✕ Clear
                    </a>
                </div>
            )}
        </div>
    );
}