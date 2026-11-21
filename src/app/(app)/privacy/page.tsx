import type { Metadata } from 'next';
import { StaticContentPage } from '@/components/StaticContentPage';
import { PRIVACY_PAGE } from '@/lib/staticPages';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: PRIVACY_PAGE.description,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <StaticContentPage
      title={PRIVACY_PAGE.title}
      subtitle={PRIVACY_PAGE.subtitle}
      sections={PRIVACY_PAGE.sections}
    />
  );
}
