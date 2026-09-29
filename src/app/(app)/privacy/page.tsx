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
    heading: 'Analytics',
    body: 'We do not use third-party analytics or advertising trackers. No cookies beyond those required for authentication are set.',
  },
  {
    heading: 'Data Retention',
    body: 'Your data is retained for as long as your account is active. When you delete your account, your personal data and watch history are permanently removed within 30 days.',
  },
  {
    heading: 'Your Rights',
    body: 'You may request a copy of your data or ask us to delete it by contacting us. If you are in the EU or UK, you have rights under GDPR including access, rectification, and erasure.',
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
      subtitle="Last updated: July 2026"
      sections={sections}
    />
  );
}
