type Props = { className?: string };

export function LockXIcon({ className }: Props) {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      className={className}
    >
      <rect
        x="14"
        y="24"
        width="24"
        height="18"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M18 24v-6a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M22 24l8 14M30 24l-8 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
