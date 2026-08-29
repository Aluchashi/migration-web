export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-zinc-500">Loading…</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100"
          />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100" />
        <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100" />
      </div>
    </div>
  );
}
