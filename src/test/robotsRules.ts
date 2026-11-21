import robots from '@/app/robots';

/** Every disallow rule in robots.ts, flattened across user-agent groups. */
export function disallowRules(): string[] {
  const { rules } = robots();
  return (Array.isArray(rules) ? rules : [rules]).flatMap((rule) =>
    rule.disallow === undefined
      ? []
      : Array.isArray(rule.disallow)
        ? rule.disallow
        : [rule.disallow],
  );
}

/** Robots rules match by path prefix. */
export function isDisallowed(path: string): boolean {
  return disallowRules().some((rule) => path.startsWith(rule));
}
