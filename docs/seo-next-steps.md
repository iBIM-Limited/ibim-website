# iBIM website: SEO structure and next steps

Status: planning document, 8 Nov 2026, revised after self-review. Nothing here is approved unless it says so.

**Recommendation:** finish launch first, aiming to go live by about 27 Nov. Use general service pages, a plain-English home page that routes each audience, and one Preston and Lancashire page. Do not start a local page pilot until the site is live and the gates in section 3 pass.

**Evidence labels**

- **[V]** verified directly during this review
- **[S]** reported by a search result, source document not read
- **[J]** stated by Jack in this thread
- **[A]** assumption, not yet verified
- **[P]** proposal, not approved

The SEO & AEO Desk is reviewing search and AI visibility separately. This document contains none of its findings and is not a broad audit.

## 1. Current implementation and proposals

### Production and preview

| Item | Production: `www.i-bim.co.uk` | Preview: `ibim-website.i-bim.workers.dev` |
|---|---|---|
| Platform | Hostinger Website Builder behind Cloudflare **[V]** | Cloudflare Worker, latest version created 8 Nov 22:19 UTC **[V]** |
| Search indexing | Open | `noindex, nofollow` on the preview host **[V]** |
| Bare domain over HTTPS | **525 error** **[V]** | Worker redirect is written, but untested on the real domain **[V]** |
| Home page title | `i-BIM Consultancy \| iBIM` **[V]** | `BIM Consultancy and Architectural Drawings in Preston \| iBIM` **[V]** |
| Sitemap | 18 URLs, including 8 template shop products **[V]** | 15 URLs, including 4 Preston pages **[V]** |
| `/contact` | 404. The contact page is at `/httpswwwi-bimcoukcontact` **[V]** | 200. The old address returns a 301 **[V]** |
| Shop pages | Live **[V]** | 410, tested on `/face-serum-gxrcld` **[V]** |
| Preston pages | Do not exist, 404 **[V]** | 4 pages return 200 **[V]** |

**The preview has never served production traffic.** Nothing on the preview can rank yet.

### Preview structure

- **Menu:** Services (six BIM services), Software, About, Contact **[V]**. There are no Preston links in the menu or footer **[V]**.
- **Home page:** has a visible "BIM and architectural work in Preston and Lancashire" section linking to all 4 Preston pages **[V]**. Jack has said he does not like this **[J]**.
- **Architectural services:** there are no general pages for them. They exist only as Preston pages **[V]**, so they are missing from the menu.
- **Thin content:** main text is about 224 words on `/architectural-drawings-preston`, 145 on `/bim-consultancy-preston`, 106 on `/bim-advisory` and 99 on `/about` **[V]**. No people are named **[V]**.
- **Home page heading:** "Simplifying AEC with integrated digital solutions" **[V]**. It is jargon to a homeowner and does not say what iBIM does **[A]**.
- **Wrong drawings:** the planning page shows clash markers, and the building regulations page shows a "Time and cost" chart **[V]**.
- **First frame:** the home page model opens almost empty, with a scan line and a few points **[V]**.
- **Motion:** the home page changes stage every 10 seconds and the model loops **[V]**.
- **Measurement:** the site has no analytics, and the enquiries table does not record the source page **[V]**.
- **Redirects:** `/about/` and `/index.html` return a temporary 307 **[V]**.
- **Measured quality:** no sideways scrolling at 390 px, no console warnings, text contrast of at least 5.29:1, about 214 KB on one desktop load **[V]**. No throttled mobile test has been run.

### Audiences

The site must serve homeowners, developers, land owners, construction companies and M&E companies **[J]**.

### Decision status

| Item | Status |
|---|---|
| Preston pages out of the dropdown, kept in the sitemap | Asked for by Jack **[J]** and live on the preview **[V]** |
| Preston section on the home page | Disliked by Jack **[J]**, still on the preview **[V]** |
| General title without Preston | **[P]** not approved |
| General architectural pages | **[P]** not approved |
| Merging 4 Preston pages into 1 | **[P]** not approved. It would reverse "keep them in the sitemap", so Jack must decide |
| Council guide pilot | **[P]** not approved |
| Cloudflare Turnstile | **[P]** discussed, not implemented **[V]** |

### Repository state

- Branch `main` is level with `origin/main` at `895ba70` **[V]**.
- There are 9 modified tracked files and an untracked `docs/` folder **[V]**.
- **The live preview was deployed from uncommitted work** **[V]**. Commit it before any new implementation, so it is not lost or overwritten.

## 2. Recommended structure [P]

### Menu

The same menu appears on every page, with no location names:

| Services group | Pages | Address |
|---|---|---|
| Architectural | Architectural Drawings | `/architectural-drawings` (new) |
| | Planning Submissions | `/planning-submissions` (new) |
| | Building Regulations Drawings | `/building-regulations-drawings` (new) |
| BIM and digital | BIM Advisory & Implementation | `/bim-advisory` (unchanged) |
| | Reality Capture & 3D Modelling | `/reality-capture-and-3d-modelling-services` (unchanged) |
| | BIM Information Management | `/information-management` (unchanged) |
| | Construction Sequencing & Cost (4D/5D) | `/construction-sequencing-and-cost-consultancy-4d5d` (unchanged) |
| | Project Management | `/project-management` (unchanged) |
| | Digital Twins & FM | `/digital-twins-and-fm-consultancy` (unchanged) |

Software, About and Contact stay as they are.

### Home page

- Use the title `BIM Consultancy and Architectural Services | iBIM`.
- Use a plain heading: "BIM consultancy and architectural drawings". The tagline stays in the logo.
- Follow it with: "For homeowners, developers, land owners, construction companies and M&E contractors."
- Remove the Preston section.
- Add a short "Who we work with" section using the routes below.
- Start the model with its point cloud already visible, play one sequence, and then change only when a visitor chooses a stage.
- Remove the Construction 2025 figures until iBIM has its own proof to show. They come from a 2013 strategy and are not iBIM results **[V]**.

### Audience routes

These are links on the home page, not new pages. Add dedicated audience pages only if real content and demand justify them.

| Audience | Main need | Links to |
|---|---|---|
| Homeowners | Drawings and approvals for a project | Architectural Drawings, Planning Submissions, Building Regulations |
| Developers | Drawings, approvals and coordination | Planning Submissions, Building Regulations, BIM Advisory |
| Land owners | Planning route and site information | Planning Submissions, Reality Capture |
| Construction companies | Coordination, sequencing and cost | Information Management, 4D/5D, Reality Capture |
| M&E companies | MEP modelling and clash-free coordination | Reality Capture & 3D Modelling, Information Management |

Homeowner-facing pages use plain language. BIM pages can stay more technical. Jack must confirm what iBIM offers each audience **[A]**, especially land owners, because the old site did not address them directly **[V]**.

### Service page drawings

- Architectural, planning and building regulations pages get a new plan and elevation sheet, including a red-line site boundary on planning pages.
- BIM pages keep the matching model stage.
- Remove "Sheet number" and "This sheet" from the footer. They add nothing for visitors.

### Local discovery

1. **One page:** `/preston-lancashire`, combining the useful content from the 4 current pages.
2. **Footer:** one small "Areas we cover" link in the title block.
3. **Service pages:** one plain line on relevant pages, such as "We cover Preston, Lancashire and the wider UK", linking to the local page.
4. **Sitemap:** includes the local page, but not as a sitemap-only page. It always has real links too.
5. **Current Preston addresses:** remove them from the build. No redirects are needed, because they never existed in production and the preview is `noindex` **[V]**.

**Why one page:**

- [Google's spam policies](https://developers.google.com/search/docs/essentials/spam-policies) name pages targeting specific regions or cities that funnel users to one page as doorway abuse.
- There are no real Preston projects to make 4 separate pages distinct yet **[V: none supplied or on the site]**.
- In a small sample of six similar firms, Cassidy + Ashton uses this pattern, with one Lancashire page linked from the footer **[V]**. This shows a pattern, not proof of ranking benefit.

**Trade-off:** one page may be less closely matched to each Preston search at first **[A]**. A dedicated page can be added later for a service once there are real local projects to show.

## 3. Local and pSEO pilot [P]

### What the pilot would be

**Council planning validation guides**, starting with a single prototype and capped at three councils. These are not town-name service pages.

Each guide would explain what one council expects with an application, in plain English, and what that means for the drawings.

### Why this data is useful

- Councils publish local validation requirements, so the information may differ by area and matters to applicants **[S]**.
- Applications must meet national and local requirements to be valid ([GOV.UK](https://www.gov.uk/guidance/making-an-application)) **[V]**.
- Drawings are iBIM's area of work **[J]**, so the guides can add practical knowledge beyond the source document **[A]**.

### Candidate councils

| Council | Source found | What is known |
|---|---|---|
| **Preston** | [Validation checklist](https://www.preston.gov.uk/article/5129/Validation-Checklist-for-Planning-and-Other-Applications) | Reported as adopted October 2024 **[S]**. Contents not reviewed |
| **South Ribble** | [Planning validation](https://southribble.gov.uk/downloads/download/113/planning-validation) | December 2023 criteria reported **[S]**. Current version unconfirmed |
| **Chorley** | Council source document still to be found | 2022 refresh reported through the Planning Data register **[S]**. Current version unconfirmed |

Blackburn with Darwen is a reserve only, because its sources conflict on date and version **[S]**.

It is **not yet known** whether these lists differ enough to justify separate pages. That is the first gate.

### Each page must contain

- Council name, source link, document version and date last checked
- A table of requirements by application type, including when each applies
- What each requirement means for the drawings and how to prepare them
- Common reasons applications may be delayed, **only** if drawn from real experience or a cited source
- The reviewer's name and a clear note that the council's document takes priority

### Not allowed

- Pages that only swap the town name
- Copying council PDFs, or scraping them into pages without added value (see [scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies))
- Invented projects, statistics, approval rates or claims of local presence
- Unreviewed AI-generated requirements

### Go or no-go gates

Thresholds are judgement calls. Review them once Search Console data exists.

**Before building a prototype, all must be true:**

| Gate | Pass condition |
|---|---|
| Site | New site is live and stable, with the launch blockers below closed |
| Measurement | Search Console is recording data, and analytics and enquiry source tracking are live |
| Service area | Jack confirms iBIM works in the chosen council areas |
| Reviewer | A named competent person will check each page and accept upkeep |
| Demand | Search Console, client questions or sales calls show real interest in the topic |

**Before adding a second or third council:**

| Gate | Pass condition |
|---|---|
| Uniqueness | At least 5 materially different requirement rows from the Preston page, excluding wording changes |
| Added value | The reviewer confirms the page helps more than the council's PDF alone |
| Accuracy | Every requirement traces to the current source document |

**Review 12 weeks after publishing:**

| Result | Condition | Action |
|---|---|---|
| **Expand** | All pilot pages indexed, non-brand impressions growing, and at least one qualified enquiry or sales conversation linked to them | Consider further councils, one at a time |
| **Keep but stop adding** | Indexed and getting impressions, with no enquiries yet | Keep the pages updated, and add no more |
| **Stop** | Not indexed after 8 weeks, a material error reaches a published page, or nobody can keep them current | Merge or remove the pages |

## 4. Execution briefs

Do not start until Jack approves the decision below. Commit the current work first. **Only one person or thread may deploy the Worker at a time.**

### Brief A: Site structure

- **Owns:** `src/data/services.ts`, `src/layouts/Base.astro`, `src/pages/index.astro`, `src/pages/[slug].astro`, `src/pages/contact.astro`, `src/styles/site.css`, `public/js/model.js`, `public/img/og.png`
- **Depends on:** Jack's decision, and his confirmation of what iBIM actually offers each audience
- **Acceptance criteria:**
  - [ ] The menu shows the 9 services above in two groups, with no location names
  - [ ] Visible text, title and meta description on the home page do not contain "Preston". Site-wide structured data may list it as a service area
  - [ ] Contact page copy does not read as Preston-only
  - [ ] The home page heading says what iBIM does, and all 5 audiences have working routes
  - [ ] Architectural, planning and building regulations pages show the new drawing sheet, with no clash markers or cost chart
  - [ ] The home page shows a recognisable model in its first frame, and motion stops after one sequence
  - [ ] No links to `/#local` remain, and "Previous stage" and "Next stage" appear only on lifecycle pages
  - [ ] Footer "Sheet number" and "This sheet" fields are removed
  - [ ] The share image matches the new home page
  - [ ] `/preston-lancashire` is linked from the footer and relevant service pages, and is in the sitemap
  - [ ] The 4 current `*-preston` addresses return 404 and are not in the sitemap
  - [ ] The sitemap lists only URLs that return 200, with no duplicates
  - [ ] Each page has a unique title and description, one `h1`, and a matching canonical
  - [ ] The word "architect" is not used as iBIM's title unless Jack confirms registration
  - [ ] No invented projects, prices, reviews, credentials or address
  - [ ] `npm run build` succeeds, with no sideways scrolling at 390 px
  - [ ] The preview still sends `X-Robots-Tag: noindex, nofollow`

### Brief B: Launch readiness

- **Owns:** `worker/index.js`, `wrangler.jsonc`, `migrations/`, `src/components/Form.astro`, `src/pages/privacy.astro`, `public/js/site.js`, and a new `docs/launch-runbook.md`
- **Depends on:** Jack authorising the Google script. The runbook can be written now, but no switch happens without separate approval
- **Acceptance criteria:**
  - [ ] Free, cookie-free analytics is in place if Jack approves it, and the privacy notice and Content-Security-Policy match
  - [ ] Each enquiry records the page it was sent from
  - [ ] `/about/` and `/index.html` use permanent redirects
  - [ ] The test address is switched off, or stays `noindex`, after launch
  - [ ] A throttled mobile test is recorded for the home page and one service page
  - [ ] With Jack's approval, one test enquiry saves to the database with `emailed = 1` and reaches `jack@i-bim.co.uk`
  - [ ] Replying to that email goes to the sender's address
  - [ ] Test rows are removed afterwards, including `deploy-test@example.com`
  - [ ] The runbook lists the exact DNS changes, a pre-change record export and rollback steps
  - [ ] The runbook keeps MX, SPF, DKIM, DMARC and Google verification records unchanged
  - [ ] It includes a post-switch test of all 18 old URLs against `docs/seo-baseline-2026-11-08.md`
  - [ ] It tests `https://i-bim.co.uk` and `http://i-bim.co.uk`, both with one redirect to `https://www.i-bim.co.uk/`
  - [ ] If Turnstile is approved, forms still work and the Content-Security-Policy allows only what it needs

### Brief C: Council guide prototype (blocked)

- **Owns:** new `src/data/council-guides/preston.ts` and `src/pages/planning-guides/[council].astro`. Brief A owns any link to them
- **Depends on:** the "before building" gates in section 3, and Brief A being finished
- **Acceptance criteria:**
  - [ ] One Preston guide only, on the `noindex` preview
  - [ ] Every requirement row has a source reference to the current council document
  - [ ] Version and last-checked date are visible on the page
  - [ ] A named reviewer has signed it off
  - [ ] The template cannot publish a page with missing source, date or reviewer fields
  - [ ] It is not added to the production sitemap without Jack's approval

**Independence:** A and B own separate files and can run in parallel, under the single-deploy rule. C waits. No implementation thread should start until the decision is made.

**Target dates:** finish A and B by about 24 Nov and go live by about 27 Nov, if Jack approves the switch. That leaves about a week of checks before the hosting renewal on 4 Dec.

## 5. Launch blockers

| Blocker | Evidence | Owner | Date |
|---|---|---|---|
| **Hosting auto-renews at £131.88 + £26.38 tax** | Shown as auto-renewing **[V]**. Must not be cancelled before the new site is built **[J]** | Jack, prompted when ready | **Before 4 Dec** |
| **Domain is registered through Hostinger** | Listed in hPanel and auto-renews at £10.99 on 21 Nov; expires 18 Dec **[V]**. Google email depends on it | Jack to approve any transfer | Keep renewal on until the move is safe |
| Google script not confirmed working | Saved with the key fingerprint; the deployment dialog has closed, but authorisation and web app URL are unconfirmed **[V]**. `NOTIFY_URL` is not set **[V]** | Jack, then Brief B | Before switch |
| Form emails not working | The only database row is the test row, with `emailed = 0` **[V]** | Brief B | Before switch |
| DNS switch not planned or approved | `www` points to Hostinger's CDN and the apex to Hostinger IPs **[V]**. The current Wrangler login has no DNS-edit permission **[V]**, so another route may be needed **[A]** | Brief B, Jack approves | Target about 27 Nov; plan and domain end 18 Dec |
| Search Console access | `jack@i-bim.co.uk` has no access to the domain property **[V]**. Two Google verification records exist **[V]**, so another account may own it **[A]**. No ranking baseline yet **[V]** | Jack | Before switch, so history is kept if possible |
| Service claims need confirmation | The new copy is based on Jack's message and the old site **[V]** | Jack | Before switch |
| Company details | Legal name and registration number not confirmed. "iBIM Ltd" is only implied by a LinkedIn address **[A]** | Jack | Before switch |
| Preston presence | Address, service area and Google Business Profile eligibility unknown **[V]** | Jack | Before any address or profile is published |
| Who does the work | No named person or qualifications on the new site **[V]**. Homeowners and land owners need this to trust drawing and planning work **[A]** | Jack | Before switch |
| Proof of work | No real projects or testimonials on the new site, by design **[V]** | Jack | Not a technical blocker, but limits SEO and trust |
| Privacy notice | Drafted by Claude, including a two-year retention period **[V]**. Not reviewed by Jack | Jack | Before switch |
| Old preview on the Wardyj93 account | Created earlier and not yet removed. Not rechecked in this review **[A]** | Brief B | After Jack approves deletion |

**Hostinger account deletion stays blocked** until all of these are true:

- The new site is live on `www` and the bare domain
- Redirects are tested and forms are working
- The domain has moved out of Hostinger
- Nothing depends on Hostinger any more
- The site has been stable for about a week

## Decision needed from Jack

**Approve the section 2 structure?** General service pages in the menu, a home page routing all 5 audiences with no Preston on it, and the 4 Preston pages merged into 1 local page, reachable from the footer and service pages.

This would replace "keep the 4 pages in the sitemap". The audience question is settled **[J]**, and everything else can follow from this decision.
