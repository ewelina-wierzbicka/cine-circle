import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set a new password',
  description: 'Choose a new password for your MidnightFrame account.',
};

import AuthFormLayout from '../AuthFormLayout';
import { ResetPasswordForm } from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthFormLayout>
      <ResetPasswordForm />
    </AuthFormLayout>
  );
}
