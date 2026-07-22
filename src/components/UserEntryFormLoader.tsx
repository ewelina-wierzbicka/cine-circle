export default function UserEntryFormLoader() {
  return (
    <div className="w-full py-4 animate-fade-up">
      <div className="h-11 w-72 rounded-xl bg-bg3 mb-10" />
      <div className="flex flex-col gap-7 max-w-full md:max-w-140">
        <div>
          <div className="h-4 w-44 rounded bg-bg3 my-3" />
          <div className="h-11.5 rounded-xl bg-bg2" />
        </div>
        <div>
          <div className="h-4 w-36 rounded bg-bg3 my-3" />
          <div className="h-8 w-44 rounded bg-bg3" />
        </div>
        <div>
          <div className="h-4 w-28 rounded bg-bg3 my-3" />
          <div className="h-30 rounded-xl bg-bg2" />
        </div>
        <div className="pt-6">
          <div className="h-11 w-full rounded-xl bg-bg3" />
        </div>
      </div>
    </div>
  );
}
