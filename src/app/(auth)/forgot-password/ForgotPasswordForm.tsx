'use client';

import { AuthFormFooter } from '../AuthFormFooter';
import { AuthFormHeading } from '../AuthFormHeading';
import { InboxNotice } from '../InboxNotice';
import Button from '@/components/Button';
import { FieldLabel } from '@/components/FieldLabel';
import Input from '@/components/Input';
import { Link } from '@/components/Link';
import { EnvelopeIcon } from '@/icons/Envelope';
import { EMAIL_RULES } from '@/lib/validation';
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
          subtitle="A reset link is on its way."
        />

        <InboxNotice>
          We sent a password reset link to your email address. Click the link to
          choose a new password.
        </InboxNotice>

        <AuthFormFooter>
          Back to <Link href="/login">Sign in</Link>
        </AuthFormFooter>
      </>
    );
  }

  return (
    <>
      <AuthFormHeading
        title={
          <>
            Reset your
            <br />
            <em className="text-accent">password</em>
          </>
        }
        subtitle="Enter your email and we'll send a reset link."
      />

      <form
        className="w-full flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            {...register('email', EMAIL_RULES)}
            error={errors.email?.message}
          />
        </div>

        <Button type="submit" className="mt-3" disabled={isPending}>
          SEND RESET LINK
        </Button>
      </form>

      <AuthFormFooter>
        Back to <Link href="/login">Sign in</Link>
      </AuthFormFooter>
    </>
  );
}
