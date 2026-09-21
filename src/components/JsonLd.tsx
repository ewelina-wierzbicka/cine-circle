import { JsonLdGraph } from '@/lib/jsonLd';

// TMDB overviews and titles land inside this script tag, so escape the
// characters that could close it early or open an HTML comment.
function serialize(data: JsonLdGraph): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function JsonLd({ data }: { data: JsonLdGraph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
