"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      event.currentTarget.reset();
      toast.success("Message submitted");
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[0.8fr_1.2fr] gap-8">
        <section>
          <p className="text-xs font-black uppercase tracking-wider text-brand-blue">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-brand-dark dark:text-white">
            Talk to the Periphex team.
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Send a procurement question, support request, or implementation
            note. The form is ready for a backend contact endpoint when your API
            exposes one.
          </p>
          <div className="mt-8 space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-blue" />{" "}
              support@periphex.local
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-blue" /> +1 (555) 014-2040
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand-blue" /> IT Operations Desk
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                Name
              </label>
              <input
                required
                name="name"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                Email
              </label>
              <input
                required
                type="email"
                name="email"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              Subject
            </label>
            <input
              required
              name="subject"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              Message
            </label>
            <textarea
              required
              name="message"
              rows={6}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <button
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </main>
    </div>
  );
}
