import { vi } from 'vitest';

type Result = { data?: unknown; error?: unknown };

export type Chain = { table: string; steps: [string, unknown[]][] };

/**
 * A chainable stand-in for the server Supabase client. Every `from(table)`
 * starts a chain that records each builder call and resolves, when awaited,
 * to the next result queued for that table. `storage.from(bucket)` works the
 * same way under the key `storage:<bucket>`.
 */
export function createSupabaseMock() {
  const queues = new Map<string, Result[]>();
  const chains: Chain[] = [];

  function startChain(table: string) {
    const result = queues.get(table)?.shift() ?? {};
    const chain: Chain = { table, steps: [] };
    chains.push(chain);

    // `catch` and `finally` are delegated too, not recorded as chain steps: a
    // service written with `.catch()` must behave like a promise rather than
    // silently log a step and return the builder.
    const settled = Promise.resolve({
      data: result.data ?? null,
      error: result.error ?? null,
    });
    const promiseMethods = ['then', 'catch', 'finally'] as const;

    const builder: object = new Proxy(
      {},
      {
        get(_, prop) {
          const method = promiseMethods.find((name) => name === prop);
          if (method) return settled[method].bind(settled);
          return (...args: unknown[]) => {
            chain.steps.push([String(prop), args]);
            return builder;
          };
        },
      },
    );
    return builder;
  }

  const client = {
    from: startChain,
    storage: { from: (bucket: string) => startChain(`storage:${bucket}`) },
    // Only the browser-client hooks read the user this way; server services
    // go through the mocked getCurrentUser instead.
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'user-1' } },
        error: null,
      })),
    },
  };

  return {
    /** The client itself, for the synchronous browser `createClient`. */
    client,
    createClient: vi.fn(async () => client),
    respond(table: string, ...results: Result[]) {
      queues.set(table, [...(queues.get(table) ?? []), ...results]);
    },
    chains(table: string): Chain[] {
      return chains.filter((chain) => chain.table === table);
    },
    reset() {
      queues.clear();
      chains.length = 0;
      this.createClient.mockClear();
      // mockReset, not mockClear: it also drops a `mockResolvedValueOnce`
      // queued by a test, and restores the default implementation.
      client.auth.getUser.mockReset();
    },
  };
}

/** The args of the first call to `method` in the chain, or undefined. */
export function argsOf(chain: Chain | undefined, method: string) {
  return chain?.steps.find(([name]) => name === method)?.[1];
}

/** Every `eq` filter in the chain, as [column, value] pairs. */
export function eqFilters(chain: Chain | undefined) {
  return chain?.steps.filter(([name]) => name === 'eq').map(([, args]) => args);
}
