import { Link } from '@/components/Link';
import { CheckCircleIcon } from '@/icons/CheckCircle';
import AuthFormLayout from '../AuthFormLayout';

export default function RegistrationConfirmedPage() {
  return (
    <AuthFormLayout>
      <div className="mb-8">
        <div className="mb-5 w-10 h-10 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center">
          <CheckCircleIcon className="text-mint" />
        </div>

        <h1 className="font-serif text-4xl font-normal tracking-[-0.02em] leading-[1.1] mb-2">
          You are
          <br />
          <em className="text-mint">all set</em>
        </h1>
        <p className="text-sm text-secondary">
          Your account is confirmed and active.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <p className="text-sm text-secondary leading-relaxed">
          Welcome to MidnightFrame. Track what you watch, rate it, and share
          your collection with friends.
        </p>

        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-xl bg-mint px-8 py-3 text-base font-semibold uppercase tracking-[0.08em] text-dark transition-opacity hover:opacity-[0.82] cursor-pointer md:text-sm lg:text-base"
        >
          Start exploring
        </Link>
      </div>
    </AuthFormLayout>
  );
}
