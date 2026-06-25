const ROLES = [
    {
        tag: "ROLE-ADMIN",
        name: "Administrator",
        badge: "badge-brand",
        summary: "Full control over the system — the people accountable for the ledger being right.",
        perms: [
            "Add, edit, or retire any device record",
            "Approve or reject procurement requests",
            "Manage orders, payments, and vendors",
            "Assign roles to other users",
        ],
    },
    {
        tag: "ROLE-EDITOR",
        name: "Editor",
        badge: "badge-info",
        summary: "Day-to-day operators — IT staff who keep inventory and orders current.",
        perms: [
            "Update device condition and assignment",
            "Process procurement requests",
            "Update order and payment status",
            "Cannot manage user roles",
        ],
    },
    {
        tag: "ROLE-VIEWER",
        name: "Viewer",
        badge: "badge-muted",
        summary: "Everyone else — employees who need to see and request, not edit.",
        perms: [
            "Browse the full device catalog",
            "Submit procurement requests via cart",
            "Track their own request status",
            "Read-only on all inventory data",
        ],
    },
];

export default function RolesSection() {
    return (
        <section id="roles" className="bg-panel border-t border-subtle">
            <div className="page-container section-y">
                <div className="flex flex-col items-start mb-12 max-w-2xl">
                    <span className="text-overline mb-4">Access control</span>
                    <h2 className="text-heading-xl mb-4">The right access, for the right person.</h2>
                    <p className="text-body-lg">
                        Three roles, each scoped to what the job actually requires — so
                        the ledger stays accurate without becoming a bottleneck.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    {ROLES.map((r) => (
                        <div key={r.tag} className="card-lg flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <span className="tag-code">{r.tag}</span>
                                <span className={`badge ${r.badge}`}>{r.name}</span>
                            </div>
                            <p className="text-body-sm mb-6">{r.summary}</p>
                            <div className="divider mb-5" />
                            <ul className="flex flex-col gap-3 mt-auto">
                                {r.perms.map((p) => (
                                    <li key={p} className="flex items-start gap-2.5">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            className="mt-0.5 shrink-0"
                                            style={{ color: "var(--color-brand-500)" }}
                                        >
                                            <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="text-body-sm">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}