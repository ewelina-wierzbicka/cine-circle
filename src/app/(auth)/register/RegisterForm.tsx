'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { register as registerAction } from '@/services/auth';
import { RegistrationData } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export function RegisterForm() {
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegistrationData>();

  const onSubmit = async (data: RegistrationData) => {
    setIsPending(true);
    const result = await registerAction(data.email, data.password);
    if (result?.error) {
      toast.error(result.error || 'Failed to register. Please try again.');
    }
    setIsPending(false);
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-6xl tracking-[-0.02em] leading-[1.1] mb-3">
          Create your
          <br />
          <em className="text-mint">circle</em>
        </h1>
        <p className="text-base text-secondary">
          Track every film. Share your taste.
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

        <div>
          <label
            htmlFor="password"
            className="font-mono text-sm uppercase tracking-[0.14em] text-secondary mb-2"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            {...register('password', {
              required: 'Please enter a password',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
                message:
                  'Password must contain uppercase, lowercase, number, and special character',
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
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              validate: (value) => {
                if (!value) return 'Please confirm your password';
                const password = getValues('password');
                return value === password || 'Passwords do not match';
              },
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button
          type="submit"
          color="mint"
          className="mt-3"
          disabled={isPending}
        >
          CREATE ACCOUNT
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-mint hover:opacity-80 transition-opacity"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
