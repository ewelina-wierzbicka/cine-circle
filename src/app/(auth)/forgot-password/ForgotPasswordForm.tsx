'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { Link } from '@/components/Link';
import { EnvelopeIcon } from '@/icons/Envelope';
import { sendPasswordReset } from '@/services/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = { email: string };

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    const result = await sendPasswordReset(data.email);
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <>
        <div className="mb-8">
          <div className="mb-5 w-10 h-10 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center">
            <EnvelopeIcon className="text-mint" />
          </div>

          <h1 className="font-serif text-4xl font-normal tracking-[-0.02em] leading-[1.1] mb-2">
            Check your
            <br />
            <em className="text-mint">inbox</em>
          </h1>
          <p className="text-sm text-secondary">A reset link is on its way.</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <p className="text-sm text-secondary leading-relaxed">
            We sent a password reset link to your email address. Click the link
            to choose a new password.
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
      </>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-6xl font-normal tracking-[-0.02em] leading-[1.1] mb-3">
          Reset your
          <br />
          <em className="text-mint">password</em>
        </h1>
        <p className="text-base text-secondary">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <form
        className="w-full flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label
            htmlFor="email"
            className="font-mono text-sm uppercase tracking-[0.14em] text-secondary mb-2"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register('email', {
              required: 'Please enter your email address',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            })}
            error={errors.email?.message}
          />
        </div>

        <Button type="submit" className="mt-3" disabled={isPending}>
          SEND RESET LINK
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Back to <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
