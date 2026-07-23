export default function Loading() {
  return (
    <div className="relative flex flex-col overflow-hidden bg-dark min-h-full">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_25%_35%,rgb(26,58,92)_0%,rgba(26,58,92,0.333)_35%,rgb(13,13,16)_68%)]" />
        <div className="absolute inset-0 z-1 bg-[linear-gradient(rgba(13,13,16,0.55)_0%,rgba(13,13,16,0.1)_40%,rgba(13,13,16,0.75)_100%)]" />
      </div>
      <div className="relative z-2 flex flex-col md:flex-row flex-1 animate-pulse">
        {/* Poster */}
        <div className="h-[50vh] md:h-auto md:w-1/2 shrink-0 flex items-center justify-center py-12 px-6 md:px-12 pr-4">
          <div className="w-full h-full max-h-[460px] rounded-2xl bg-bg3 -rotate-[1.5deg]" />
        </div>
        {/* Info */}
        <div className="flex-1 flex flex-col justify-center py-12 px-6 md:pl-6 lg:pl-12 gap-4">
          <div className="h-3 w-24 rounded bg-bg3" />
          <div className="h-10 w-3/4 rounded bg-bg3" />
          <div className="h-4 w-1/2 rounded bg-bg3 mt-2" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 w-16 rounded-full bg-bg3" />
            <div className="h-6 w-16 rounded-full bg-bg3" />
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-3 w-full rounded bg-bg3" />
            <div className="h-3 w-5/6 rounded bg-bg3" />
            <div className="h-3 w-4/6 rounded bg-bg3" />
          </div>
          <div className="flex gap-3 mt-8">
            <div className="h-11 w-36 rounded-xl bg-bg3" />
            <div className="h-11 w-36 rounded-xl bg-bg2" />
          </div>
        </div>
      </div>
    </div>
  );
}
