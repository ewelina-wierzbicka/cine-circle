import { getUserMovies } from '@/services/getUserMovies';
import MyMovies from './MyMovies';

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === 'watched' ? 'watched' : 'to_watch';

  const initialData = await getUserMovies(tab, 0);

  return <MyMovies key={tab} tab={tab} initialData={initialData} />;
}
