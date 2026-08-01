'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { Link } from '@/components/Link';
import { login } from '@/services/auth';
import { RegistrationData } from '@/types';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export function LoginForm() {
  const searchParams = useSearchParams();
  const rurl = searchParams.get('rurl') ?? undefined;
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationData>();

  const onSubmit = async (data: RegistrationData) => {
    setIsPending(true);
    const result = await login(data.email, data.password, rurl);
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-6xl font-normal tracking-[-0.02em] leading-[1.1] mb-3">
          Welcome
          <br />
          <em className="text-mint">back</em>
        </h1>
        <p className="text-base text-secondary">Sign in to your collection</p>
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
          <Input id="password" type="password" {...register('password')} />
        </div>

        <Button type="submit" className="mt-3" disabled={isPending}>
          SIGN IN
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </>
  );
}
