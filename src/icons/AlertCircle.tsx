type Props = {
  className?: string;
};

export function AlertCircleIcon({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <circle cx="28" cy="28" r="22" strokeWidth="1.6" />
      <path d="M28 17v14" strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="38" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
