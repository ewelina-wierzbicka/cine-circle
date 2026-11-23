import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/**
 * React `cache` only memoizes in the react-server build, and only while an
 * async dispatcher is installed — Next.js installs one per request. Vitest
 * resolves the client build, where `cache` is a bare passthrough, so a service
 * wrapped in `cache` cannot be observed deduping without this scaffolding.
 *
 * `serverCache` is the real react-server `cache`; hand it to the module under
 * test with `vi.mock('react', () => ({ cache: serverCache }))`. `requestScope`
 * installs the dispatcher one request at a time: calls inside one callback
 * share a cache, calls in two callbacks do not.
 */
const require = createRequire(import.meta.url);

// A bare `react/cjs/...` specifier is blocked by the package exports map, so
// resolve the package root and require the file by absolute path.
const serverBuild = join(
  dirname(require.resolve('react/package.json')),
  'cjs/react.react-server.development.js',
);

type AsyncDispatcher = {
  getCacheForType: <T>(resourceType: () => T) => T;
  cacheSignal: () => null;
};

const reactServer = require(serverBuild) as {
  cache: <A extends unknown[], R>(fn: (...args: A) => R) => (...args: A) => R;
  __SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: {
    A: AsyncDispatcher | null;
  };
};

export const serverCache = reactServer.cache;

const internals =
  reactServer.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

export const requestScope = async <T>(run: () => Promise<T>): Promise<T> => {
  const caches = new Map<unknown, unknown>();

  internals.A = {
    getCacheForType<R>(resourceType: () => R): R {
      if (!caches.has(resourceType)) caches.set(resourceType, resourceType());
      return caches.get(resourceType) as R;
    },
    cacheSignal: () => null,
  };

  try {
    return await run();
  } finally {
    internals.A = null;
  }
};
