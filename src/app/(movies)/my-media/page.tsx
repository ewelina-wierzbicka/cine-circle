import { getUserMediaList } from '@/services/getUserMedia';
import MyMedia from './MyMedia';

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === 'watched' ? 'watched' : 'to_watch';

  const initialData = await getUserMediaList(tab, 0);

  return <MyMedia key={tab} tab={tab} initialData={initialData} />;
}
