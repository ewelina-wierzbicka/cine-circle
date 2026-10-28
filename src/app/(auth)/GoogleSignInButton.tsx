'use client';

import Button from '@/components/Button';
import { GoogleIcon } from '@/icons/Google';
import { signInWithGoogle } from '@/services/auth';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  /** Same-site path to land on after the callback. Login only. */
  rurl?: string;
};

export function GoogleSignInButton({ rurl }: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async () => {
    setIsPending(true);
    const result = await signInWithGoogle(rurl);
    // A success redirects away, so only an error ever returns here.
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="outlined"
      handleClick={() => void handleSignIn()}
      disabled={isPending}
      className="flex items-center justify-center gap-3"
    >
      <GoogleIcon className="w-4.5 h-4.5 shrink-0" />
      CONTINUE WITH GOOGLE
    </Button>
  );
}
