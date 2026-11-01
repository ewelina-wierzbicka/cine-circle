import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email confirmed',
  description:
    'Your MidnightFrame email is confirmed. Sign in to start building your collection.',
};

import { AuthFormHeading } from '../AuthFormHeading';
import { CheckCircleIcon } from '@/icons/CheckCircle';
import AuthFormLayout from '../AuthFormLayout';
import { SignInButton } from './SignInButton';

export default function RegistrationConfirmedPage() {
  return (
    <AuthFormLayout>
      <AuthFormHeading
        compact
        icon={<CheckCircleIcon className="text-accent" />}
        title={
          <>
            You are
            <br />
            <em className="text-accent">all set</em>
          </>
        }
        subtitle="Your email is confirmed. Sign in to start building your collection."
      />

      <div className="w-full flex flex-col gap-4">
        <SignInButton />
      </div>
    </AuthFormLayout>
  );
}
