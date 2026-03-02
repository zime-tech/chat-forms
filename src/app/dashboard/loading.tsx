export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-36 rounded-md bg-muted animate-pulse" />
          <div className="mt-2 h-4 w-24 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Form cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4"
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 w-48 rounded-md bg-muted animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
