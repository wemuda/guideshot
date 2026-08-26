export const docsNavigation = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/getting-started', label: 'Getting started' },
  { href: '/docs/concepts', label: 'Concepts' },
  { href: '/docs/recipes', label: 'Recipes' },
  { href: '/docs/packages', label: 'Packages' },
  { href: '/docs/cli', label: 'CLI' },
  { href: '/docs/security', label: 'Security' },
] as const;

export function docsNeighbors(href: string) {
  const index = docsNavigation.findIndex((item) => item.href === href);
  return {
    previous: index > 0 ? docsNavigation[index - 1] : undefined,
    next:
      index >= 0 && index < docsNavigation.length - 1
        ? docsNavigation[index + 1]
        : undefined,
  };
}
