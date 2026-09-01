import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { copyFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// GitHub Pages project site serves the app under /lucky-real-estate/
// (https://rkdghwnd.github.io/lucky-real-estate/). Override with
// VITE_BASE_PATH (e.g. '/' when serving from a custom domain or S3+CloudFront).
const basePath = process.env.VITE_BASE_PATH ?? '/lucky-real-estate/';

// GitHub Pages has no server-side SPA fallback: a deep link like
// /lucky-real-estate/listings/foo would return a real 404. Copying the built
// index.html to 404.html makes GitHub serve the SPA for unknown paths, and
// React Router (with the matching basename) renders the right route.
// .nojekyll stops GitHub from running Jekyll (keeps files as-is).
function githubPagesFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const outDir = fileURLToPath(new URL('./dist', import.meta.url));
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
      writeFileSync(resolve(outDir, '.nojekyll'), '');
    },
  };
}

// Vite SPA build. Output: dist/ (GitHub Pages via Actions; also works on S3 + CloudFront).
// Alias mirrors tsconfig/vitest so `@/` resolves to ./src.
export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), githubPagesFallback()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
