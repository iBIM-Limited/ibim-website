# iBIM website

Static Astro site served by a Cloudflare Worker (`worker/index.js`), which also handles redirects and form submissions.

- Edit copy in `src/data/services.ts` and `src/pages/`.
- The building model is `public/js/model.js`.
- `npm run preview` runs the site and form handler locally. Run `npx wrangler d1 migrations apply ibim-enquiries-local --local --env local` first.
- `npm run deploy` publishes. Production needs a D1 database bound as `DB` and custom domains added to `wrangler.jsonc`.
