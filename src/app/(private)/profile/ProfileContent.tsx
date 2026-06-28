'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import ChevronIcon from '@/icons/Chevron';
import { twMerge } from '@/lib/cn';
import { deleteAccount, updateEmail, updatePassword } from '@/services/account';
import { logout } from '@/services/auth';
import { createClient } from '@/lib/supabase/client';
import { updateAvatarPath, updateDisplayName } from '@/services/updateProfile';
import { UserProfile } from '@/types';
import { useRef, useState } from 'react';

type Props = {
  profile: UserProfile | null;
  email: string;
};

export function ProfileContent({ profile, email }: Props) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [avatarError, setAvatarError] = useState('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');

    const MAX_SIZE = 1024 * 1024;
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError('Only JPEG, PNG, WebP, and GIF images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setAvatarError('Image must be under 1 MB.');
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatar')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setAvatarError(uploadError.message);
      return;
    }

    const { avatarUrl: newUrl } = await updateAvatarPath(path);
    setAvatarUrl(newUrl);
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
        <div>
          <div className="relative shrink-0">
            <div className="w-22 h-22 rounded-full border-2 border-mint flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif text-3xl text-primary">
                  {initials}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-bg2 border border-secondary/50 flex items-center justify-center cursor-pointer hover:bg-bg3 transition-colors"
              aria-label="Change avatar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 text-mint"
              >
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarChange(e)}
            />
          </div>
          {avatarError && (
            <p className="text-red-400 text-xs mb-2">{avatarError}</p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary mb-3">
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
              <button
                type="button"
                onClick={() => {
                  setDisplayName(profile?.display_name ?? '');
                  setIsEditingName(false);
                }}
                className="ml-2 text-sm text-secondary hover:text-primary transition-colors cursor-pointer"
                aria-label="Cancel editing"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-4 cursor-pointer bg-transparent border-none p-0 group"
            >
              <span className="text-2xl font-sans font-semibold text-primary">
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
        <p className="font-mono text-base uppercase tracking-[0.15em] text-secondary mb-6">
          Account
        </p>

        {/* Email row */}
        <div className="border-b border-white/[0.07] pb-4 mb-4">
          <button
            type="button"
            onClick={() => setEmailOpen(!emailOpen)}
            className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0"
          >
            <div className="text-left pr-2">
              <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary">
                Email address
              </p>
              <p className="text-primary text-sm mt-2">{email}</p>
            </div>
            <ChevronIcon
              className={twMerge(
                'w-5 h-5 text-secondary transition-transform duration-200',
                emailOpen ? 'rotate-90' : '-rotate-90',
              )}
            />
          </button>

          {emailOpen && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary mb-2">
                  New email
                </p>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  handleChange={(e) => setNewEmail(e.target.value)}
                  error={emailError}
                />
              </div>
              <Button
                handleClick={() => void handleUpdateEmail()}
                disabled={!newEmail || emailLoading}
                className="w-auto"
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
              <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary">
                Password
              </p>
              {!passwordOpen && (
                <p className="text-secondary text-sm mt-2 tracking-widest">
                  ••••••••
                </p>
              )}
            </div>
            <ChevronIcon
              className={twMerge(
                'w-5 h-5 text-secondary transition-transform duration-200',
                passwordOpen ? 'rotate-90' : '-rotate-90',
              )}
            />
          </button>

          {passwordOpen && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary mb-2">
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
                <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary mb-2">
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
                <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary mb-2">
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
                className="w-auto"
              >
                Update password
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-bg2 border border-red-400/20 rounded-2xl p-6 mb-8">
        <p className="font-mono text-base uppercase tracking-[0.15em] text-red-400 mb-6">
          Danger zone
        </p>

        <button
          type="button"
          onClick={() => setDeleteOpen(!deleteOpen)}
          className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0"
        >
          <div className="text-left">
            <p className="font-mono text-sm uppercase tracking-[0.15em] text-red-400">
              Delete account
            </p>
            <p className="text-secondary text-sm mt-4">
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
          <div className="mt-2 space-y-3">
            <p className="text-sm text-secondary">
              This will permanently erase your profile, collection, ratings and
              notes.
            </p>
            <p className="text-primary font-semibold text-sm">
              This cannot be undone.
            </p>
            <div className="mt-6">
              <p className="font-mono text-sm uppercase tracking-[0.15em] text-secondary mb-5">
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
              className="w-auto text-primary bg-red-800 hover:bg-red-900 mt-2 "
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
