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
