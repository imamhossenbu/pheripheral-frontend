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

  // এডমিন, স্টুডেন্ট বা স্টাফ প্যানেলে ফুটার হাইড রাখার লজিক
  const hideNavbar =
    pathname.includes("/admin") ||
    pathname.includes("/student") ||
    pathname.includes("/staff");

  if (hideNavbar) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // সাবস্ক্রিপশন মক অ্যাকশন
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-white dark:bg-[#0b1220] border-t border-amber-100 dark:border-amber-950/20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center space-x-2.5 w-fit">
              {/* Thriving Orange Accent Icon Container */}
              <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
                Periphex
              </span>
            </Link>
            <p className="text-xs leading-6 text-gray-500 dark:text-gray-400 max-w-[200px]">
              Peripheral device management for IT teams — from catalog to order
              record.
            </p>

            {/* Social Links With Orange Hover Effects */}
            <div className="flex items-center gap-2">
              <a
                href="mailto:support@periphex.com"
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Dynamic Link Columns (Platform & Company) */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 dark:text-amber-400">
                {group}
              </p>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Right Side: Newsletter Subscription Module */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 dark:text-amber-400">
              Newsletter
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Subscribe to track newly added peripherals and catalog stock
              status updates.
            </p>

            <form onSubmit={handleSubscribe} className="relative mt-1">
              <div className="flex gap-1.5 items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 group focus-within:border-amber-500 dark:focus-within:border-amber-500 transition-all">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  className="bg-transparent text-xs text-gray-800 dark:text-gray-200 w-full pl-2 focus:outline-none disabled:opacity-50"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className="p-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition disabled:bg-green-500 flex items-center justify-center cursor-pointer"
                  aria-label="Subscribe"
                >
                  {subscribed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-green-500 font-medium absolute mt-1.5 ml-1 animate-fade-in">
                  Thank you! You have successfully subscribed.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-amber-100 dark:border-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Periphex. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              All infrastructure operational
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            v1.0.0 · MIT License
          </p>
        </div>
      </div>
    </footer>
  );
}
