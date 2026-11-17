import { twMerge } from '@/lib/cn';

type Props = React.LiHTMLAttributes<HTMLLIElement> & {
  selected?: boolean;
};

export function MenuOption({ selected, className, children, ...rest }: Props) {
  return (
    <li
      className={twMerge(
        'px-3.5 py-4 text-sm cursor-pointer transition-colors select-none text-secondary hover:text-primary border-b border-secondary/15 last:border-0',
        selected && 'text-primary bg-bg3',
        className,
      )}
      {...rest}
    >
      {children}
    </li>
  );
}
