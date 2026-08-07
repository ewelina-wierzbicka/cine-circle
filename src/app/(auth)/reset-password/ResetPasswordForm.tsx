'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { Link } from '@/components/Link';
import { signOutOnly, updatePasswordAfterReset } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = { password: string; confirmPassword: string };

export function ResetPasswordForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    const result = await updatePasswordAfterReset(data.password);
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    } else {
      toast.success('Password updated. Please sign in.');
      await signOutOnly();
      router.push('/login');
    }
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-6xl font-normal tracking-[-0.02em] leading-[1.1] mb-3">
          Choose a new
          <br />
          <em className="text-mint">password</em>
        </h1>
        <p className="text-base text-secondary">
          At least 8 characters with uppercase, lowercase, number, and special
          character.
        </p>
      </div>

      <form
        className="w-full flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label
            htmlFor="password"
            className="font-mono text-sm uppercase tracking-[0.14em] text-secondary mb-2"
          >
            New password
          </label>
          <Input
            id="password"
            type="password"
            {...register('password', {
              required: 'Please enter a new password',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            error={errors.password?.message}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="font-mono text-sm uppercase tracking-[0.14em] text-secondary mb-2"
          >
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === getValues('password') || 'Passwords do not match',
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button type="submit" className="mt-3" disabled={isPending}>
          SET NEW PASSWORD
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Back to <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
