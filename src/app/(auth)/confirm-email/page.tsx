import { EnvelopeIcon } from '@/icons/Envelope';
import AuthFormLayout from '../AuthFormLayout';
import { Link } from '@/components/Link';

export default function ConfirmEmailPage() {
  return (
    <AuthFormLayout>
      <div className="mb-8">
        <div className="mb-5 w-10 h-10 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center">
          <EnvelopeIcon className="text-mint" />
        </div>

        <h1 className="font-serif text-4xl font-normal tracking-[-0.02em] leading-[1.1] mb-2">
          Check your
          <br />
          <em className="text-mint">inbox</em>
        </h1>
        <p className="text-sm text-secondary">
          One step left to join the circle.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <p className="text-sm text-secondary leading-relaxed">
          We sent a confirmation link to your email address. Click the link to
          activate your account.
        </p>

        <div className="mt-1 p-3.5 rounded-xl bg-bg2 border border-white/[0.07]">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-secondary mb-1">
            Didn&apos;t receive it?
          </p>
          <p className="text-sm text-secondary leading-relaxed">
            Check your spam folder. It may take a few minutes to arrive.
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-secondary">
        Back to <Link href="/login">Sign in</Link>
      </p>
    </AuthFormLayout>
  );
}
