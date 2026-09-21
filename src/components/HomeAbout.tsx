import { Link } from '@/components/Link';
import { ClapperboardIcon } from '@/icons/Clapperboard';
import SearchIcon from '@/icons/MagnifyingGlass';
import StarIcon from '@/icons/Star';

const features = [
  {
    Icon: SearchIcon,
    title: 'Track what you watch',
    body: 'Search millions of films and TV series by title. Mark anything as watched, or save it to a to-watch list for later. Your collection keeps the two apart so nothing gets lost.',
  },
  {
    Icon: StarIcon,
    title: 'Rate and review',
    body: 'Score every title out of ten and record the date you saw it. Add a note on what worked and what did not, then edit it whenever you come back for a rewatch.',
  },
  {
    Icon: ClapperboardIcon,
    title: 'Keep one collection',
    body: 'Everything you have watched and everything you plan to watch lives in one place. Filter by title or media type to find a film you half remember.',
  },
];

export function HomeAbout() {
  return (
    <section
      aria-labelledby="what-is-midnightframe"
      className="relative z-10 px-6 md:px-12 py-8 md:py-32 max-w-6xl mx-auto"
    >
      <p className="font-mono text-sm tracking-[0.2em] text-accent uppercase mb-4">
        What is MidnightFrame
      </p>
      <h2
        id="what-is-midnightframe"
        className="font-serif text-[clamp(32px,5vw,48px)] tracking-[-0.03em] leading-[1.2] mb-6"
      >
        Your film diary, <em className="text-accent">properly kept</em>
      </h2>
      <p className="font-sans text-base text-secondary leading-relaxed">
        MidnightFrame is a tracker for the movies and series you watch. Search
        any title, log the date you saw it, rate it out of ten, and write down
        what you thought while it is still fresh. Everything lands in one
        collection you can filter and look back on, with no ads and no
        recommendation algorithm deciding what comes next.
      </p>

      <div className="grid gap-8 md:grid-cols-3 mt-12">
        {features.map(({ Icon, title, body }) => (
          <div key={title}>
            <span aria-hidden="true" className="block mb-3">
              <Icon className="w-6 h-6 text-accent" />
            </span>
            <h3 className="font-mono text-sm tracking-[0.15em] text-accent uppercase mb-2">
              {title}
            </h3>
            <p className="text-sm text-secondary leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <p className="font-sans text-base text-secondary leading-relaxed mt-12">
        Nothing you save is public. Your collection stays yours, whether you log
        a film the night you watch it or catch up on a month of viewing in one
        sitting.
      </p>

      <Link
        href="/search"
        className="inline-block font-mono text-sm tracking-[0.08em] mt-12"
      >
        Search the full movie and TV catalogue →
      </Link>
    </section>
  );
}
