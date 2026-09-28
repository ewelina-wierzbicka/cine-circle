import { Link } from '@/components/Link';
import { ClapperboardIcon } from '@/icons/Clapperboard';
import SearchIcon from '@/icons/MagnifyingGlass';
import StarIcon from '@/icons/Star';

const features = [
  {
    Icon: SearchIcon,
    title: 'Log it',
    body: 'Search millions of movies and series. Mark them watched or add to your queue. Watched and to-watch stay separate.',
  },
  {
    Icon: StarIcon,
    title: 'Rate it honestly',
    body: 'Score out of ten. Write a note while the details are still fresh. Edit it after a rewatch.',
  },
  {
    Icon: ClapperboardIcon,
    title: 'One collection',
    body: 'Watched and to-watch in one place. Filter by title or type when the name half-escapes you.',
  },
];

export function HomeAbout() {
  return (
    <section
      aria-labelledby="what-is-midnightframe"
      className="relative z-10 px-6 md:px-12 py-8 md:py-32 max-w-6xl mx-auto"
    >
      <p className="font-mono text-sm tracking-[0.2em] text-accent uppercase mb-4">
        For people who care what they watch
      </p>
      <h2
        id="what-is-midnightframe"
        className="font-serif text-[clamp(32px,5vw,48px)] tracking-[-0.03em] leading-[1.2] mb-6"
      >
        Every movie you&apos;ve watched. Every one you haven&apos;t.
      </h2>
      <p className="font-sans text-base text-secondary leading-relaxed">
        Log what you watch. Rate it out of ten. Write down what you thought
        before you forget. One collection, no algorithm, no ads.
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
        Your collection is private. Log one movie tonight or catch up on a whole
        month. Either way, it&apos;s just for you.
      </p>

      <Link
        href="/search"
        className="inline-block font-mono text-sm tracking-[0.08em] mt-12"
      >
        Browse the full catalogue →
      </Link>
    </section>
  );
}
