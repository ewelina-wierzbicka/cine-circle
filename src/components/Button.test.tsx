import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from '@/components/Button';

describe('Button', () => {
  it('defaults to type="button"', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('calls handleClick on click', () => {
    const handleClick = vi.fn();
    render(<Button handleClick={handleClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('blocks handleClick when disabled and looks disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button handleClick={handleClick} disabled>
        Go
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Go' });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    // The plan asks for the disabled styling; these two are its whole contract.
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});
