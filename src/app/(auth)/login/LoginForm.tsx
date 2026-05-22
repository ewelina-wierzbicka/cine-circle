'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { login } from '@/services/auth';
import { RegistrationData } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export function LoginForm() {
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
    <>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-normal tracking-[-0.02em] leading-[1.1] mb-2">
          Welcome
          <br />
          <em className="text-mint">back</em>
        </h1>
        <p className="text-[13px] text-secondary">Sign in to your collection</p>
      </div>

      <form
        className="w-full flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label
            htmlFor="email"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim mb-2"
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
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim mb-2"
          >
            Password
          </label>
          <Input id="password" type="password" {...register('password')} />
        </div>

        <Button
          type="submit"
          color="mint"
          className="mt-3"
          disabled={isPending}
        >
          SIGN IN
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-dim">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-mint hover:opacity-80 transition-opacity"
        >
          Register
        </Link>
      </p>
    </>
  );
}
