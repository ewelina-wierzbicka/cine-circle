import type { StaticSection } from '@/components/StaticContentPage';
import { HOME_FAQ } from '@/lib/homeFaq';
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from '@/lib/seo';
import {
  ABOUT_PAGE,
  PRIVACY_PAGE,
  TERMS_PAGE,
  type StaticPage,
} from '@/lib/staticPages';

const renderSection = ({ heading, body }: StaticSection) =>
  `### ${heading}\n\n${body}`;

const renderPage = (path: string, { title, subtitle, sections }: StaticPage) =>
  [
    `## ${title}`,
    `Source: [${path}](${absoluteUrl(path)})`,
    subtitle,
    ...sections.map(renderSection),
  ].join('\n\n');

const faq = [
  '## Frequently Asked Questions',
  `Source: [/](${absoluteUrl('/')})`,
  ...HOME_FAQ.map(({ question, answer }) => `### ${question}\n\n${answer}`),
].join('\n\n');

const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

The full text of every public page on ${SITE_NAME}, in one file. Account,
collection and profile pages are private and are not included.

${faq}

${renderPage('/about', ABOUT_PAGE)}

${renderPage('/terms', TERMS_PAGE)}

${renderPage('/privacy', PRIVACY_PAGE)}
`;

export function GET() {
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
