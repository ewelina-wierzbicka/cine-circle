import { CollectionTab } from '@/types';
import NextLink from 'next/link';

type Props = {
  tab?: CollectionTab;
};

export default function CollectionBackLink({ tab }: Props) {
  return (
    <NextLink
      href={tab ? `/collection?tab=${tab}` : '/collection'}
      className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-secondary hover:text-accent transition-colors duration-150 mb-9 self-start"
    >
      ← BACK TO COLLECTION
    </NextLink>
  );
}
