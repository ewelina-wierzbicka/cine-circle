import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FieldLabel } from '@/components/FieldLabel';
import Textarea from '@/components/Textarea';

describe('Textarea', () => {
  it('is wired to its label by htmlFor and id', () => {
    render(
      <>
        <FieldLabel htmlFor="review">Any thoughts?</FieldLabel>
        <Textarea id="review" />
      </>,
    );
    expect(screen.getByLabelText('Any thoughts?')).toHaveAttribute(
      'id',
      'review',
    );
  });

  it('renders the error message', () => {
    render(<Textarea id="review" error="Please use up to 1000 characters." />);
    expect(
      screen.getByText('Please use up to 1000 characters.'),
    ).toBeInTheDocument();
  });
});
