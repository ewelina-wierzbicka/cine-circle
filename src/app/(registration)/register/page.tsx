'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { register as registerAction } from '@/services/auth';
import { RegistrationData } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import AuthFormLayout from '../AuthFormLayout';

export default function Page() {
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
    <AuthFormLayout>
      <h3 className="mb-24 text-2xl font-semibold text-center">
        Let&apos;s watch some movies!
      </h3>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">Email</label>
        <div className="mt-2 lg:mt-6 mb-8">
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
        <label htmlFor="password">Password</label>
        <div className="mt-2 lg:mt-6 mb-8">
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
        <label htmlFor="confirmPassword">Confirm password</label>
        <div className="mt-2 lg:mt-6 mb-8">
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
