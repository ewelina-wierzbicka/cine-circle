import SearchIcon from '@/icons/MagnifyingGlass';
import { forwardRef } from 'react';

type Props = {
  id: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  variant?: 'search' | 'rating';
  className?: string;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleIconClick?: () => void;
  placeholder?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      handleChange,
      type = 'text',
      variant,
      className,
      handleKeyDown,
      handleIconClick,
      placeholder,
      error,
      ...rest
    },
    ref,
  ) => {
    return (
      <>
        <div className="relative w-full">
          <input
            type={type}
            id={id}
            className={`rounded-3xl bg-neutral-300/20 pl-6 pr-1 w-full h-10 outline-none focus:ring-4 focus:ring-neutral-300/20 focus:ring-offset-1 focus:ring-offset-primary/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className ?? ''}`}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={ref}
            {...rest}
          />
          {variant === 'search' && (
            <button
              type="button"
              aria-label="Search"
              onClick={handleIconClick}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
          {variant === 'rating' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">/10</div>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </>
    );
  },
);

Input.displayName = 'Input';

export default Input;
