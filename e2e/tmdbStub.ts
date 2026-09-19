import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import searchInception from './fixtures/tmdb/search-inception.json';
import movie27205 from './fixtures/tmdb/movie-27205.json';

// A local stand-in for api.themoviedb.org.
//
// TMDB is fetched server-side (`services/getMedia.ts`, `services/getTrendingMovies.ts`),
// so `page.route` cannot intercept it. Without this stub the suite depends on
// the live API: fork PRs have no `TMDB_TOKEN` and every movie test fails, and a
// TMDB outage or slow response flakes CI on trunk.
//
// `playwright.config.ts` points the dev server at this server through
// `TMDB_BASE_URL`; `global-setup.ts` starts it and proves it is wired up.

export const TMDB_STUB_PORT = Number(process.env.TMDB_STUB_PORT ?? 4010);
export const TMDB_STUB_BASE_URL = `http://127.0.0.1:${TMDB_STUB_PORT}/3`;

// Fixtures are stored in the app's normalized shape because they also back the
// `page.route` mocks in search.spec.ts. TMDB nests credits and recommendations,
// so rebuild that shape here instead of duplicating the fixture.
type MovieFixture = typeof movie27205;

function toTmdbMovie(fixture: MovieFixture) {
  const { director, recommendations, ...rest } = fixture;
  return {
    ...rest,
    credits: { crew: director ? [{ job: 'Director', name: director }] : [] },
    recommendations: { results: recommendations ?? [] },
  };
}

const MOVIES_BY_ID: Record<string, MovieFixture> = {
  '27205': movie27205,
};

const NOT_FOUND = {
  success: false,
  status_code: 34,
  status_message: 'The resource you requested could not be found.',
};

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function searchMovieResponse(page: number) {
  return {
    page,
    results: searchInception.results,
    total_pages: 1,
    total_results: searchInception.results.length,
  };
}

function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', TMDB_STUB_BASE_URL);
  // The base URL carries TMDB's `/3` version prefix; drop it before matching.
  const path = url.pathname.replace(/^\/3/, '');
  const page = Number(url.searchParams.get('page') ?? '1') || 1;

  if (path === '/search/movie') {
    // Every query returns the Inception fixture. Specs assert on that title,
    // and a query-aware stub would only add a second source of truth.
    return sendJson(res, 200, searchMovieResponse(page));
  }

  if (path === '/search/tv') {
    return sendJson(res, 200, {
      page,
      results: [],
      total_pages: 1,
      total_results: 0,
    });
  }

  if (path === '/trending/all/week') {
    // The home page only needs poster + title for its hero hints.
    return sendJson(res, 200, { page: 1, results: searchInception.results });
  }

  const movieMatch = path.match(/^\/movie\/(\d+)$/);
  if (movieMatch) {
    const fixture = MOVIES_BY_ID[movieMatch[1]];
    if (!fixture) return sendJson(res, 404, NOT_FOUND);
    return sendJson(res, 200, toTmdbMovie(fixture));
  }

  // No series fixture yet: /tv/:id and anything else 404s, which the app turns
  // into notFound(). A spec that needs one adds a fixture here.
  return sendJson(res, 404, NOT_FOUND);
}

export async function startTmdbStub(): Promise<() => Promise<void>> {
  const server = createServer(handle);

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(TMDB_STUB_PORT, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  return () =>
    new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
}
