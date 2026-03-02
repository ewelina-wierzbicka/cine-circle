import { forwardRef } from 'react';

type Props = {
  id: string;
  handleChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ id, handleChange, className, error, ...rest }, ref) => {
    return (
      <>
        <textarea
          id={id}
          className={`rounded-3xl bg-neutral-300/20 p-5 w-full h-48 outline-none focus:ring-4 focus:ring-neutral-300/20 focus:ring-offset-1 focus:ring-offset-primary/40 ${className ?? ''}`}
          onChange={handleChange}
          ref={ref}
          {...rest}
        />
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
