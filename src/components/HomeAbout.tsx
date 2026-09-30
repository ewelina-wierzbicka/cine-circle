import { BackToTopLink } from '@/components/BackToTopLink';
import { ClapperboardIcon } from '@/icons/Clapperboard';
import SearchIcon from '@/icons/MagnifyingGlass';
import PlusIcon from '@/icons/Plus';
import StarIcon from '@/icons/Star';

const faq = [
  {
    question: 'Is MidnightFrame free?',
    answer:
      'Yes. Every feature is free, with no ads and no paid tier. You only need an account so your collection follows you between devices.',
  },
  {
    question: "Who can see what I've watched?",
    answer:
      'Only you. Nothing you log is published or shown to anyone else. There are no followers, no public profiles and no activity feed.',
  },
  {
    question: 'Where does the movie and series data come from?',
    answer:
      'Titles, posters, cast and release dates come from TMDB. Your ratings, dates and notes are yours and stay in your account. This product uses the TMDB API but is not endorsed or certified by TMDB.',
  },
];

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

const index = (position: number) => String(position + 1).padStart(2, '0');

export function HomeAbout() {
  return (
    <section
      aria-labelledby="what-is-midnightframe"
      className="relative z-10 px-6 md:px-12 py-8 md:py-32 max-w-7xl mx-auto"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
        <div>
          <p className="font-mono text-sm tracking-[0.2em] text-secondary/60 uppercase mb-5">
            About MidnightFrame
          </p>
          <h2
            id="what-is-midnightframe"
            className="font-serif text-[clamp(32px,5vw,48px)] tracking-[-0.03em] leading-[1.15] mb-6"
          >
            A quiet place for the movies that{' '}
            <em className="text-accent">
              stay <span className=" whitespace-nowrap">with you.</span>
            </em>
          </h2>
          <p className="font-sans text-base text-secondary leading-relaxed">
            MidnightFrame is a personal film log for late-night watchers. Keep
            track of what you&apos;ve seen, line up what&apos;s next, and build
            a collection that reflects your taste — not an algorithm&apos;s.
          </p>
        </div>

        <div className="lg:pt-2">
          <h2 id="midnightframe-faq" className="sr-only">
            Common questions
          </h2>
          {faq.map(({ question, answer }, position) => (
            <details
              key={question}
              className="group border-t border-secondary/15 last:border-b"
            >
              <summary className="flex cursor-pointer list-none items-center gap-5 py-6 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 font-mono text-sm text-secondary/40 transition-colors group-open:text-accent"
                >
                  {index(position)}
                </span>
                <h3 className="flex-1 font-sans text-base md:text-lg text-secondary transition-colors group-open:text-primary">
                  {question}
                </h3>
                <span aria-hidden="true" className="shrink-0">
                  <PlusIcon className="w-4 h-4 text-secondary/60 transition-[transform,color] duration-300 group-open:rotate-45 group-open:text-accent" />
                </span>
              </summary>
              <p className="pb-6 pl-11 pr-8 text-sm text-secondary leading-relaxed">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-6 mt-16 md:mt-24">
        {features.map(({ Icon, title, body }, position) => (
          <div
            key={title}
            className="rounded-2xl border border-white/[0.07] bg-bg2/60 p-6 transition-colors hover:border-white/[0.14] hover:bg-bg2"
          >
            <div className="flex items-start justify-between">
              <span
                aria-hidden="true"
                className="flex w-11 h-11 items-center justify-center rounded-xl bg-accent/12 text-accent"
              >
                <Icon className="w-5 h-5" />
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-sm text-secondary/40"
              >
                {index(position)}
              </span>
            </div>
            <h3 className="font-mono text-sm tracking-[0.2em] text-accent uppercase mt-6">
              {title}
            </h3>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              {body}
            </p>
          </div>
        ))}
      </div>

      <BackToTopLink className="inline-block font-mono text-sm tracking-[0.08em] mt-12">
        Browse the full catalogue ↑
      </BackToTopLink>
    </section>
  );
}
