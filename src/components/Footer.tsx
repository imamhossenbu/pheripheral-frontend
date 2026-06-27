"use client";

import Link from "next/link";
import { Monitor, Mail, ArrowUpRight } from "lucide-react";
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

  const pathname = usePathname()

const hideNavbar =
  pathname.includes("/admin") ||
  pathname.includes("/student") ||
  pathname.includes("/staff");

if (hideNavbar) return null;

  return (
    <footer className="bg-white dark:bg-[#0b1220] border-t border-brand-pale dark:border-brand-dark/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link href="/" className="flex items-center space-x-2.5 w-fit">
              <div className="w-9 h-9 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-brand-dark dark:text-white">
                Periphex
              </span>
            </Link>
            <p className="text-xs leading-6 text-gray-500 dark:text-gray-400 max-w-[200px]">
              Peripheral device management for IT teams — from catalog to order
              record.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="mailto:support@periphex.com"
                className="w-8 h-8 rounded-lg border border-brand-pale dark:border-brand-dark/30 flex items-center justify-center text-gray-400 hover:text-brand-blue hover:border-brand-blue transition-colors"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-brand-pale dark:border-brand-dark/30 flex items-center justify-center text-gray-400 hover:text-brand-blue hover:border-brand-blue transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {group}
              </p>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Built with col */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Built with
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Next.js 14", href: "https://nextjs.org" },
                { label: "NestJS", href: "https://nestjs.com" },
                { label: "Prisma ORM", href: "https://prisma.io" },
                { label: "Tailwind CSS", href: "https://tailwindcss.com" },
                { label: "SSLCommerz", href: "https://sslcommerz.com" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                  >
                    {item.label}
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-brand-pale dark:border-brand-dark/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} Periphex. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-gray-400">
              All systems operational
            </span>
          </div>
          <p className="text-[11px] text-gray-400">v1.0.0 · MIT License</p>
        </div>
      </div>
    </footer>
  );
}
