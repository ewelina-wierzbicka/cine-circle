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

    const builder: object = new Proxy(
      {},
      {
        get(_, prop) {
          if (prop === 'then') {
            const settled = Promise.resolve({
              data: result.data ?? null,
              error: result.error ?? null,
            });
            return settled.then.bind(settled);
          }
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
  };

  return {
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
