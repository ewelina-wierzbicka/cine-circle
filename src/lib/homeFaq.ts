// Single source for the home FAQ. `HomeAbout` renders it as the accordion and
// `faqJsonLd()` serialises the same entries, so the markup and the structured
// data can never drift apart.
export const HOME_FAQ = [
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
] as const;
