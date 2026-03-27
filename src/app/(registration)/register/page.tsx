'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { register as registerAction } from '@/services/auth';
import { RegistrationData } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import AuthFormLayout from '../AuthFormLayout';

export default function Page() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationData>();

  const onSubmit = async (data: RegistrationData) => {
    if (data.password !== data.confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }
    setServerError(null);
    setIsPending(true);
    const result = await registerAction(data.email, data.password);
    if (result?.error) {
      console.log(result?.error);
      if (
        result.error.toLowerCase().includes('user already registered') ||
        result.error.toLowerCase().includes('email')
      ) {
        setServerError(
          'An account with this email already exists. Please log in or use a different email.',
        );
      } else {
        setServerError(result.error);
      }
      setIsPending(false);
    }
  };

  return (
    <AuthFormLayout>
      <h3 className="mb-24 text-2xl font-semibold text-center">
        Let&apos;s watch some movies!
      </h3>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <p className="mb-6 text-sm text-red-400">{serverError}</p>
        )}
        <label htmlFor="email">Email</label>
        <div className="mt-3 lg:mt-6 mb-8">
          <Input
            id="email"
            type="email"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            })}
            error={errors.email?.message}
          />
        </div>
        <label htmlFor="password">Password</label>
        <div className="mt-3 lg:mt-6 mb-8">
          <Input
            id="password"
            type="password"
            {...register('password', {
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
        <label htmlFor="confirmPassword">Confirm password</label>
        <div className="mt-3 lg:mt-6 mb-8">
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              // No validation here; handled in onSubmit
            })}
            error={errors.confirmPassword?.message}
          />
        </div>
        <Button
          type="submit"
          text={'REGISTER'}
          size="small"
          className="mt-8"
          disabled={isPending}
        />
      </form>
      <Link
        href="/login"
        className="mt-8 text-center text-sm text-primary hover:underline"
      >
        Already have an account? Login
      </Link>
    </AuthFormLayout>
  );
}
