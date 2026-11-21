import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

function newQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Renders inside a fresh QueryClient with retries off. */
export function renderWithQuery(ui: ReactElement) {
  const queryClient = newQueryClient();
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    ),
  };
}

/**
 * The same provider as a `renderHook` wrapper. `renderWithQuery` only wraps
 * `render(ui)`, so a hook test needs this instead of rebuilding the provider.
 */
export function queryWrapper() {
  const queryClient = newQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}
