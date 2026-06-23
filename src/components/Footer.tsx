'use client';

import React from 'react';
import Link from 'next/link';
import { Monitor, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#111827] border-t border-brand-pale dark:border-brand-dark/20 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-lg flex items-center justify-center text-brand-blue">
              <Monitor className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-brand-dark dark:text-white">
              Periphex
            </span>
            <span className="text-xs text-gray-400">
              v1.0.0
            </span>
          </div>

          {/* Middle Links */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
            <Link href="/about" className="hover:text-brand-blue transition-colors">About</Link>
            <Link href="/devices" className="hover:text-brand-blue transition-colors">Devices</Link>
            <Link href="/contact" className="hover:text-brand-blue transition-colors">Contact</Link>
            <Link href="/cart" className="hover:text-brand-blue transition-colors">Cart</Link>
            <Link href="/profile" className="hover:text-brand-blue transition-colors">Profile</Link>
            <span className="text-gray-300 dark:text-gray-800">|</span>
            <span className="flex items-center">
              Built with Next.js &amp; Framer Motion
            </span>
          </div>

          {/* Right Copyright */}
          <div className="text-xs text-gray-400 flex items-center">
            <span>&copy; {new Date().getFullYear()} Periphex. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
