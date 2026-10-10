import type { Metadata } from 'next';
import {
  StaticContentPage,
  type StaticSection,
} from '@/components/StaticContentPage';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'The terms you agree to when you use MidnightFrame to track and rate the movies and series you watch.',
  alternates: { canonical: '/terms' },
};

const sections: StaticSection[] = [
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
];

export default function TermsPage() {
  return (
    <StaticContentPage
      title="Terms and Conditions"
      subtitle="Last updated: July 2026"
      sections={sections}
    />
  );
}
