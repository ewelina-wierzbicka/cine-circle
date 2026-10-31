'use client';

import { AuthFormFooter } from '../AuthFormFooter';
import { AuthFormHeading } from '../AuthFormHeading';
import Button from '@/components/Button';
import { FieldLabel } from '@/components/FieldLabel';
import Input from '@/components/Input';
import { Link } from '@/components/Link';
import { PasswordInput } from '@/components/PasswordInput';
import { EMAIL_RULES, passwordRules } from '@/lib/validation';
import { register as registerAction } from '@/services/auth';
import { RegistrationData } from '@/types';
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
      <AuthFormHeading
        title={
          <>
            Your movies.
            <br />
            <em className="text-accent">Your list.</em>
          </>
        }
        subtitle="Track every movie. Build your list."
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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            {...register('password', passwordRules('Please enter a password'))}
            error={errors.password?.message}
          />
        </div>

        <div>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
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

        <Button type="submit" className="mt-3" disabled={isPending}>
          CREATE ACCOUNT
        </Button>
        <p className="text-sm text-secondary text-center mt-2">
          By creating an account, you agree to our{' '}
          <Link href="/terms">Terms of Service</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </form>

      <AuthFormFooter>
        Already have an account? <Link href="/login">Sign in</Link>
      </AuthFormFooter>
    </>
  );
}
