import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FieldLabel } from '@/components/FieldLabel';
import Input from '@/components/Input';

describe('Input', () => {
  it('is wired to its label by htmlFor and id', () => {
    render(
      <>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" />
      </>,
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email');
  });

  it('renders the error message', () => {
    render(<Input id="email" error="Please enter a valid email address" />);
    expect(
      screen.getByText('Please enter a valid email address'),
    ).toBeInTheDocument();
  });
});
