import ErrorToast from '@/components/ErrorToast';
import { getUserMediaList } from '@/services/getUserMedia';
import { UserMediaPage } from '@/types';
import MyMedia from './MyMedia';

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === 'watched' ? 'watched' : 'to_watch';

  let initialData: UserMediaPage = { media: [], nextPage: null };
  let error: string | null = null;

  try {
    initialData = await getUserMediaList(tab, 0);
  } catch (err) {
    error = (err as Error).message || 'Failed to load your media.';
  }

  return (
    <div className="min-h-full px-6 md:px-10 lg:px-14">
      {error && <ErrorToast message={error} />}
      <MyMedia key={tab} tab={tab} initialData={initialData} />
    </div>
  );
}
