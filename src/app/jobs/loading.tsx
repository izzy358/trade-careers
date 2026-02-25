function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-border" />
      <div className="mb-6 h-4 w-1/2 animate-pulse rounded bg-border" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-border" />
    </div>
  );
}

export default function JobsLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="h-10 w-full animate-pulse rounded bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
