export default function FormBuilderLoading() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header skeleton */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded bg-muted animate-pulse" />
          <div className="h-5 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="flex flex-col w-full md:w-[45%] border-r border-border">
          {/* Tab bar skeleton */}
          <div className="flex border-b border-border bg-surface px-1 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-16 rounded-md bg-muted animate-pulse mx-1" />
            ))}
          </div>

          {/* Chat area skeleton */}
          <div className="flex-1 p-4 space-y-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          </div>

          {/* Input skeleton */}
          <div className="border-t border-border p-4">
            <div className="h-10 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>

        {/* Right panel - preview skeleton */}
        <div className="hidden md:flex flex-1 flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="mx-auto h-5 w-40 rounded-md bg-muted animate-pulse" />
              <div className="mx-auto h-4 w-56 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
