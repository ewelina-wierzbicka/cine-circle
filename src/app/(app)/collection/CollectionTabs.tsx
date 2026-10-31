import { twMerge } from '@/lib/cn';
import { CollectionTab } from '@/types';
import Link from 'next/link';

const TABS: { tab: CollectionTab; label: string }[] = [
  { tab: 'watched', label: 'Watched' },
  { tab: 'to_watch', label: 'To Watch' },
];

type Props = {
  active: CollectionTab;
};

/** The Watched / To Watch segmented control above the collection grid. */
export function CollectionTabs({ active }: Props) {
  return (
    <div className="flex bg-bg2 border border-secondary/25 rounded-xl p-0.5 gap-0.5 shrink-0 w-full sm:w-auto">
      {TABS.map(({ tab, label }) => (
        <Link
          key={tab}
          href={`?tab=${tab}`}
          aria-current={tab === active ? 'page' : undefined}
          className={twMerge(
            'px-4.5 py-1.75 rounded-[10px] text-sm font-semibold tracking-[0.04em] transition-all duration-200 w-1/2 sm:w-auto',
            tab === active
              ? 'bg-accent text-dark'
              : 'text-secondary hover:text-primary',
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
