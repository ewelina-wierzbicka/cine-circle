import { NotFoundState } from '@/components/NotFoundState';
import { NOT_FOUND_METADATA } from '@/lib/seo';

export const metadata = NOT_FOUND_METADATA;

export default function NotFound() {
  return (
    <main className="relative flex grow items-center justify-center px-6 py-16">
      <NotFoundState />
    </main>
  );
}
