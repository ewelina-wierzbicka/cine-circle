import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirm your email',
  description: 'Check your inbox for the MidnightFrame confirmation link.',
};

import { AuthFormFooter } from '../AuthFormFooter';
import { AuthFormHeading } from '../AuthFormHeading';
import { InboxNotice } from '../InboxNotice';
import { Link } from '@/components/Link';
import { EnvelopeIcon } from '@/icons/Envelope';
import AuthFormLayout from '../AuthFormLayout';

export default function ConfirmEmailPage() {
  return (
    <AuthFormLayout>
      <AuthFormHeading
        compact
        icon={<EnvelopeIcon className="text-accent" />}
        title={
          <>
            Check your
            <br />
            <em className="text-accent">inbox</em>
          </>
        }
        subtitle="One step left to activate your account."
      />

      <InboxNotice>
        We sent a confirmation link to your email address. Click the link to
        activate your account.
      </InboxNotice>

      <AuthFormFooter>
        Back to <Link href="/login">Sign in</Link>
      </AuthFormFooter>
    </AuthFormLayout>
  );
}
