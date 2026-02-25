function InstallerCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-3 h-6 w-1/2 animate-pulse rounded bg-border" />
      <div className="mb-4 h-4 w-1/3 animate-pulse rounded bg-border" />
      <div className="mb-2 h-4 w-full animate-pulse rounded bg-border" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-border" />
    </div>
  );
}

export default function InstallersLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="h-10 w-full animate-pulse rounded bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <InstallerCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
