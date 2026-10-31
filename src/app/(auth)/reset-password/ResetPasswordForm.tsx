'use client';

import { AuthFormFooter } from '../AuthFormFooter';
import { AuthFormHeading } from '../AuthFormHeading';
import Button from '@/components/Button';
import { FieldLabel } from '@/components/FieldLabel';
import Input from '@/components/Input';
import { Link } from '@/components/Link';
import { passwordRules } from '@/lib/validation';
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
      <AuthFormHeading
        title={
          <>
            Choose a new
            <br />
            <em className="text-accent">password</em>
          </>
        }
        subtitle="At least 8 characters with uppercase, lowercase, number, and special character."
      />

      <form
        className="w-full flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            type="password"
            {...register(
              'password',
              passwordRules('Please enter a new password'),
            )}
            error={errors.password?.message}
          />
        </div>

        <div>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
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

      <AuthFormFooter>
        Back to <Link href="/login">Sign in</Link>
      </AuthFormFooter>
    </>
  );
}
