export default function ProfileLoading() {
  return (
    <div className="max-w-lg mx-auto px-6 py-12 animate-pulse">
      <div className="h-10 w-32 bg-bg2 rounded mb-8" />

      <div className="flex flex-col gap-10">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-bg2 shrink-0" />
          <div className="h-4 w-36 bg-bg2 rounded" />
        </div>

        {/* Form sections */}
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-3 w-28 bg-bg2 rounded mb-3" />
            <div className="h-12 w-full bg-bg2 rounded-xl" />
            <div className="h-10 w-24 bg-bg2 rounded-xl mt-3" />
          </div>
        ))}

        {/* Danger zone */}
        <div>
          <div className="h-3 w-28 bg-bg2 rounded mb-3" />
          <div className="h-24 w-full bg-bg2/50 rounded-xl border border-red-500/10" />
        </div>
      </div>
    </div>
  );
}
