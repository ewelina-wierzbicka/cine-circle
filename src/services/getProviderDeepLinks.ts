import { cacheLife, cacheTag } from 'next/cache';
import {
  buildProviderDeepLinks,
  ProviderDeepLinks,
  WikidataClaims,
} from '@/lib/providerDeepLinks';
import { MediaType } from '@/types';

const ENTITY_DATA_URL = 'https://www.wikidata.org/wiki/Special:EntityData';

// Wikimedia 403s requests that send no real User-Agent.
const USER_AGENT = 'MidnightFrame/1.0 (+https://midnightframe.vercel.app)';

const TIMEOUT_MS = 4000;

type EntityDataResponse = {
  entities?: Record<string, { claims?: WikidataClaims } | undefined>;
};

const fetchProviderDeepLinks = async (
  wikidataId: string,
  mediaType: MediaType,
): Promise<ProviderDeepLinks> => {
  'use cache';
  cacheLife('days');
  cacheTag(`wikidata-${wikidataId}`);

  const res = await fetch(`${ENTITY_DATA_URL}/${wikidataId}.json`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Wikidata responded ${res.status}`);

  const body = (await res.json()) as EntityDataResponse;
  const claims = body.entities?.[wikidataId]?.claims ?? {};

  return buildProviderDeepLinks(claims, mediaType);
};

export const getProviderDeepLinks = async (
  wikidataId: string | null | undefined,
  mediaType: MediaType,
): Promise<ProviderDeepLinks> => {
  if (!wikidataId || !/^Q\d+$/.test(wikidataId)) return {};

  try {
    return await fetchProviderDeepLinks(wikidataId, mediaType);
  } catch {
    return {};
  }
};
