"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Monitor, Mail, Send, CheckCircle2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { usePathname } from "next/navigation";

const links = {
  Platform: [
    { label: "Browse Devices", href: "/devices" },
    { label: "My Cart", href: "/cart" },
    { label: "My Profile", href: "/profile" },
    { label: "Notifications", href: "/notifications" },
  ],
  Company: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const hideNavbar =
    pathname.includes("/admin") ||
    pathname.includes("/student") ||
    pathname.includes("/staff");

  if (hideNavbar) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="border-t border-surface-200 bg-surface-0 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center space-x-2.5 w-fit">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-surface-0 shadow-sm">
                <Monitor className="w-4 h-4" />
              </div>
              <span className="text-sm font-black tracking-tight text-text-primary uppercase">
                Periphex
              </span>
            </Link>
            <p className="text-xs leading-6 text-text-secondary max-w-[200px] font-medium">
              Peripheral device management for IT teams — from catalog to order
              record.
            </p>

            <div className="flex items-center gap-2">
              <a
                href="mailto:support@periphex.com"
                className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center text-text-secondary hover:text-brand-500 hover:border-brand-500 transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center text-text-secondary hover:text-brand-500 hover:border-brand-500 transition-all"
              >
                <FaGithub className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-500">
                {group}
              </p>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-xs font-semibold text-text-secondary hover:text-brand-500 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Subscription */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-500">
              Newsletter
            </p>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Subscribe to track newly added peripherals and catalog stock
              status updates.
            </p>

            <form onSubmit={handleSubscribe} className="relative mt-1">
              <div className="flex gap-1.5 items-center bg-surface-50 border border-surface-200 rounded-lg p-1 focus-within:border-brand-500 transition-all">
                <input
                  type="email"
                  placeholder="operator@domain.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  className="bg-transparent text-xs text-text-primary w-full pl-2 focus:outline-none disabled:opacity-50"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className="p-2 rounded-md bg-brand-500 text-surface-0 hover:bg-brand-600 transition disabled:bg-success-500 flex items-center justify-center cursor-pointer"
                >
                  {subscribed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-success-600 font-bold absolute mt-1.5 ml-1">
                  Subscription confirmed.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            © {new Date().getFullYear()} Periphex. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Infrastructure Operational
            </span>
          </div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            v1.0.0 · MIT License
          </p>
        </div>
      </div>
    </footer>
  );
}
