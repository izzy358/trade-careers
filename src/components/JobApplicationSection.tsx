'use client';

import { useState } from 'react';
import { ApplyForm } from '@/components/ApplyForm';

export function JobApplicationSection({ jobSlug }: { jobSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="apply" className="rounded-xl border border-border bg-surface p-5 md:p-8">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-4 w-full rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700"
      >
        {isOpen ? 'Hide Application Form' : 'Apply Now'}
      </button>

      {isOpen ? <ApplyForm jobSlug={jobSlug} /> : null}
    </section>
  );
}
