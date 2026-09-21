import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an account',
  description:
    'Create a free MidnightFrame account and start tracking the movies and series you watch.',
};

import AuthFormLayout from '../AuthFormLayout';
import { RegisterForm } from './RegisterForm';

export default function Page() {
  return (
    <AuthFormLayout>
      <RegisterForm />
    </AuthFormLayout>
  );
}
