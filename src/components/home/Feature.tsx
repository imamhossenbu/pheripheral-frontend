const FEATURES = [
    {
        tag: "MOD-A",
        title: "Device catalog",
        body:
            "Every keyboard, monitor, and headset logged with condition, location, and assignment history — searchable in seconds.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.5 17h7M10 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        tag: "MOD-B",
        title: "Procurement requests",
        body:
            "Employees browse the catalog, add what they need to a cart, and submit a structured request — no more guessing who to email.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 4h2l1.4 9.2a1.5 1.5 0 0 0 1.5 1.3h6.4a1.5 1.5 0 0 0 1.5-1.2l1-5.8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="17" r="1" fill="currentColor" />
                <circle cx="14" cy="17" r="1" fill="currentColor" />
            </svg>
        ),
    },
    {
        tag: "MOD-C",
        title: "Order management",
        body:
            "Track every order from approval to delivery, with a clear status trail so nothing quietly stalls in someone's inbox.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 6.5l6-3 6 3v7l-6 3-6-3v-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M4 6.5l6 3 6-3M10 9.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        tag: "MOD-D",
        title: "Payment tracking",
        body:
            "Every order links to its payment status, giving finance and IT the same record instead of two reconciled-by-hand versions.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2.5" y="5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5.5 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        tag: "MOD-E",
        title: "Role-based access",
        body:
            "Admins, editors, and viewers each see exactly what their role needs — full control without the free-for-all.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 17c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        tag: "MOD-F",
        title: "Automated notifications",
        body:
            "Inventory events, order changes, and payment updates get flagged automatically, so follow-up stops depending on memory.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 8a4 4 0 0 1 8 0c0 3 1 4 1 4H5s1-1 1-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8.5 15a1.7 1.7 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="bg-panel border-t border-subtle">
            <div className="page-container section-y">
                <div className="flex flex-col items-start mb-12 max-w-2xl">
                    <span className="text-overline mb-4">What's inside</span>
                    <h2 className="text-heading-xl mb-4">
                        One platform, six jobs it actually finishes.
                    </h2>
                    <p className="text-body-lg">
                        Cataloging, procurement, orders, payments, access, and alerts —
                        consolidated instead of scattered across six different tools.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((f) => (
                        <div key={f.tag} className="card-flat">
                            <div className="flex items-center justify-between mb-5">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-[6px]"
                                    style={{ background: "var(--color-brand-50)", color: "var(--color-brand-600)" }}
                                >
                                    {f.icon}
                                </div>
                                <span className="tag-code">{f.tag}</span>
                            </div>
                            <h3 className="text-heading-sm mb-2">{f.title}</h3>
                            <p className="text-body-sm">{f.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}