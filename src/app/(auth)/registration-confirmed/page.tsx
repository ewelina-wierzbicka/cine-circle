import { CheckCircleIcon } from '@/icons/CheckCircle';
import AuthFormLayout from '../AuthFormLayout';
import { SignInButton } from './SignInButton';

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
        <p className="text-sm text-secondary leading-relaxed">
          Your email is confirmed. Sign in to start building your collection.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <SignInButton />
      </div>
    </AuthFormLayout>
  );
}
