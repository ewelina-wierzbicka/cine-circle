import { BackLink } from '@/components/BackLink';
import { CollectionTab } from '@/types';

type Props = {
  tab?: CollectionTab;
};

export default function CollectionBackLink({ tab }: Props) {
  return (
    <BackLink href={tab ? `/collection?tab=${tab}` : '/collection'}>
      BACK TO COLLECTION
    </BackLink>
  );
}
