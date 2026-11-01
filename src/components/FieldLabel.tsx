import { twMerge } from '@/lib/cn';
import { ComponentProps } from 'react';

type Props = ComponentProps<'label'>;

export function FieldLabel({ className, ...props }: Props) {
  return (
    <label
      className={twMerge('label-mono text-secondary mb-2', className)}
      {...props}
    />
  );
}
