const DEFAULT_TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Read at call time rather than module scope so the value always reflects the
// running process. `TMDB_BASE_URL` exists for the e2e suite, which points the
// dev server at a local fixture stub (`e2e/tmdbStub.ts`) so tests never depend
// on the live API or on a TMDB token. Everything else uses the real host.
export function tmdbApiUrl(path: string): string {
  const base = process.env.TMDB_BASE_URL ?? DEFAULT_TMDB_BASE_URL;
  return `${base.replace(/\/$/, '')}${path}`;
}
