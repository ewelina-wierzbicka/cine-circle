'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { UserProfile } from '@/types';
import {
  updateDisplayName,
  getAvatarUploadUrl,
  updateAvatarUrl,
} from '@/services/updateProfile';
import { updateEmail, updatePassword, deleteAccount } from '@/services/account';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

type Props = {
  profile: UserProfile;
  email: string;
};

export function ProfileForm({ profile, email }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const [displayName, setDisplayName] = useState(profile.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [newEmail, setNewEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (confirmDelete) confirmRef.current?.focus();
  }, [confirmDelete]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Avatar must be a JPEG, PNG, or WebP image');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Avatar must be 2MB or smaller');
      e.target.value = '';
      return;
    }

    setSaving('avatar');
    try {
      const { signedUrl, publicUrl } = await getAvatarUploadUrl(file.name);

      await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await updateAvatarUrl(publicUrl);
      setAvatarUrl(publicUrl + '?t=' + Date.now());
      toast.success('Avatar updated');
      router.refresh();
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveName = async () => {
    setSaving('name');
    try {
      await updateDisplayName(displayName);
      toast.success('Name updated');
      router.refresh();
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveEmail = async () => {
    setSaving('email');
    const result = await updateEmail(newEmail);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Confirmation email sent');
    }
    setSaving(null);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving('password');
    const result = await updatePassword(currentPassword, newPassword);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaving(null);
  };

  const handleDeleteAccount = async () => {
    setSaving('delete');
    try {
      await deleteAccount();
    } catch {
      toast.error('Failed to delete account');
      setSaving(null);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Avatar */}
      <section className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-20 h-20 rounded-full overflow-hidden bg-bg2 border border-white/[0.07] cursor-pointer shrink-0 group"
          disabled={saving === 'avatar'}
          aria-label="Change avatar"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 40 40"
              className="w-10 h-10 text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <circle cx="20" cy="15" r="6" fill="currentColor" />
              <path d="M10 30a10 6 0 0 1 20 0" fill="currentColor" />
            </svg>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs text-white font-medium">Change</span>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
          aria-label="Upload avatar image"
        />
        <div>
          <p className="text-sm text-secondary">Click to change avatar</p>
        </div>
      </section>

      {/* Display Name */}
      <Section title="Display name" labelFor="displayName">
        <Input
          id="displayName"
          value={displayName}
          handleChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          maxLength={50}
        />
        <Button
          handleClick={handleSaveName}
          disabled={
            saving === 'name' || displayName === (profile.display_name ?? '')
          }
          size="small"
          className="mt-3 w-auto px-6"
        >
          {saving === 'name' ? 'Saving...' : 'Save'}
        </Button>
      </Section>

      {/* Email */}
      <Section title="Email" labelFor="email">
        <Input
          id="email"
          type="email"
          value={newEmail}
          handleChange={(e) => setNewEmail(e.target.value)}
        />
        <p className="text-xs text-secondary mt-1">
          A confirmation link will be sent to the new address.
        </p>
        <Button
          handleClick={handleSaveEmail}
          disabled={saving === 'email' || newEmail === email || !newEmail}
          size="small"
          className="mt-3 w-auto px-6"
        >
          {saving === 'email' ? 'Saving...' : 'Update email'}
        </Button>
      </Section>

      {/* Password */}
      <Section title="Change password">
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="currentPassword" className="sr-only">
              Current password
            </label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              handleChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="sr-only">
              New password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              handleChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              handleChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <Button
          handleClick={handleChangePassword}
          disabled={
            saving === 'password' ||
            !currentPassword ||
            !newPassword ||
            !confirmPassword
          }
          size="small"
          className="mt-3 w-auto px-6"
        >
          {saving === 'password' ? 'Saving...' : 'Change password'}
        </Button>
      </Section>

      {/* Delete Account */}
      <Section title="Danger zone">
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          {!confirmDelete ? (
            <>
              <p className="text-sm text-secondary mb-3">
                Permanently delete your account and all data.
              </p>
              <Button
                handleClick={() => setConfirmDelete(true)}
                size="small"
                className="w-auto px-6 bg-red-500/80 hover:bg-red-500 text-white"
              >
                Delete account
              </Button>
            </>
          ) : (
            <div
              ref={confirmRef}
              tabIndex={-1}
              role="alertdialog"
              aria-label="Confirm account deletion"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setConfirmDelete(false);
              }}
              className="outline-none"
            >
              <p id="confirm-delete-desc" className="text-sm text-red-400 mb-3 font-medium">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  handleClick={handleDeleteAccount}
                  disabled={saving === 'delete'}
                  size="small"
                  className="w-auto px-6 bg-red-500 text-white"
                >
                  {saving === 'delete' ? 'Deleting...' : 'Yes, delete'}
                </Button>
                <Button
                  handleClick={() => setConfirmDelete(false)}
                  variant="outlined"
                  size="small"
                  className="w-auto px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  labelFor,
  children,
}: {
  title: string;
  labelFor?: string;
  children: React.ReactNode;
}) {
  const headingClass =
    'font-mono text-sm uppercase tracking-[0.14em] text-secondary mb-3';
  return (
    <section>
      {labelFor ? (
        <label htmlFor={labelFor} className={`block ${headingClass}`}>
          {title}
        </label>
      ) : (
        <h2 className={headingClass}>{title}</h2>
      )}
      {children}
    </section>
  );
}
