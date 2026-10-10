import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} is a free web app for tracking movies and TV series. Signed-in
users log what they have watched, rate it, keep a "to watch" list, and build a
collection. Media data comes from TMDB. Browsing, searching and reading media pages
need no account.

## Pages

- [Home](${absoluteUrl('/')}): trending movies and an introduction to ${SITE_NAME}.
- [About](${absoluteUrl('/about')}): what ${SITE_NAME} is, who builds it, and how it handles data.
- [Search](${absoluteUrl('/search')}): search movies and series by title. Only the
  bare URL is listed; \`/search?query=…\` is noindex and not worth crawling.
- [Terms and Conditions](${absoluteUrl('/terms')}): terms of use.
- [Privacy Policy](${absoluteUrl('/privacy')}): what data is stored and why.

## Media pages

Individual titles live at \`/movie/<id>-<slug>\` and \`/series/<id>-<slug>\`,
where \`<id>\` is the TMDB id. The slug is cosmetic; any other slug for the same
id redirects to the canonical URL. Each page carries the poster, synopsis, genres,
director or creator, release date, runtime, TMDB score and related titles. There
is no cast list and no streaming availability.

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): every indexable URL, including current
  trending and popular titles.
- [Robots](${SITE_URL}/robots.txt): crawler rules.

Account, collection and profile pages are private and excluded from crawling.
`;

export function GET() {
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
