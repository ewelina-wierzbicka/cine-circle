import { Link } from '@/components/Link';
import { CheckCircleIcon } from '@/icons/CheckCircle';

export default function RegistrationConfirmedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="mb-5 w-12 h-12 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center">
        <CheckCircleIcon className="text-mint" />
      </div>

      <h1 className="font-serif text-4xl font-normal tracking-[-0.02em] leading-[1.1] mb-3">
        You&apos;re all
        <br />
        <em className="text-mint">set</em>
      </h1>

      <p className="text-sm text-secondary mb-8">
        Your account is confirmed. Start building your collection.
      </p>

      <Link href="/" className="text-sm text-mint hover:opacity-80">
        Go to home
      </Link>
    </div>
  );
}
