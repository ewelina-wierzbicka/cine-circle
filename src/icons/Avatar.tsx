type Props = {
  className?: string;
};

export default function AvatarIcon({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="20" cy="15" r="6" fill="currentColor" />
      <path d="M10 30a10 6 0 0 1 20 0" fill="currentColor" />
    </svg>
  );
}
