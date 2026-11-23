import type { Metadata } from 'next';
import { StaticContentPage } from '@/components/StaticContentPage';
import { TERMS_PAGE } from '@/lib/staticPages';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: TERMS_PAGE.description,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <StaticContentPage
      title={TERMS_PAGE.title}
      subtitle={TERMS_PAGE.subtitle}
      sections={TERMS_PAGE.sections}
    />
  );
}
