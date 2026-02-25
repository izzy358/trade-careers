'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-lg text-center bg-surface border border-error rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-3">Something went wrong</h2>
        <p className="text-text-secondary mb-6">
          We ran into a temporary issue. Please retry your request.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-orange-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
