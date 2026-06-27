"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      event.currentTarget.reset();
      toast.success("Communications log submitted successfully");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-surface-50 text-text-primary font-sans antialiased transition-colors duration-200">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start">
        {/* Info Section — Ledger Typography Style */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-500">
              System Operations
            </p>
            <h1 className="mt-3 text-4xl font-black text-text-primary tracking-tight uppercase leading-tight">
              Connect with Periphex Team
            </h1>
            <p className="mt-4 text-xs font-semibold leading-relaxed text-text-secondary">
              Initialize formal procurement queries, hardware support requests,
              or pipeline implementation logs. The communication matrix routes
              directly to core systems dispatchers.
            </p>
          </div>

          <div className="pt-6 border-t border-surface-300 space-y-4 text-xs font-bold text-text-secondary">
            <div className="flex items-center gap-3 bg-surface-0 p-3 rounded-lg border border-surface-200 shadow-xxs">
              <div className="p-2 bg-brand-50 rounded-md text-brand-500 border border-brand-100">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                  Gateway Email
                </p>
                <p className="text-text-primary font-mono mt-0.5">
                  support@periphex.local
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-surface-0 p-3 rounded-lg border border-surface-200 shadow-xxs">
              <div className="p-2 bg-accent-50 rounded-md text-accent-500 border border-accent-300/20">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                  Secure Comms Line
                </p>
                <p className="text-text-primary font-mono mt-0.5">
                  +1 (555) 014-2040
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-surface-0 p-3 rounded-lg border border-surface-200 shadow-xxs">
              <div className="p-2 bg-info-50 rounded-md text-accent-600 border border-info-400/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                  Physical Hub
                </p>
                <p className="text-text-primary mt-0.5">
                  IT Infrastructure Operations Desk, Core Block 4
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section — Paper Registry Sheet Style */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-surface-300 bg-surface-0 p-6 shadow-sm space-y-5"
        >
          <div className="border-b border-surface-100 pb-3">
            <h2 className="text-xs font-black text-text-primary uppercase tracking-wider">
              Communication Dispatch Log
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                Operator Full Name
              </label>
              <input
                required
                name="name"
                placeholder="e.g. John Doe"
                className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                Authorization Email
              </label>
              <input
                required
                type="email"
                name="email"
                placeholder="operator@domain.local"
                className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
              Subject Vector
            </label>
            <input
              required
              name="subject"
              placeholder="Specify the structural scope of your dispatch..."
              className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
              Detailed Message Log
            </label>
            <textarea
              required
              name="message"
              rows={6}
              placeholder="Elaborate technical specifications, deployment blockages, or procurement clearances..."
              className="w-full text-xs p-3 resize-none rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-accent-500 transition-all"
            />
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-surface-0 hover:bg-brand-600 disabled:bg-surface-200 disabled:text-text-muted transition-all active:scale-99 shadow-sm cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transmitting Log...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Message Ledger</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
