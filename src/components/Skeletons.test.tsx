import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import MediaActionsSkeleton from '@/components/MediaActionsSkeleton';
import MediaCardSkeleton from '@/components/MediaCardSkeleton';
import MediaDetailSkeleton from '@/components/MediaDetailSkeleton';
import UserEntryFormSkeleton from '@/components/UserEntryFormSkeleton';
import WhereToWatchSkeleton from '@/components/WhereToWatchSkeleton';
import { expectTextFree } from '@/test/textFree';

// One table per invariant, so a new skeleton is registered here rather than
// shipping silently uncovered. HeaderSkeleton is deliberately absent: its nav
// copy is real, visible text.
const SKELETONS: [string, ComponentType][] = [
  ['MediaActionsSkeleton', MediaActionsSkeleton],
  ['MediaCardSkeleton', MediaCardSkeleton],
  ['MediaDetailSkeleton', MediaDetailSkeleton],
  ['UserEntryFormSkeleton', UserEntryFormSkeleton],
  ['WhereToWatchSkeleton', WhereToWatchSkeleton],
];

// The skeletons a Suspense fallback is announced from. The two nested ones
// (MediaDetailSkeleton, MediaCardSkeleton) and the form carry no live region.
const BUSY: [string, ComponentType][] = [
  ['MediaActionsSkeleton', MediaActionsSkeleton],
  ['WhereToWatchSkeleton', WhereToWatchSkeleton],
];

describe('skeletons', () => {
  it.each(SKELETONS)('%s renders no heading and no text', (_, Component) => {
    expectTextFree(Component);
  });

  it.each(BUSY)('%s announces itself as busy', (_, Component) => {
    const { container } = render(<Component />);
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(container.firstElementChild).toHaveAttribute('aria-live', 'polite');
  });
});
