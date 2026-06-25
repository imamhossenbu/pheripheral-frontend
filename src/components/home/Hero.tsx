const LEDGER_DEVICES = [
    { tag: "PRX-014", name: "Logi MX Master 3S", kind: "Mouse", status: "In stock", dot: "success" },
    { tag: "PRX-027", name: "Dell UltraSharp 27\"", kind: "Monitor", status: "Assigned", dot: "muted" },
    { tag: "PRX-031", name: "Jabra Evolve2 65", kind: "Headset", status: "In stock", dot: "success" },
    { tag: "PRX-042", name: "Keychron K8 Pro", kind: "Keyboard", status: "Pending order", dot: "warning" },
    { tag: "PRX-055", name: "CalDigit TS4 Dock", kind: "Dock", status: "In stock", dot: "success" },
    { tag: "PRX-061", name: "Logi Brio 500", kind: "Webcam", status: "Assigned", dot: "muted" },
];

export default function Hero() {
    return (
        <section id="top" className="bg-page-mesh relative overflow-hidden">
            <div className="page-container section-y" style={{ paddingBottom: "3.5rem" }}>
                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
                    {/* Left: copy */}
                    <div>
                        <span className="text-overline mb-5">
                            <span className="status-dot status-dot-success" />
                            IT asset management, tagged and tracked
                        </span>

                        <h1
                            className="text-display-lg lg:text-display-xl mb-6"
                            style={{ maxWidth: "34rem" }}
                        >
                            Every keyboard, monitor, and dock —{" "}
                            <span className="text-gradient">accounted for.</span>
                        </h1>

                        <p className="text-body-lg mb-9" style={{ maxWidth: "32rem" }}>
                            Periphex replaces the spreadsheet-and-email shuffle with one
                            ledger for peripheral devices: who has what, what's on order,
                            what's been paid, and what needs your attention next.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <a href="#" className="btn btn-primary btn-lg">
                                Request a workspace
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                            <a href="#workflow" className="btn btn-ghost btn-lg">
                                See how it works
                            </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                            {[
                                ["Single", "source of truth"],
                                ["Role-based", "access control"],
                                ["Automated", "order alerts"],
                            ].map(([a, b]) => (
                                <div key={a} className="flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--color-brand-500)" }}>
                                        <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        <strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{a}</strong> {b}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: signature element — live ledger strip */}
                    <div className="relative">
                        <div
                            className="card-lg glow-border-top relative"
                            style={{ background: "var(--color-surface-0)" }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-overline mb-1">Live ledger</p>
                                    <p className="text-heading-sm">Recent scans</p>
                                </div>
                                <span className="badge badge-brand">6 today</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {LEDGER_DEVICES.map((d) => (
                                    <div
                                        key={d.tag}
                                        className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-[6px] transition-colors"
                                        style={{ border: "1px solid var(--color-surface-200)" }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="tag-code shrink-0">{d.tag}</span>
                                            <div className="min-w-0">
                                                <p
                                                    className="text-body-sm font-medium truncate"
                                                    style={{ color: "var(--color-text-primary)" }}
                                                >
                                                    {d.name}
                                                </p>
                                                <p className="text-caption">{d.kind}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`status-dot status-dot-${d.dot}`} />
                                            <span className="text-caption whitespace-nowrap">{d.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="divider my-4" />

                            <div className="flex items-center justify-between">
                                <p className="text-caption">Updated continuously from the depot floor</p>
                                <a href="#features" className="text-body-sm font-semibold" style={{ color: "var(--color-brand-600)" }}>
                                    View full catalog →
                                </a>
                            </div>
                        </div>

                        {/* floating mini stat */}
                        <div
                            className="hidden sm:flex absolute -top-5 -left-5 stat-card items-center gap-3"
                            style={{ padding: "0.75rem 1rem" }}
                        >
                            <div
                                className="flex items-center justify-center w-9 h-9 rounded-[6px]"
                                style={{ background: "var(--color-success-50)", color: "var(--color-success-500)" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 8l3.5 3.5L14 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className="stat-value" style={{ fontSize: "var(--font-size-xl)" }}>1,284</p>
                                <p className="stat-label" style={{ marginTop: 0 }}>Devices tracked</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}