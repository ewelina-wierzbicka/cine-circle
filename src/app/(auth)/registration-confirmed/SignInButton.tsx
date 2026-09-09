'use client';

import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

export function SignInButton() {
  const router = useRouter();

  return <Button handleClick={() => router.push('/login')}>SIGN IN</Button>;
}
