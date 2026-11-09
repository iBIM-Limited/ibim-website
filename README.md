# iBIM website

Static Astro site served by a Cloudflare Worker (`worker/index.js`), which also handles redirects and form submissions.

- Edit copy in `src/data/services.ts` and `src/pages/`.
- The building model is `public/js/model.js`.
- `npm run preview` runs the site and form handler locally. Run `npx wrangler d1 migrations apply ibim-enquiries-local --local --env local` first.
- `npm run deploy` publishes straight to the live site. See `docs/launch-runbook.md`.
- `src/3d/render_visual.py` makes the render in Blender. `src/3d/visual3d.js` is the animation, bundled by `npm run build:3d`.
- This account's Wrangler login is kept separate: set `WRANGLER_HOME` and `XDG_CONFIG_HOME` to `~/.config/ibim-wrangler` before running Wrangler.
- After changing `public/js/*`, raise the `?v=` number where the scripts are loaded.
