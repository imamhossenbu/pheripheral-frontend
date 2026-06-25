const PROBLEMS = [
    {
        tag: "GAP-01",
        title: "No central inventory",
        body:
            "Device records live across spreadsheets, invoices, and email threads — there's no single source of truth for what exists, where it is, or what condition it's in.",
    },
    {
        tag: "GAP-02",
        title: "Inefficient procurement",
        body:
            "Employees who need equipment message IT informally. There's no structured way to browse what's available, compare options, or submit a real request.",
    },
    {
        tag: "GAP-03",
        title: "No payment visibility",
        body:
            "Order payments get tracked manually, if at all. Finance and IT end up working from two different versions of the truth.",
    },
    {
        tag: "GAP-04",
        title: "Limited accountability",
        body:
            "Without role-based access, either too many people can edit records — breaking data integrity — or too few can, creating bottlenecks.",
    },
];

export default function ProblemSection() {
    return (
        <section className="bg-page border-t border-subtle">
            <div className="page-container section-y">
                <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16">
                    {/* Left: framing copy */}
                    <div>
                        <span className="text-overline mb-4">The problem</span>
                        <h2 className="text-heading-xl mb-5" style={{ maxWidth: "26rem" }}>
                            Peripheral management usually isn't managed at all.
                        </h2>
                        <p className="text-body-lg" style={{ maxWidth: "26rem" }}>
                            It's a side effect of spreadsheets, Slack messages, and good
                            memory. That works until it doesn't — and by then, nobody can
                            say where the last twelve docking stations went.
                        </p>
                    </div>

                    {/* Right: problem cards grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {PROBLEMS.map((p) => (
                            <div key={p.tag} className="card flex flex-col">
                                <span className="tag-code self-start mb-4">{p.tag}</span>
                                <h3 className="text-heading-sm mb-2">{p.title}</h3>
                                <p className="text-body-sm">{p.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}