const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/** Only the id and the title are read; the rest of the detail body is ignored. */
type TmdbMediaResponse = { id?: number; title?: string; name?: string };

export type ResolvedMedia = {
  /** false only when TMDB answered 404. Every other failure fails open. */
  exists: boolean;
  /** null when the title could not be read — callers must not canonicalise. */
  id: number | null;
  title: string | null;
};

/** Fail open: a missing token or a TMDB outage must never 404 or redirect. */
const UNRESOLVED: ResolvedMedia = { exists: true, id: null, title: null };
const MISSING: ResolvedMedia = { exists: false, id: null, title: null };

/**
 * One TMDB detail request, used by `proxy.ts` to decide between a 404, a 308 to
 * the canonical slug, and letting the request through. The title comes from the
 * same response as the status — never add a second fetch for it.
 */
export async function resolveMedia(
  mediaType: 'movie' | 'series',
  id: string,
): Promise<ResolvedMedia> {
  const token = process.env.TMDB_TOKEN;
  if (!token) return UNRESOLVED;

  const path = mediaType === 'series' ? 'tv' : 'movie';

  try {
    const res = await fetch(`${TMDB_BASE_URL}/${path}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return MISSING;
    if (!res.ok) return UNRESOLVED;

    const data = (await res.json()) as TmdbMediaResponse;
    // Series carry `name`, movies carry `title`.
    const title = mediaType === 'series' ? data.name : data.title;
    if (typeof data.id !== 'number' || typeof title !== 'string') {
      return UNRESOLVED;
    }

    return { exists: true, id: data.id, title };
  } catch {
    return UNRESOLVED;
  }
}
