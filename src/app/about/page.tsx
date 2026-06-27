"use client";

import { motion } from "framer-motion";
import { Boxes, ClipboardCheck, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Boxes,
    title: "Centralized inventory",
    text: "A single ledger catalog for all tracked peripheral assets and components.",
  },
  {
    icon: ClipboardCheck,
    title: "Operational clarity",
    text: "Status, warranty, and audit data mapped directly to asset registry records.",
  },
  {
    icon: Shield,
    title: "Responsible access",
    text: "Role-aware architectural layers keeping administrative work distinct.",
  },
  {
    icon: Users,
    title: "Team procurement",
    text: "Optimized checkout flows designed to maintain context during requests.",
  },
];

const workflow = [
  {
    title: "Discovery",
    text: "Expedited catalog exploration with no mandatory initial authentication.",
  },
  {
    title: "Evaluation",
    text: "Context-rich data panels providing immediate insight for decision makers.",
  },
  {
    title: "Provisioning",
    text: "Unified checkout translation into secure backend order ledger entries.",
  },
  {
    title: "Maintenance",
    text: "Synchronized administrative tools for lifecycle audit and oversight.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-50 text-text-primary font-sans">
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-surface-0 border-b border-surface-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
          >
            <p className="text-xs font-black uppercase tracking-widest text-brand-500">
              About Periphex
            </p>
            <h1 className="mt-3 text-4xl font-black text-text-primary tracking-tight uppercase">
              Operational IT Infrastructure & Asset Lifecycle Management.
            </h1>
            <p className="mt-5 text-sm leading-7 text-text-secondary max-w-3xl font-medium">
              Periphex unifies device records, procurement streams, and
              lifecycle logs within a single, coherent workflow. Engineered for
              IT teams prioritizing velocity, structured control, and precise
              audit capabilities.
            </p>
          </motion.div>
        </section>

        {/* Value Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm hover:border-accent-400 transition-colors"
              >
                <value.icon className="w-6 h-6 text-brand-500" />
                <h2 className="mt-5 text-xs font-black uppercase tracking-wider text-text-primary">
                  {value.title}
                </h2>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-text-secondary">
                  {value.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="bg-surface-0 border-y border-surface-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl"
            >
              <p className="text-xs font-black uppercase tracking-widest text-brand-500">
                Lifecycle Workflow
              </p>
              <h2 className="mt-3 text-3xl font-black text-text-primary uppercase tracking-tight">
                Designed for Asset Permanence.
              </h2>
            </motion.div>

            <div className="mt-10 grid md:grid-cols-4 gap-4">
              {workflow.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-surface-200 bg-surface-50 p-6"
                >
                  <span className="text-[10px] font-black text-brand-500 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 text-xs font-black uppercase text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-text-secondary">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">
              System Architectural Philosophy
            </h2>
            <div className="mt-6 space-y-5 text-xs font-semibold leading-relaxed text-text-secondary">
              <p>
                Public catalog access optimizes discovery, removing friction for
                technical operators conducting initial asset reconnaissance.
              </p>
              <p>
                Protected transactional checkout ensures that sensitive
                operations—such as procurement requests and payment session
                initialization—remain constrained by authenticated backend role
                guardrails.
              </p>
              <p>
                The order and payment logic strictly adheres to internal API
                contracts, ensuring deterministic frontend behavior and
                providing a seamless audit path for administrative backend
                verification.
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
