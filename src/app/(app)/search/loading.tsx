import SearchBox from '@/components/SearchBox';

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-8 px-6 md:px-12">
      <div className="mb-8 w-full max-w-160">
        {/* ponytail: render real SearchBox so the input stays interactive during stream */}
        <SearchBox />
      </div>
      <div className="w-full max-w-160 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-[2/3] rounded-xl bg-bg3" />
              <div className="h-3 w-3/4 rounded bg-bg3" />
              <div className="h-3 w-1/2 rounded bg-bg2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
