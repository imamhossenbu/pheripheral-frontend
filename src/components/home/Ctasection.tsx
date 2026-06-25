export default function CTASection() {
    return (
        <section className="bg-page border-t border-subtle">
            <div className="page-container section-y" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
                <div
                    className="bg-ink relative overflow-hidden rounded-[1rem] px-8 py-14 sm:px-16 sm:py-16 flex flex-col items-center text-center"
                >
                    {/* faint tag-code texture in corner */}
                    <span
                        className="hidden sm:block absolute top-6 right-8 tag-code"
                        style={{
                            background: "transparent",
                            borderColor: "rgba(245,118,47,.3)",
                            color: "var(--color-brand-300)",
                        }}
                    >
                        PRX-000
                    </span>

                    <span
                        className="text-overline mb-5"
                        style={{ color: "var(--color-brand-300)" }}
                    >
                        Ready when you are
                    </span>

                    <h2
                        className="text-display-lg mb-5"
                        style={{ color: "var(--color-surface-50)", maxWidth: "32rem" }}
                    >
                        Stop tracking peripherals by memory.
                    </h2>

                    <p
                        className="text-body-lg mb-9"
                        style={{ color: "var(--color-text-muted)", maxWidth: "30rem" }}
                    >
                        Set up your workspace, import your existing inventory, and give
                        your team one place to request, approve, and track equipment.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <a href="#" className="btn btn-primary btn-lg">
                            Request a workspace
                        </a>
                        <a
                            href="#"
                            className="btn btn-lg"
                            style={{
                                background: "transparent",
                                color: "var(--color-surface-50)",
                                border: "1px solid rgba(250,250,247,.25)",
                            }}
                        >
                            Talk to the team
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}