import type { Metadata } from 'next';
import { StaticContentPage } from '@/components/StaticContentPage';
import { aboutPageJsonLd, jsonLdScript } from '@/lib/jsonLd';
import { ABOUT_PAGE } from '@/lib/staticPages';

export const metadata: Metadata = {
  title: 'About',
  description: ABOUT_PAGE.description,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            aboutPageJsonLd(ABOUT_PAGE.title, ABOUT_PAGE.description),
          ),
        }}
      />
      <StaticContentPage
        title={ABOUT_PAGE.title}
        subtitle={ABOUT_PAGE.subtitle}
        sections={ABOUT_PAGE.sections}
      />
    </>
  );
}
