import { twMerge } from '@/lib/cn';

type Props = React.LiHTMLAttributes<HTMLLIElement> & {
  selected?: boolean;
};

/**
 * The shared row inside a dropdown panel: `Select`, `RatingMultiSelect` and the
 * `Header` user menu. Only the look is shared. The role, the keyboard handling
 * and the ARIA state stay at the call site, because a listbox option and a
 * menuitem need different ones.
 */
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
