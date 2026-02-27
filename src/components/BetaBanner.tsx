'use client';

import { useEffect, useState } from 'react';

const BETA_BANNER_DISMISSED_KEY = 'beta-banner-dismissed';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(BETA_BANNER_DISMISSED_KEY) === '1';
    setIsVisible(!dismissed);
  }, []);

  const dismissBanner = () => {
    window.localStorage.setItem(BETA_BANNER_DISMISSED_KEY, '1');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-[1000] w-full bg-primary text-white">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 sm:items-center sm:gap-4 sm:px-6">
        <p className="flex-1 text-sm leading-relaxed sm:text-base">
          🚧 Beta Preview — This site is under active development. Some features may not work as expected.
          {' '}Found an issue? Let us know!
        </p>
        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Dismiss beta notice"
          className="rounded p-1 text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <span aria-hidden="true" className="block text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
