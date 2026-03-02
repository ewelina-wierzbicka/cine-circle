import { FC } from 'react';

type Props = {
  text: string;
  handleClick?: () => void;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
  className?: string;
  disabled?: boolean;
};

const Button: FC<Props> = ({
  text,
  handleClick,
  type = 'button',
  variant,
  size = 'medium',
  className,
  disabled,
}) => {
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`w-full ${size === 'medium' ? 'h-15' : 'h-12'} rounded-3xl text-dark font-bold uppercase cursor-pointer ${variant === 'secondary' ? 'bg-secondary' : 'bg-primary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className ? className : ''}`}
    >
      {text}
    </button>
  );
};

export default Button;
