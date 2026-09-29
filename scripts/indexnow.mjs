#!/usr/bin/env node
// Submits every /sitemap.xml URL to IndexNow, which tells Bing and Copilot the
// site changed instead of waiting for the next crawl. Run manually:
//
//   npm run indexnow
//
// No dependencies: Node has global fetch, and the sitemap is small enough that
// a <loc> regex beats pulling in an XML parser.

const ENDPOINT = 'https://api.indexnow.org/indexnow';

// IndexNow rejects a batch larger than this. The sitemap is ~86 URLs today.
const MAX_URLS = 10000;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
const key = process.env.INDEXNOW_KEY?.trim();

// Exit 0, not 1: an unconfigured environment is not a build failure.
if (!siteUrl || !key) {
  const missing = [
    !siteUrl && 'NEXT_PUBLIC_SITE_URL',
    !key && 'INDEXNOW_KEY',
  ].filter(Boolean);
  console.log(`indexnow: skipped, ${missing.join(' and ')} not set.`);
  process.exit(0);
}

function decodeXmlEntities(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

async function readSitemapUrls(sitemapUrl) {
  const response = await fetch(sitemapUrl, {
    headers: { accept: 'application/xml' },
  });

  if (!response.ok) {
    throw new Error(`${sitemapUrl} responded ${response.status}`);
  }

  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    decodeXmlEntities(match[1].trim()),
  );

  return [...new Set(locs)];
}

const sitemapUrl = `${siteUrl}/sitemap.xml`;

let urlList;
try {
  urlList = await readSitemapUrls(sitemapUrl);
} catch (error) {
  console.error(`indexnow: could not read the sitemap — ${error.message}`);
  process.exit(1);
}

if (urlList.length === 0) {
  console.error(`indexnow: no <loc> entries found in ${sitemapUrl}.`);
  process.exit(1);
}

if (urlList.length > MAX_URLS) {
  console.warn(
    `indexnow: sitemap has ${urlList.length} URLs, submitting the first ${MAX_URLS}.`,
  );
  urlList = urlList.slice(0, MAX_URLS);
}

const payload = {
  host: new URL(siteUrl).host,
  key,
  keyLocation: `${siteUrl}/${key}.txt`,
  urlList,
};

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

console.log(
  `indexnow: submitted ${urlList.length} URLs to ${payload.host} — status ${response.status}.`,
);

if (!response.ok) {
  console.error(`indexnow: ${await response.text()}`);
  process.exit(1);
}
