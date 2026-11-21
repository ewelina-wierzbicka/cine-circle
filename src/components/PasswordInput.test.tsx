import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FieldLabel } from '@/components/FieldLabel';
import { PasswordInput } from '@/components/PasswordInput';

function renderField() {
  render(
    <>
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <PasswordInput id="password" />
    </>,
  );
}

describe('PasswordInput', () => {
  it('toggles the input between password and text', () => {
    renderField();
    const input = screen.getByLabelText('Password', { exact: true });
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  // The e2e suite targets getByLabel('Password', { exact: true }); the toggle's
  // own label must not collide with it.
  it('keeps a single control labelled exactly Password', () => {
    renderField();
    expect(screen.getAllByLabelText('Password', { exact: true })).toHaveLength(
      1,
    );
  });
});
