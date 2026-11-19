import { Suspense } from 'react';
import { getCurrentUser } from '@/services/getCurrentUser';
import { headers } from 'next/headers';
import {
  getMovieDetails,
  getSeriesDetails,
  getWatchProviders,
  getWikidataId,
} from '@/services/getMedia';
import { getProviderDeepLinks } from '@/services/getProviderDeepLinks';
import { toWatchRegion } from '@/lib/watchRegion';
import { getEnrichedMedia } from '@/services/getEnrichedMedia';
import { CollectionTab, NormalizedMedia } from '@/types';
import { notFound, permanentRedirect } from 'next/navigation';
import { toHref } from '@/lib/mediaUtils';
import { breadcrumbJsonLd, jsonLdScript, mediaJsonLd } from '@/lib/jsonLd';
import MediaActions from './MediaActions';
import MediaActionsSkeleton from './MediaActionsSkeleton';
import MediaDetail from './MediaDetail';
import MediaEntryForm from './MediaEntryForm';
import UserEntryFormSkeleton from './UserEntryFormSkeleton';
import CollectionBackLink from './CollectionBackLink';
import WhereToWatch from './WhereToWatch';
import WhereToWatchSkeleton from './WhereToWatchSkeleton';

export type MediaPageSearchParams = Record<
  string,
  string | string[] | undefined
>;

type Props = {
  slug: string;
  mediaType: 'movie' | 'series';
  searchParams?: MediaPageSearchParams;
};

function toCollectionTab(
  value: string | string[] | undefined,
): CollectionTab | undefined {
  if (value === 'watched' || value === 'to_watch') return value;
  return undefined;
}

function toQueryString(searchParams: MediaPageSearchParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value))
      value.forEach((entry) => params.append(key, entry));
    else if (value !== undefined) params.append(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export default async function MediaPage({
  slug,
  mediaType,
  searchParams = {},
}: Props) {
  const id = slug.split('-')[0];
  if (!id || !/^\d+$/.test(id)) notFound();

  const tmdbData =
    mediaType === 'series'
      ? await getSeriesDetails(id)
      : await getMovieDetails(id);
  if (!tmdbData) notFound();

  const canonicalHref = toHref(tmdbData.id, tmdbData.title, mediaType);
  const requestedHref = `/${mediaType}/${slug}`;
  if (requestedHref !== canonicalHref) {
    permanentRedirect(`${canonicalHref}${toQueryString(searchParams)}`);
  }

  const initialStep = searchParams.step === '2' ? 2 : 1;
  const fromSearch = searchParams.from === 'search';
  const fromTab = toCollectionTab(searchParams.tab);
  const baseMedia: NormalizedMedia = { ...tmdbData, media_type: mediaType };
  const tmdbId = Number(id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(mediaJsonLd(baseMedia, mediaType)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(breadcrumbJsonLd(baseMedia, mediaType)),
        }}
      />
      <MediaDetail
        key={slug}
        media={baseMedia}
        initialStep={initialStep}
        fromSearch={fromSearch}
        navLink={
          !fromSearch ? (
            <Suspense fallback={null}>
              <UserCollectionBackLink tab={fromTab} />
            </Suspense>
          ) : undefined
        }
        actions={
          <Suspense fallback={<MediaActionsSkeleton />}>
            <UserEnrichedActions
              baseMedia={baseMedia}
              tmdbId={tmdbId}
              mediaType={mediaType}
            />
          </Suspense>
        }
        whereToWatch={
          <Suspense fallback={<WhereToWatchSkeleton />}>
            <ViewerWatchProviders
              tmdbId={id}
              mediaType={mediaType}
              title={baseMedia.title}
            />
          </Suspense>
        }
        form={
          <Suspense fallback={<UserEntryFormSkeleton />}>
            <UserEnrichedForm
              baseMedia={baseMedia}
              tmdbId={tmdbId}
              mediaType={mediaType}
            />
          </Suspense>
        }
      />
    </>
  );
}

type EnrichedProps = {
  baseMedia: NormalizedMedia;
  tmdbId: number;
  mediaType: 'movie' | 'series';
};

async function UserCollectionBackLink({ tab }: { tab?: CollectionTab }) {
  const user = await getCurrentUser();
  if (!user) return null;
  return <CollectionBackLink tab={tab} />;
}

async function UserEnrichedActions({
  baseMedia,
  tmdbId,
  mediaType,
}: EnrichedProps) {
  const { media, isAuthenticated } = await getEnrichedMedia(
    baseMedia,
    tmdbId,
    mediaType,
  );

  return <MediaActions media={media} isAuthenticated={isAuthenticated} />;
}

async function ViewerWatchProviders({
  tmdbId,
  mediaType,
  title,
}: {
  tmdbId: string;
  mediaType: 'movie' | 'series';
  title: string;
}) {
  const requestHeaders = await headers();
  // ponytail: WATCH_REGION is the local-dev knob. No geo header off Vercel, and
  // accept-language carries the browser's language, not the viewer's country, so
  // an English browser in Poland resolves to US. Unset in production.
  const region = toWatchRegion(
    process.env.WATCH_REGION ?? requestHeaders.get('x-vercel-ip-country'),
    requestHeaders.get('accept-language'),
  );
  const [providers, user, wikidataId] = await Promise.all([
    getWatchProviders(tmdbId, mediaType, region),
    getCurrentUser(),
    getWikidataId(tmdbId, mediaType),
  ]);
  if (!providers) return null;

  // Only signed-in viewers get links at all, so skip Wikidata otherwise.
  const deepLinks = user
    ? await getProviderDeepLinks(wikidataId, mediaType)
    : undefined;

  return (
    <WhereToWatch
      providers={providers}
      region={region}
      title={title}
      isAuthenticated={Boolean(user)}
      deepLinks={deepLinks}
    />
  );
}

async function UserEnrichedForm({
  baseMedia,
  tmdbId,
  mediaType,
}: EnrichedProps) {
  const { media } = await getEnrichedMedia(baseMedia, tmdbId, mediaType);

  return <MediaEntryForm media={media} />;
}
