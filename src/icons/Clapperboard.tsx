type Props = {
  className?: string;
};

export function ClapperboardIcon({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="6" y="14" width="44" height="32" rx="6" strokeWidth="1.6" />
      <path
        d="M6 22h44M14 14l6 8M28 14l6 8M42 14l-6 8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M20 28l16 6-16 6z"
        fill="currentColor"
        stroke="none"
        opacity="0.7"
      />
    </svg>
  );
}
