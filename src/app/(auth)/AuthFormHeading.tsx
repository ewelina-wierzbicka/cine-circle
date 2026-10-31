import { ReactNode } from 'react';

type Props = {
  /** Optional chip above the title, e.g. an `EnvelopeIcon`. */
  icon?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  /**
   * Smaller title and tighter spacing. Used by the notice screens
   * (confirm email, email confirmed, reset link sent) rather than the forms.
   */
  compact?: boolean;
};

/** The icon, title and subtitle block that opens every auth screen. */
export function AuthFormHeading({ icon, title, subtitle, compact }: Props) {
  return (
    <div className={compact ? 'mb-8' : 'mb-10'}>
      {icon && (
        <div className="mb-5 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h1
        className={compact ? 'title-serif text-4xl mb-2' : 'title-serif mb-3'}
      >
        {title}
      </h1>
      <p
        className={
          compact ? 'text-sm text-secondary' : 'text-base text-secondary'
        }
      >
        {subtitle}
      </p>
    </div>
  );
}
