import type { StaticSection } from '@/components/StaticContentPage';

export type StaticPage = {
  title: string;
  subtitle: string;
  description: string;
  sections: StaticSection[];
};

export const ABOUT_PAGE: StaticPage = {
  title: 'About MidnightFrame',
  subtitle: 'A free, private movie and TV tracker',
  description:
    'Who builds MidnightFrame, what the free private movie and TV tracker does, what it deliberately leaves out, and where the data comes from.',
  sections: [
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
      body: 'It is not a social network. There are no public profiles, no followers, no feeds, and no comment sections. It is not a streaming service: it hosts no video of its own, and it only points you to the services that carry a title, with no affiliate deals behind those links. It is not an ad business either: your watch history is never sold or used to target you.',
    },
    {
      heading: 'Where the Data Comes From',
      body: 'Titles, posters, genres, directors, and release dates come from The Movie Database. Streaming availability comes from JustWatch through the same API, and Wikidata supplies the direct provider links where it has them. This product uses the TMDB API but is not endorsed or certified by TMDB. Metadata occasionally has gaps or errors; when it does, the fix belongs upstream at TMDB.',
    },
    {
      heading: 'Contact',
      body: 'Questions, bug reports, and feature requests are welcome at info@midnightframe.app',
    },
  ],
};

export const TERMS_PAGE: StaticPage = {
  title: 'Terms and Conditions',
  subtitle: 'Last updated: July 2026',
  description:
    'The terms you agree to when you use MidnightFrame to track and rate the movies and series you watch.',
  sections: [
    {
      heading: 'Acceptance of Terms',
      body: 'By creating an account or using MidnightFrame, you agree to these terms. If you do not agree, do not use the service.',
    },
    {
      heading: 'Use of Service',
      body: 'MidnightFrame is a personal movie and series tracking tool. You may use it only for lawful purposes. You must not attempt to disrupt or abuse the service, scrape data in bulk, or impersonate other users.',
    },
    {
      heading: 'User-Generated Content',
      body: 'You own the movie lists, ratings, and notes you create. By submitting content you grant MidnightFrame a licence to store and display it to you. We do not sell your lists or make them publicly searchable without your consent.',
    },
    {
      heading: 'Account Termination',
      body: 'You may delete your account at any time from your profile settings. We may suspend or terminate accounts that violate these terms. On deletion, your data is removed from our systems within 30 days.',
    },
    {
      heading: 'Disclaimer',
      body: 'MidnightFrame is provided "as is" without warranty of any kind. Movie metadata is sourced from third-party providers and may contain errors. We are not liable for any loss arising from use of the service.',
    },
    {
      heading: 'Changes',
      body: 'We may update these terms from time to time. Continued use of MidnightFrame after changes constitutes acceptance of the revised terms.',
    },
  ],
};

export const PRIVACY_PAGE: StaticPage = {
  title: 'Privacy Policy',
  subtitle: 'Last updated: October 2026',
  description:
    'What MidnightFrame collects, how your watch history is stored, and the rights you have over your data.',
  sections: [
    {
      heading: 'Who We Are',
      body: 'MidnightFrame is built and run by an independent developer. There is no company behind it, no investors, and no team. That developer is the data controller for everything described below, and can be reached at info@midnightframe.app.',
    },
    {
      heading: 'What We Collect',
      body: 'When you register, we collect your email address. If you upload a profile picture, we store that avatar. We store your display name if you add it. As you use the app, we store your movie and series watch history, ratings, and any notes you add.',
    },
    {
      heading: 'How We Use It',
      body: 'Your data is used solely to provide the MidnightFrame service: showing your collection, powering search, and personalising your experience. We do not sell or rent your personal data to third parties.',
    },
    {
      heading: 'Storage',
      body: 'All data is stored in Supabase (PostgreSQL) and Supabase Storage, hosted on infrastructure in the EU. Row-level security policies ensure you can only access your own data.',
    },
    {
      heading: 'Analytics and Error Reporting',
      body: 'We use Vercel Analytics to measure traffic in aggregate: which pages are visited, how often, and how quickly they load. It is cookieless, it stores no identifier on your device, and it does not build a profile of you. We also use Sentry to report application errors so they can be fixed; it is configured to send no user information and no request bodies, and it stores its data in the EU. We use no advertising trackers, and no cookies beyond those required to keep you signed in are set.',
    },
    {
      heading: 'Data Retention',
      body: 'Your data is retained for as long as your account is active. When you delete your account, your personal data and watch history are permanently removed within 30 days.',
    },
    {
      heading: 'Your Rights',
      body: 'To get a copy of your data, email info@midnightframe.app from the address on your account. We reply with your profile, watch history, ratings, and notes within 30 days, the same window as account deletion. There is no self-serve export in the app, so email is the only route. You can delete your account and everything in it yourself, from your profile page. If you are in the EU or UK, you have rights under GDPR including access, rectification, and erasure.',
    },
    {
      heading: 'Contact',
      body: 'For any privacy questions, reach us at info@midnightframe.app',
    },
  ],
};
