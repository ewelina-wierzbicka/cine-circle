'use client';

import { AuthFormFooter } from '../AuthFormFooter';
import { AuthFormHeading } from '../AuthFormHeading';
import Button from '@/components/Button';
import { FieldLabel } from '@/components/FieldLabel';
import Input from '@/components/Input';
import { Link } from '@/components/Link';
import { PasswordInput } from '@/components/PasswordInput';
import { EMAIL_RULES } from '@/lib/validation';
import { login } from '@/services/auth';
import { RegistrationData } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rurl = searchParams.get('rurl') ?? undefined;
  const errorParam = searchParams.get('error');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (errorParam === 'reset_failed') {
      toast.error('Password reset failed. Please try again.');
      router.replace(rurl ? `/login?rurl=${rurl}` : '/login');
    } else if (errorParam === 'confirm_failed') {
      toast.error('Email confirmation failed. Please try again.');
      router.replace(rurl ? `/login?rurl=${rurl}` : '/login');
    }
    // fire once on mount: show toast then strip ?error= so it doesn't refire on re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
      <AuthFormHeading
        title={
          <>
            Welcome
            <br />
            <em className="text-accent">back</em>
          </>
        }
        subtitle="Sign in to your collection"
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel htmlFor="password" className="mb-0">
              Password
            </FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-secondary hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" {...register('password')} />
        </div>

        <Button type="submit" className="mt-3" disabled={isPending}>
          SIGN IN
        </Button>
      </form>

      <AuthFormFooter>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </AuthFormFooter>
    </>
  );
}
