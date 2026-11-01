import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function InboxNotice({ children }: Props) {
  return (
    <div className="w-full flex flex-col gap-4">
      <p className="text-sm text-secondary">{children}</p>

      <div className="mt-1 p-3.5 rounded-xl bg-bg2 border border-white/[0.07]">
        <p className="label-mono text-secondary mb-1">
          Didn&apos;t receive it?
        </p>
        <p className="text-sm text-secondary">
          Check your spam folder. It may take a few minutes to arrive.
        </p>
      </div>
    </div>
  );
}
