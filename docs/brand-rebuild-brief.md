# Brief: rebuild i-bim.co.uk to the brand book (18 November 2026)

Jack Ward (director, iBIM Limited) has asked for the website to be redone to follow his new brand book. **Read `docs/brand-rules.md` in full first.** It condenses the 125-page book with section references. Where you need more detail, read the full text at the path given in that file, or the PDF itself.

## Where to work
- **Repo:** `/Users/jackward/Projects/ibim-website`, branch `main`. Astro 7 static site, served by a Cloudflare Worker (`worker/index.js`) with static assets. **Ignore** the old copy at `~/.t3/scratch/.../site`: it is stale.
- **Commands:** `npm run build` builds the site; `npm run dev` runs it locally.
- **Wrangler:** always run it with `WRANGLER_HOME=~/.config/ibim-wrangler XDG_CONFIG_HOME=~/.config/ibim-wrangler` set. That keeps it logged into Jack’s iBIM Cloudflare account (`4a0e0622ac1b16fb26d756daf8e9b1f3`) instead of another one.

## Already done; don’t redo
- `src/data/services.ts` is rewritten in the brand voice. Each service now has `pillar`, `icon`, `card`, `what`, `receive`, `steps`, `honestly`, `typical`, `figure`, `figureCaption`, `includes`, `explainer` and `questions`. It also exports `pillars`, `recentWork`, `contact` (with `person` and `role`) and `promise`. The old fields `state`, `stage`, `lead` and `group` are gone, so **the pages and layout currently fail to build until they are updated**. Keep the copy as written unless it breaks a rule.
- Logo crops, taken unaltered from Jack’s logo file, are in `public/img/`: `ibim-wordmark-bar-primary.png` (352×161), `ibim-monogram-primary.png` (64×64) and `ibim-monogram-180.png`.
- `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` and `lucide-static` (icons) are installed.

## What to build
1. **Tokens and styles.** Replace `src/styles/site.css` with the tokens and components in `docs/brand-rules.md`. Swap the fonts: remove the Archivo, Instrument Sans and Space Mono imports and packages, and use Inter and JetBrains Mono.
2. **Layout** (`src/layouts/Base.astro`):
   - Use the 5.5 navigation: Architectural ▾ (the 4 architectural services), BIM and digital ▾ (the 6 BIM services), Software and automation (`/software-development`), About, and a **Start a project** button linking to `/contact`. On mobile, the menu is a full-screen ink sheet.
   - The header uses `ibim-wordmark-bar-primary.png`, with alt text “iBIM”.
   - Use the monogram for the favicon and apple-touch icon.
   - Footer:
     - The full lockup `ibim-logo.png`, and the promise in sentence case.
     - The service lists.
     - Contact: Jack Ward, the phone number, the email and LinkedIn (the only social profile; add no others).
     - A discreet “Areas we cover: Preston and Lancashire” link.
     - Privacy.
     - The baseline bar.
     - The legal line, kept as it is now.
   - Remove the old footer lines “Our aim: Giving back to construction…” and the values cell.
   - **Keep:**
     - All SEO head tags: title pattern, description, canonical, Open Graph tags and JSON-LD.
     - The Cloudflare Web Analytics beacon script exactly as it is.
   - Rewrite the organisation JSON-LD `description` without “end-to-end”, using the positioning statement in brand book 1.4.
3. **Home** (`src/pages/index.astro`), following 5.4:
   - An ink hero on the drawing grid with one linework drawing. Eyebrow “Simplifying AEC”, then the headline “Drawings, BIM and software. One team.”, with “One team.” in light green.
   - The standfirst from the rules, then **Start a project** and **See how we work**.
   - The three `pillars` at equal width.
   - How we work, 4 steps (brand book 5.10): Enquire, Scope, Deliver, Hand over.
   - Recent work: `recentWork` as text cards. There are no images and no invented results.
   - Who runs iBIM: Jack Ward, BSc (Hons) Building Surveying, Postgraduate Diploma in BIM and Project Management. Use the 4.2 rewrite, “A UK practice covering architectural drawings, BIM and software, run by a building surveyor with a postgraduate diploma in BIM and project management.”
   - Somewhere on the page, the promise word for word, with AEC spelled out: architecture, engineering and construction.
   - A short “Who we work with” section, using the 1.8 audiences (design, build, own and operate). Jack specifically wants homeowners, developers, landowners, construction companies and M&E companies named.
   - A contact band.
   - Keep the page title and meta description exactly.
4. **Service pages** (`src/pages/[slug].astro`), following 5.9:
   - Breadcrumb in mono, for example “BIM AND DIGITAL → REALITY CAPTURE”.
   - H1 is the service `title`, then the four blocks: What it is (`what`), What you receive (`receive`), How it runs (`steps`) and Honestly? (`honestly`).
   - Sticky panel: Typical job (`typical`), **Request a quote** (Deep Green) to `/contact`, **Ask a question** (outline) to `mailto:`, and “Jack Ward” with the phone number.
   - Above the fold, the service `figure` with its mono `figureCaption`. For `figure: 'visual'`, use `public/img/ibim-visual.webp` captioned “Visualisation · illustrative, not a client project”.
   - Then `includes`, `explainer` and `questions` (FAQs), and links to the other services in the same pillar.
   - Keep the JSON-LD `Service` schema and the page titles.
5. **Visuals. UPDATED by Jack, 18 Nov: keep the existing visuals on the site and enhance them. Don’t replace them.**
   - Keep:
     - The canvas stage drawings in `public/js/model.js`.
     - The point cloud → model → render animation (`src/3d/visual3d.js`, built to `public/js/visual3d.js`).
     - The render `public/img/ibim-visual.webp`.
   - Restyle them to the brand:
     - Brand colours, with exactly one green element per drawing, as in 4.11.
     - Ink or white backgrounds with neutral greys, as in 4.8.
     - The drawing grid behind the linework.
     - No glows, gradients or rainbow point-cloud ramps.
     - Brand easing, and `prefers-reduced-motion` respected.
     - Mono captions.
     - Renders labelled “Visualisation”.
   - Improve them where it clearly helps. Don’t rebuild them from scratch, and **don’t delete model.js, three.js or `src/3d/`**.
   - Fit them into the 5.4 home layout:
     - Use the existing animation as the home hero visual on the ink hero.
     - Use the existing stage drawings as the service-page figures.
   - The ideas below are optional extras. They apply only where an existing visual is missing or clearly off-brand.

   Original direction, now secondary:
   - Build one Astro component, for example `src/components/Linework.astro`, that draws a technical SVG for each service `figure` type on the ink drawing grid. Draw in light lines with exactly one green element: the point of that service.
   - Make each drawing specific to its service:
     - `plan`: a floor plan with door swings and a proposed extension in green.
     - `elevation`: a front elevation with the proposed part in green.
     - `section`: a section through a wall and roof, with the insulation line in green.
     - `cloud`: point-cloud dots resolving into a model, with one modelled wall in green.
     - `wire`: an axonometric building frame with levels, and one level slab in green.
     - `cde`: work in progress → shared → published, with published in green.
     - `sequence`: the building assembling over weeks, with the current week in green.
     - `programme`: a Gantt chart of RIBA stages 0–7, with the current stage in green.
     - `twin`: a building with asset markers and one selected asset in green.
   - The home hero gets its own richer piece: an axonometric building that reads as drawing, then model.
   - Lines draw on once (stroke-dashoffset, 600ms, brand easing), with `prefers-reduced-motion` respected.
   - Use no gradients, glows, blobs or isometric cities. Brand book 4.11 shows the style.
   - (Superseded) Do not retire the canvas or three.js animation. Keep it and restyle it, as above.
6. **Other pages:**
   - **About:** use the brand book 1.1 purpose, 1.3 vision and mission (the reworded versions, verbatim), 1.6 values with their behaviours, 1.5 five commitments and Who runs iBIM. Move the YouTube video here as a click-to-load player, which `site.js` already handles. Remove all retired copy.
   - **Contact:** use the 5.8 four-field form. Heading “Tell us about the job.” Subheading “About one minute. We reply within one working day.” End with “Jack replies personally.” Show the phone, email and hours.
   - **Software and automation:** the third pillar. Cover what we build, examples (from the current page, with no invented figures) and the iBIM digital twin platform waiting list, keeping the existing waitlist form.
   - **Preston and Lancashire:** restyle it and keep the content.
   - **Privacy, 404 and thanks:** restyle them. Headlines end with a full stop.
7. **Form and Worker.** The contact form changes to four fields:
   - `need` (radio: Drawings, Scan / model, BIM support, Software, Not sure), `project` (textarea), `reply` (email or phone) and `when`.
   - Update `src/components/Form.astro`, `public/js/site.js` and `worker/index.js` to match:
     - `reply` is required, and must be a valid email or a UK phone number with at least 10 digits.
     - Store it in the existing `email` column.
     - Put “Need”, “When” and the project text into `message`.
     - Set the notification `replyTo` only when `reply` is an email.
   - Keep the honeypot, origin check, rate limit, D1 insert and notification.
   - The waitlist form keeps its fields.
   - Write error messages inline, and make them specific and polite.

## Rules
- **Build and verify locally, then deploy only to a preview.** Never deploy to the live `www.i-bim.co.uk` routes; Jack approves the production switch.
  - Add an `env.preview` to `wrangler.jsonc` with `"name": "ibim-website-preview"`, **`"routes": []`** and `"workers_dev": true`. You must set `routes` explicitly: `routes` are inherited, and leaving them out would take over the live site.
  - Give the preview its own D1 database: create `ibim-enquiries-preview`, then apply `migrations/` to it with `--remote`. Never bind the production `ibim-enquiries` to the preview, and set no `NOTIFY_*` secrets on the preview.
  - Deploy with `npx wrangler deploy --env preview`, then confirm the output lists only a `workers.dev` URL. Confirm `https://www.i-bim.co.uk/` still serves the old site: the live H1 is “We help you plan, design and deliver building projects”.
- Don’t touch DNS, Google email routing, the domain, or Cloudflare or Hostinger billing.
- **Keep the SEO basics:** every existing URL and page title, the meta descriptions (only rewrite one if it contains banned words), canonicals, the sitemap, the schema, redirects and analytics.
- **Never invent** clients, projects, figures, prices or testimonials.
- **Never retype or recreate the logo.** If a logo version you need doesn’t exist, such as a reversed or vector version, say so; don’t make one.
- For browser checks, use T3’s built-in browser tools (`preview_open`, `preview_snapshot` and so on) if you have them. Don’t use Playwright. If you have no built-in browser tools, say so in the report.
- Check accessibility: one H1 per page, alt text, visible focus, contrast, full keyboard navigation, `prefers-reduced-motion`, and no horizontal scroll at 375px.
- Commit locally on `main` with clear messages, each ending with the line `Co-Authored-By: Gemini 3.8 Flash via Cursor`. **Don’t push.**

## Testing limit (from Jack)
Make **at most 2 test-and-fix passes**: test once, fix, test again, then stop and report what is still open. Jack reviews before anything goes to production.

## Report when done
1. The preview link.
2. What changed, page by page.
3. Brand-book rules you couldn’t meet, and why. Expected: no reversed logo for the transparent-on-ink nav, no ring device, no real project photos for work cards or service imagery, no price guides.
4. What Jack needs to supply: logo masters (SVG, reversed, mono), real project images with client permission, price guides, testimonials, case studies and copy confirmations.
5. The checks you ran, and their results.
