import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Request a password reset link for your MidnightFrame account.',
};

import AuthFormLayout from '../AuthFormLayout';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthFormLayout>
      <ForgotPasswordForm />
    </AuthFormLayout>
  );
}
