const STEPS = [
    {
        n: "01",
        title: "Browse the catalog",
        body: "Search available devices by type, condition, or location — see exactly what's free before asking anyone.",
    },
    {
        n: "02",
        title: "Add to cart",
        body: "Collect everything needed for a new hire or a desk refresh in one request instead of five separate emails.",
    },
    {
        n: "03",
        title: "Submit for approval",
        body: "The request routes to the right admin or editor automatically, with full visibility into what's pending.",
    },
    {
        n: "04",
        title: "Order is placed",
        body: "Approved requests become tracked orders, linked to a vendor, cost, and expected delivery window.",
    },
    {
        n: "05",
        title: "Payment recorded",
        body: "Finance and IT see the same payment status — paid, pending, or overdue — with no separate reconciliation.",
    },
    {
        n: "06",
        title: "Device enters the ledger",
        body: "On arrival, the item is tagged, assigned, and added to inventory — closing the loop automatically.",
    },
];

export default function WorkflowSection() {
    return (
        <section id="workflow" className="bg-page border-t border-subtle">
            <div className="page-container section-y">
                <div className="flex flex-col items-start mb-14 max-w-2xl">
                    <span className="text-overline mb-4">The request flow</span>
                    <h2 className="text-heading-xl mb-4">From cart to inventory, in six steps.</h2>
                    <p className="text-body-lg">
                        This is the actual sequence a request travels through — not a
                        pitch, the real pipeline behind every order placed in Periphex.
                    </p>
                </div>

                <div className="relative">
                    {/* connecting line — desktop only */}
                    <div
                        className="hidden lg:block absolute top-[1.35rem] left-0 right-0 h-px"
                        style={{ background: "var(--color-surface-300)" }}
                    />

                    <div className="grid lg:grid-cols-6 gap-x-5 gap-y-10">
                        {STEPS.map((s) => (
                            <div key={s.n} className="relative flex flex-col">
                                <div
                                    className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full mb-5 shrink-0"
                                    style={{
                                        background: "var(--color-text-primary)",
                                        color: "var(--color-brand-400)",
                                    }}
                                >
                                    <span
                                        className="font-bold"
                                        style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-sm)" }}
                                    >
                                        {s.n}
                                    </span>
                                </div>
                                <h3 className="text-heading-sm mb-2">{s.title}</h3>
                                <p className="text-body-sm">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}