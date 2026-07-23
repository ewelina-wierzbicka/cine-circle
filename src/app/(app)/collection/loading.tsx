export default function Loading() {
  return (
    <div className="min-h-full px-6 md:px-10 lg:px-14 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-10 pb-12">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 rounded bg-bg3" />
          <div className="h-10 w-40 rounded bg-bg3" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-xl bg-bg2" />
          <div className="h-10 w-32 rounded-xl bg-bg2" />
        </div>
      </div>
      {/* Media grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-[2/3] rounded-xl bg-bg3" />
            <div className="h-3 w-3/4 rounded bg-bg3" />
            <div className="h-3 w-1/2 rounded bg-bg2" />
          </div>
        ))}
      </div>
    </div>
  );
}
