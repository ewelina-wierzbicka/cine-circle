import SearchBox from './SearchBox';

export default function Home() {
  return (
    <div className="w-full sm:w-3/4 h-[calc(100vh-240px)] sm:h-[40vh] border border-primary flex items-center justify-center rounded-3xl flex-wrap flex-col">
      <p className="text-xl sm:text-xl mb-4 sm:mb-8 px-4 text-center">
        Which movie are you looking for today?
      </p>
      <SearchBox />
    </div>
  );
}
