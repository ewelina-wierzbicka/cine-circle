import { twMerge } from '@/lib/cn';
import { ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
};

/**
 * The closing line under an auth form: "Back to Sign in", "Register", etc.
 * It is not a slot on `AuthFormLayout` because `ForgotPasswordForm` swaps its
 * footer with the form's own success state, which the page cannot see.
 *
 * The default `mt-6` follows a form. The two screens that end in a card, the
 * forgot-password success state and `/confirm-email`, override it with `mt-8`.
 */
export function AuthFormFooter({ className, children }: Props) {
  return (
    <p
      className={twMerge('mt-6 text-center text-sm text-secondary', className)}
    >
      {children}
    </p>
  );
}
