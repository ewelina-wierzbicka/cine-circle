import type { Metadata } from 'next';
import {
  StaticContentPage,
  type StaticSection,
} from '@/components/StaticContentPage';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Who builds MidnightFrame, what the free private movie and TV tracker does, what it deliberately leaves out, and where the data comes from.',
  alternates: { canonical: '/about' },
};

const sections: StaticSection[] = [
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
    body: 'Titles, posters, genres, directors, and release dates come from The Movie Database. This product uses the TMDB API but is not endorsed or certified by TMDB. Metadata occasionally has gaps or errors; when it does, the fix belongs upstream at TMDB.',
  },
  {
    heading: 'Contact',
    body: 'Questions, bug reports, and feature requests are welcome at info.midnightframe@gmail.com',
  },
];

export default function AboutPage() {
  return (
    <StaticContentPage
      title="About MidnightFrame"
      subtitle="A free, private movie and TV tracker"
      sections={sections}
    />
  );
}
