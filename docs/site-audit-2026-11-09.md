# iBIM website audit: 9 Nov 2026

## Tested
All 16 sitemap pages on the live site, in one desktop Chrome session.

| Check | Result |
|---|---|
| axe accessibility rules (WCAG A, AA and best practice) | No violations |
| Internal and outbound links | No broken links |
| One `h1`, heading order, image alt text | Pass |
| Titles and meta descriptions | Present, unique titles |
| Canonical addresses | Correct on all pages |
| Sideways scrolling at 390 px | None on the pages tested |
| npm production dependency audit | 0 vulnerabilities after the upgrade |

## Fixed
- Stacked visuals when switching home page stages, from a CSS rule and a render left on screen.
- A script error on the project management page, from a negative animation clock.
- Clicking a stage could leave the model scrolled out of view.
- Plain HTTP not redirecting to HTTPS.
- Temporary redirects for trailing slashes and `.html` addresses are now permanent.
- 5 dependency vulnerabilities, by upgrading Astro from 5 to 7. The upgrade would have broken the home canonical, which was fixed and retested.
- Share image reduced from 452 KB to 122 KB.
- Unused script code removed, and the launch record brought up to date.

## Not fixed: needs Jack
- BIM service pages are thin, at about 145 to 180 words. Real detail and projects are needed.
- No qualifications are shown, and no real projects, testimonials or reviews.
- Service claims and the privacy notice still need his review.

## Not tested
- A real phone, and Safari or Firefox.
- A full Lighthouse run, or field Core Web Vitals, as there is no traffic data yet.
- Search Console has no performance data yet.
