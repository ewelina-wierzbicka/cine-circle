'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import ChevronIcon from '@/icons/Chevron';
import { twMerge } from '@/lib/cn';
import { deleteAccount, updateEmail, updatePassword } from '@/services/account';
import { logout } from '@/services/auth';
import { updateDisplayName } from '@/services/updateProfile';
import { UserProfile } from '@/types';
import { useState } from 'react';

type Props = {
  profile: UserProfile | null;
  email: string;
};

export function ProfileContent({ profile, email }: Props) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [isEditingName, setIsEditingName] = useState(false);

  const [emailOpen, setEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initials = displayName
    ? displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (email[0]?.toUpperCase() ?? '?');

  const handleSaveName = async () => {
    await updateDisplayName(displayName);
    setIsEditingName(false);
  };

  const handleUpdateEmail = async () => {
    setEmailError('');
    setEmailLoading(true);
    const result = await updateEmail(newEmail);
    setEmailLoading(false);
    if (result.error) {
      setEmailError(result.error);
    } else {
      setNewEmail('');
      setEmailOpen(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    const result = await updatePassword(currentPassword, newPassword);
    setPasswordLoading(false);
    if (result.error) {
      setPasswordError(result.error);
    } else {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    await deleteAccount();
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10 md:py-16 animate-fade-up min-h-full flex flex-col justify-center">
      <h1 className="text-4xl md:text-5xl mb-8 font-serif">
        <span>Your </span>
        <em className="text-mint">Profile</em>
      </h1>

      {/* Profile Card */}
      <div className="bg-bg2 border border-secondary/25 rounded-2xl p-6 mb-4 flex items-center gap-6">
        <div className="w-22 h-22 rounded-full border-2 border-mint flex items-center justify-center shrink-0">
          <span className="font-serif text-3xl text-mint">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary mb-1">
            Display name
          </p>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                id="display-name"
                value={displayName}
                handleChange={(e) => setDisplayName(e.target.value)}
                className="h-9 text-base"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
              />
              <button
                type="button"
                onClick={() => void handleSaveName()}
                className="text-mint text-sm font-mono uppercase tracking-wider cursor-pointer hover:opacity-80"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 group"
            >
              <span className="text-xl font-sans text-primary">
                {displayName || 'Set name'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-secondary group-hover:text-mint transition-colors"
              >
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Account Card */}
      <div className="bg-bg2 border border-white/[0.07] rounded-2xl p-6 mb-4">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary mb-4">
          Account
        </p>

        {/* Email row */}
        <div className="border-b border-white/[0.07] pb-4 mb-4">
          <button
            type="button"
            onClick={() => setEmailOpen(!emailOpen)}
            className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0"
          >
            <div className="text-left">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary">
                Email address
              </p>
              <p className="text-primary text-sm mt-0.5">{email}</p>
            </div>
            <ChevronIcon
              className={twMerge(
                'w-5 h-5 text-secondary transition-transform duration-200',
                emailOpen ? 'rotate-90' : '-rotate-90',
              )}
            />
          </button>

          {emailOpen && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary mb-2">
                  New email
                </p>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  handleChange={(e) => setNewEmail(e.target.value)}
                  placeholder={email}
                  error={emailError}
                />
              </div>
              <Button
                handleClick={() => void handleUpdateEmail()}
                disabled={!newEmail || emailLoading}
                className="w-auto px-8"
              >
                Update email
              </Button>
            </div>
          )}
        </div>

        {/* Password row */}
        <div>
          <button
            type="button"
            onClick={() => setPasswordOpen(!passwordOpen)}
            className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0"
          >
            <div className="text-left">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary">
                Password
              </p>
              <p className="text-secondary text-sm mt-0.5 tracking-widest">
                ••••••••
              </p>
            </div>
            <ChevronIcon
              className={twMerge(
                'w-5 h-5 text-secondary transition-transform duration-200',
                passwordOpen ? 'rotate-90' : '-rotate-90',
              )}
            />
          </button>

          {passwordOpen && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary mb-2">
                  Current password
                </p>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  handleChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary mb-2">
                  New password
                </p>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  handleChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary mb-2">
                  Confirm new password
                </p>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  handleChange={(e) => setConfirmPassword(e.target.value)}
                  error={passwordError}
                />
              </div>
              <Button
                handleClick={() => void handleUpdatePassword()}
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  passwordLoading
                }
                variant="outlined"
                className="w-auto px-8"
              >
                Update password
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-bg2 border border-red-400/20 rounded-2xl p-6 mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-red-400 mb-4">
          Danger zone
        </p>

        <button
          type="button"
          onClick={() => setDeleteOpen(!deleteOpen)}
          className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0"
        >
          <div className="text-left">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-red-400">
              Delete account
            </p>
            <p className="text-secondary text-sm mt-0.5">
              Permanently remove your account and data
            </p>
          </div>
          <ChevronIcon
            className={twMerge(
              'w-5 h-5 text-red-400 transition-transform duration-200',
              deleteOpen ? 'rotate-90' : '-rotate-90',
            )}
          />
        </button>

        {deleteOpen && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-secondary">
              This will permanently erase your profile, collection, ratings and
              notes.{' '}
              <strong className="text-primary">This cannot be undone.</strong>
            </p>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-secondary mb-2">
                Type <span className="text-red-400 font-semibold">DELETE</span>{' '}
                to confirm
              </p>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                handleChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <Button
              handleClick={() => void handleDeleteAccount()}
              disabled={deleteConfirm !== 'DELETE' || deleteLoading}
              variant="outlined"
              className="w-auto px-8 border-red-400/50 text-red-400 hover:bg-red-400/5"
            >
              Delete my account
            </Button>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="flex justify-center">
        <Button
          handleClick={() => void logout()}
          variant="outlined"
          className="w-auto px-16"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
