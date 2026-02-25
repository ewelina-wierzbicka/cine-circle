import { FC } from 'react';

type Props = {
  text: string;
  handleClick?: () => void;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
  className?: string;
};

const Button: FC<Props> = ({
  text,
  handleClick,
  type,
  variant,
  size = 'medium',
  className,
}) => {
  return (
    <button
      type={type}
      onClick={handleClick}
      className={`w-full ${size === 'medium' ? 'h-15' : 'h-12'} rounded-3xl text-dark font-bold uppercase cursor-pointer ${variant === 'secondary' ? 'bg-secondary' : 'bg-primary'} ${className ? className : ''}`}
    >
      {text}
    </button>
  );
};

export default Button;
