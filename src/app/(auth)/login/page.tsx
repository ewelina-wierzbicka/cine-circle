import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to MidnightFrame to reach your collection, ratings and reviews.',
};

import AuthFormLayout from '../AuthFormLayout';
import { LoginForm } from './LoginForm';
import { Suspense } from 'react';

export default function Page() {
  return (
    <AuthFormLayout>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthFormLayout>
  );
}
