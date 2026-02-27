'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { AuthNav } from '@/components/AuthNav';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { href: '/jobs', label: 'Find Jobs' },
  { href: '/post-job', label: 'Post a Job' },
  { href: '/installers', label: 'Browse Installers' },
  { href: '/about', label: 'About' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <nav className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary" onClick={() => setMobileOpen(false)}>
            Trade Careers
          </Link>

          <div className="hidden items-center space-x-5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 pb-1 transition-colors ${
                  isActiveRoute(link.href)
                    ? 'border-primary text-primary'
                    : 'border-transparent hover:border-primary/40 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <AuthNav />
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-border bg-surface px-4 pb-4 md:hidden">
            <div className="flex flex-col gap-2 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg border px-3 py-2 ${
                    isActiveRoute(link.href)
                      ? 'border-primary text-primary'
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <AuthNav mobile onNavigate={() => setMobileOpen(false)} />
              <div className="flex items-center gap-2 pt-2">
                <span className="text-text-secondary text-sm">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-6 md:py-8">{children}</main>

      <footer className="mt-8 bg-surface p-8 text-sm text-text-secondary">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-2 block text-2xl font-bold text-text-primary">Trade Careers</Link>
            <p>&copy; 2026 Trade Careers. All rights reserved.</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="hover:text-primary">X</a>
              <a href="#" className="hover:text-primary">IG</a>
              <a href="#" className="hover:text-primary">LI</a>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-text-primary">For Installers</h4>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="hover:text-primary">Find Jobs</Link></li>
              <li><Link href="/installers/register" className="hover:text-primary">Create Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-text-primary">For Employers</h4>
            <ul className="space-y-2">
              <li><Link href="/post-job" className="hover:text-primary">Post a Job</Link></li>
              <li><Link href="/installers" className="hover:text-primary">Browse Installers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-text-primary">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
