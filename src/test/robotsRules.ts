async function robotsBody(): Promise<string> {
  const { GET } = await import('@/app/robots.txt/route');
  return GET().text();
}

/** Every disallow rule in the served robots.txt, in file order. */
export async function disallowRules(): Promise<string[]> {
  const body = await robotsBody();
  return [...body.matchAll(/^Disallow:[ \t]*(\S+)[ \t]*$/gm)].map((m) => m[1]);
}

/** Robots rules match by path prefix. */
export async function isDisallowed(path: string): Promise<boolean> {
  const rules = await disallowRules();
  return rules.some((rule) => path.startsWith(rule));
}
