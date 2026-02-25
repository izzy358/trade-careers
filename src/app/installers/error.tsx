'use client';

export default function InstallersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[45vh] items-center justify-center">
      <div className="max-w-xl rounded-xl border border-error bg-surface p-8 text-center">
        <h2 className="mb-2 text-3xl font-bold">Couldn&apos;t Load Installers</h2>
        <p className="mb-6 text-text-secondary">
          We hit a temporary issue while loading installer profiles. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2 font-semibold text-white transition-colors hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
