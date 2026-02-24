
import Link from 'next/link';
import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Navbar */}
      <nav className="p-4 bg-surface shadow-lg flex justify-between items-center sticky top-0 z-10">
        <Link href="/" className="text-2xl font-bold text-primary">
          WrapCareers
        </Link>
        <div className="space-x-4 hidden md:flex">
          <Link href="/jobs" className="hover:text-primary">Find Jobs</Link>
          <Link href="/post-job" className="hover:text-primary">Post a Job</Link>
          <Link href="/installers" className="hover:text-primary">Browse Installers</Link>
          <Link href="/about" className="hover:text-primary">About</Link>
        </div>
        {/* Mobile Hamburger (TODO) */}
        <div className="md:hidden">
          <button>☰</button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface p-8 text-text-secondary text-sm mt-8">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold text-text-primary mb-2 block">WrapCareers</Link>
            <p>&copy; 2026 WrapCareers. All rights reserved.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary">X</a>
              <a href="#" className="hover:text-primary">IG</a>
              <a href="#" className="hover:text-primary">LI</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-3">For Installers</h4>
            <ul>
              <li><Link href="/jobs" className="hover:text-primary">Find Jobs</Link></li>
              <li><Link href="/create-profile" className="hover:text-primary">Create Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-3">For Employers</h4>
            <ul>
              <li><Link href="/post-job" className="hover:text-primary">Post a Job</Link></li>
              <li><Link href="/installers" className="hover:text-primary">Browse Installers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Company</h4>
            <ul>
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
