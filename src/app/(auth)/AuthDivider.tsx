/** Hairline rule with a centred "or", between the Google button and the email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <span className="flex-1 border-t border-secondary/25" />
      <span className="font-mono text-sm uppercase tracking-[0.18em] text-secondary">
        or
      </span>
      <span className="flex-1 border-t border-secondary/25" />
    </div>
  );
}
