import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function AuthFormFooter({ children }: Props) {
  return <p className="mt-6 text-center text-sm text-secondary">{children}</p>;
}
