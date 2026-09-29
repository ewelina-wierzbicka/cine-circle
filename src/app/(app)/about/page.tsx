import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Who builds MidnightFrame, what the free private movie and TV tracker does, what it deliberately leaves out, and where the data comes from.',
  alternates: { canonical: '/about' },
};

type Section = { heading: string; body: string };

const sections: Section[] = [
  {
    heading: 'What MidnightFrame Is',
    body: 'MidnightFrame is a free, private movie and TV tracker. Search for anything, mark it as watched or add it to your to-watch list, rate it, and keep a note on why it landed the way it did. Everything sits in one collection that only you can see.',
  },
  {
    heading: 'Who Runs It',
    body: 'MidnightFrame is built and run by an independent developer. There is no company behind it, no investors, and no team. It started as a tool to replace a messy notes app full of half-remembered film titles, and it is still built for that.',
  },
  {
    heading: 'What It Is Not',
    body: 'It is not a social network. There are no public profiles, no followers, no feeds, and no comment sections. It is not a streaming service and it does not host or link to video. It is not an ad business either: your watch history is never sold or used to target you.',
  },
  {
    heading: 'Where the Data Comes From',
    body: 'Titles, posters, cast, and release dates come from The Movie Database. This product uses the TMDB API but is not endorsed or certified by TMDB. Metadata occasionally has gaps or errors; when it does, the fix belongs upstream at TMDB.',
  },
  {
    heading: 'Contact',
    body: 'Questions, bug reports, and feature requests are welcome at info.midnightframe@gmail.com',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-full px-6 md:px-12 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-2">
          About MidnightFrame
        </h1>
        <p className="font-mono text-sm text-secondary tracking-widest uppercase mb-10">
          A free, private movie and TV tracker
        </p>

        <div className="space-y-8">
          {sections.map(({ heading, body }) => (
            <div key={heading}>
              <h2 className="font-mono text-sm tracking-[0.15em] text-accent uppercase mb-3">
                {heading}
              </h2>
              <p className="font-sans text-base text-secondary leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
