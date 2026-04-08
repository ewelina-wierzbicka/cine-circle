'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { login } from '@/services/auth';
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
  } = useForm<RegistrationData>();

  const onSubmit = async (data: RegistrationData) => {
    setIsPending(true);
    const result = await login(data.email, data.password);
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    }
  };

  return (
    <AuthFormLayout>
      <h3 className="mb-24 text-2xl font-semibold text-center">
        Welcome back!
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
          <Input id="password" type="password" {...register('password')} />
        </div>
        <Button
          type="submit"
          text={'LOGIN'}
          size="small"
          className="mt-8"
          disabled={isPending}
        />
      </form>
      <Link
        href="/register"
        className="mt-8 text-center text-sm text-primary hover:underline"
      >
        Don&apos;t have an account? Register
      </Link>
    </AuthFormLayout>
  );
}
