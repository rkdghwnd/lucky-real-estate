/**
 * Resolve a `/public` asset path against the deployed base path.
 *
 * GitHub Pages serves the app under a sub-path (e.g. `/lucky-real-estate/`), so
 * hardcoded absolute paths like `/banner0.jpg` would 404. Vite only applies
 * `base` to bundled assets, not to strings inside JSX — use this helper instead.
 * `import.meta.env.BASE_URL` always ends with `/` (or is `/` on a custom domain).
 */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
