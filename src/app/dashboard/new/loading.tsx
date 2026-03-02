export default function NewFormLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <div className="h-4 w-32 rounded-md bg-muted animate-pulse mb-4" />
        <div className="h-7 w-48 rounded-md bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Blank form skeleton */}
      <div className="mb-6 rounded-xl border-2 border-dashed border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      {/* Templates skeleton */}
      <div className="mb-4">
        <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded-full bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
