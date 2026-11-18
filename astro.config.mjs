import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.i-bim.co.uk',
  // Keeps the old addresses (/about, /bim-advisory) with no trailing slash.
  build: { format: 'file', inlineStylesheets: 'never' },
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  // Fonts stay as files. An inlined font would be blocked by the site's own security policy.
  vite: { build: { assetsInlineLimit: 0 } },
});
