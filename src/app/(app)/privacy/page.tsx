import type { Metadata } from 'next';
import {
  StaticContentPage,
  type StaticSection,
} from '@/components/StaticContentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What MidnightFrame collects, how your watch history is stored, and the rights you have over your data.',
  alternates: { canonical: '/privacy' },
};

const sections: StaticSection[] = [
  {
    heading: 'Who We Are',
    body: 'MidnightFrame is built and run by an independent developer. There is no company behind it, no investors, and no team. That developer is the data controller for everything described below, and can be reached at info.midnightframe@gmail.com.',
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
    body: 'To get a copy of your data, email info.midnightframe@gmail.com from the address on your account. We reply with your profile, watch history, ratings, and notes within 30 days, the same window as account deletion. There is no self-serve export in the app, so email is the only route. You can delete your account and everything in it yourself, from your profile page. If you are in the EU or UK, you have rights under GDPR including access, rectification, and erasure.',
  },
  {
    heading: 'Contact',
    body: 'For any privacy questions, reach us at info.midnightframe@gmail.com',
  },
];

export default function PrivacyPage() {
  return (
    <StaticContentPage
      title="Privacy Policy"
      subtitle="Last updated: October 2026"
      sections={sections}
    />
  );
}
