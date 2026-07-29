'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { ClapperboardIcon } from '@/icons/Clapperboard';

export default function NotFoundContent() {
  const router = useRouter();

  return (
    <div className="relative z-10 max-w-[420px] animate-fade-up text-center">
      <ClapperboardIcon className="mx-auto mb-5 h-14 w-14 text-mint opacity-50" />
      <p className="mb-2.5 font-mono text-sm uppercase tracking-[0.22em] text-mint">
        Error 404
      </p>
      <h1 className="font-serif text-[clamp(38px,5vw,52px)] leading-none tracking-[-0.03em]">
        This <em className="text-mint">scene</em> doesn&rsquo;t exist
      </h1>
      <p className="mb-8 mt-3.5 text-sm leading-relaxed text-secondary">
        The page you&rsquo;re looking for was cut from the final edit.
        Let&rsquo;s get you back to the story.
      </p>
      <Button
        size="small"
        handleClick={() => router.push('/')}
        className="w-auto px-8"
      >
        Back to home
      </Button>
    </div>
  );
}
