# iBIM website

Static Astro site served by a Cloudflare Worker (`worker/index.js`), which also handles redirects and form submissions.

- Edit copy in `src/data/services.ts` and `src/pages/`.
- The building model is `public/js/model.js`.
- `npm run preview` runs the site and form handler locally. Run `npx wrangler d1 migrations apply ibim-enquiries-local --local --env local` first.
- `npm run deploy` publishes to the test address. Custom domains are added only at switch-over, following `docs/launch-runbook.md`.
- This account's Wrangler login is kept separate: set `WRANGLER_HOME` and `XDG_CONFIG_HOME` to `~/.config/ibim-wrangler` before running Wrangler.
- After changing `public/js/*`, raise the `?v=` number where the scripts are loaded.
