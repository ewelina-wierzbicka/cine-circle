const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type TmdbMediaResponse = { id?: number; title?: string; name?: string };

export type ResolvedMedia = {
  exists: boolean;
  id: number | null;
  title: string | null;
};

/** Fail open: a missing token or a TMDB outage must never 404 or redirect. */
const UNRESOLVED: ResolvedMedia = { exists: true, id: null, title: null };
const MISSING: ResolvedMedia = { exists: false, id: null, title: null };

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

type CacheEntry = { resolved: ResolvedMedia; insertedAt: number };

// `next/cache` is unavailable in middleware, so this is a plain module-scope
// map: a best-effort per-instance cache, never a correctness mechanism. A cold
// instance must behave exactly as it does today.
const cache = new Map<string, CacheEntry>();

function readCache(key: string): ResolvedMedia | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.insertedAt >= CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.resolved;
}

// A bot scanning the id space must not grow the map without bound. Map keeps
// insertion order, so the first key is the oldest entry.
function writeCache(key: string, resolved: ResolvedMedia) {
  while (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (oldest.done) break;
    cache.delete(oldest.value);
  }
  cache.set(key, { resolved, insertedAt: Date.now() });
}

/**
 * Resolved and missing ids are memoized for the life of the instance. An
 * `UNRESOLVED` result never is: it means the token is missing or TMDB failed,
 * and caching an outage would freeze soft 404s in place.
 */
export async function resolveMedia(
  mediaType: 'movie' | 'series',
  id: string,
): Promise<ResolvedMedia> {
  const token = process.env.TMDB_TOKEN;
  if (!token) return UNRESOLVED;

  const key = `${mediaType}:${id}`;
  const cached = readCache(key);
  if (cached) return cached;

  const path = mediaType === 'series' ? 'tv' : 'movie';

  try {
    const res = await fetch(`${TMDB_BASE_URL}/${path}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) {
      writeCache(key, MISSING);
      return MISSING;
    }
    if (!res.ok) return UNRESOLVED;

    const data = (await res.json()) as TmdbMediaResponse;
    const title = mediaType === 'series' ? data.name : data.title;
    if (typeof data.id !== 'number' || typeof title !== 'string') {
      return UNRESOLVED;
    }

    const resolved: ResolvedMedia = { exists: true, id: data.id, title };
    writeCache(key, resolved);
    return resolved;
  } catch {
    return UNRESOLVED;
  }
}
