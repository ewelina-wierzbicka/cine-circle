import { twMerge } from '@/lib/cn';
import { ComponentProps } from 'react';

type Props = ComponentProps<'label'>;

/**
 * The mono label above a form field. Stays inline, so the `mb-*` the call site
 * may add behaves the same as it did before this was a component.
 */
export function FieldLabel({ className, ...props }: Props) {
  return (
    <label
      className={twMerge('label-mono text-secondary mb-2', className)}
      {...props}
    />
  );
}
