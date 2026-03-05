import { twMerge } from '@/lib/cn';

type Props = {
  text: string;
  handleClick?: () => void;
  type?: 'submit' | 'button';
  color?: 'primary' | 'secondary';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  className?: string;
  disabled?: boolean;
};

export default function Button({
  text,
  handleClick,
  type = 'button',
  color = "primary",
  variant = "filled",
  size = 'medium',
  className,
  disabled,
}: Props) {
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(
        'w-full rounded-3xl font-bold uppercase cursor-pointer',
        size === 'medium' ? 'h-15' : 'h-12',
        variant === 'outlined'
          ? 'text-primary border border-primary hover:bg-primary/10'
          : twMerge('text-dark', color === 'secondary' ? 'bg-secondary' : 'bg-primary'),
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {text}
    </button>
  );
}
