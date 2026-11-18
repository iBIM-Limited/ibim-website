# iBIM brand rules for the website

Condensed from the iBIM brand book, Edition 1.0 draft (18 November 2026):
`/Users/jackward/Downloads/iBIM-brand-book-edition-1.0-draft.pdf`, with the full text extracted at
`/private/tmp/claude-501/-Users-jackward--t3-scratch-2026-11-08-rebuild-my-ibim-website-with-898559a2/9b850dc9-75bf-40f2-9109-878d57cba812/scratchpad/brand/book.txt`.
The book is the source of truth. Section numbers are given so every rule can be checked.

## Name and promise
- Write **iBIM**: lowercase i, capital BIM, no hyphen, no space, even at the start of a sentence. Never i-BIM, IBIM, Ibim. (2.9)
- Web and email addresses keep the hyphen: `i-bim.co.uk`, `jack@i-bim.co.uk`. (2.9)
- Legal name **iBIM Limited** only in footers, contracts and invoices. (2.9)
- The promise appears **word for word** on the website, never paraphrased: “Simplifying AEC with integrated digital solutions.” In running text it is in sentence case. (1.10, 2.4)
- Spell out AEC on first use: architecture, engineering and construction (AEC). (1.2)
- Text is never coloured to imitate the logo. (2.9)

## Logo (section 02)
- The logo is artwork. **Never retype it, recolour it, stretch it, add effects or rebuild it.** Typing “iBIM” in Inter Bold is not the logo. (2.2, 3.7, 2.10)
- Only file on the Mac: `~/Downloads/IBIM logo.png` (1080px full lockup). No SVG masters exist.
- Crops taken from that file, unaltered, are in `public/img/`:
  - `ibim-wordmark-bar-primary.png`: lockup B, wordmark plus bar. Use it in the header, at 72px wide or more. (2.4, 2.6)
  - `ibim-monogram-primary.png` (64px) and `ibim-monogram-180.png`: the green i, for the favicon and apple-touch icon. (2.8)
  - `ibim-logo.png`: lockup A, the full lockup, at 160px wide or more. (2.4, 2.6)
- Primary version (black and green) on white or pale tint only. **No reversed (white) version exists, so never place the logo on ink.** (2.7, 2.11)
- Clear space is 2× the dot diameter on all sides. (2.5)

## Colour (3.1–3.6, 3.12)
Use these tokens exactly:
```
--color-signal:      #43903C;  /* iBIM Green: graphics, fills, icons, key data. Never body text on white. */
--color-signal-text: #2E6B29;  /* Deep Green: green text, links, buttons, focus ring */
--color-ink:         #0B0D0B;  /* text, dark surfaces */
--color-ink-60:      #586056;  /* secondary text; nothing lighter carries text on white */
--color-tint:        #EDF5EC;  /* Green Tint: panels, callouts, selected states */
--color-surface:     #F4F6F3;  /* Mist */
--color-line:        #DDE2DB;  /* hairlines */
--color-white:       #FFFFFF;
light green on ink:  #7BC474;  /* small green text on dark only */
--color-warn: #8A4B00 on #FFF1DC; --color-error: #B3261E on #FBE9E7  /* status only */
```
- Apply the 70/20/10 rule: 70% white and neutrals, 20% black, 10% green. Green never exceeds its share. (3.1)
- **No accent colour.** Functional colours are for status only: form errors, never decoration or backgrounds in marketing. (3.3)
- Use tints of the core colours for depth, never a new hue. (3.4)
- iBIM Green text on white fails contrast, so green words on light backgrounds use Deep Green. Buttons are white on Deep Green or white on ink. (3.5)
- **No gradients, glows, blobs or drop shadows.** Flat colour and line only. (3.6)

## Graphic devices (3.6)
- **Baseline:** a solid black bar under a headline or across a page foot, in the same proportion as the logo bar (`--bar-weight: 6px`). One per layout.
- **Ring:** the connected-gear icon, enlarged and cropped by an edge, on dark surfaces only. We have no clean vector of it, so **don’t use it**.
- **Drawing grid:** a fine square grid at low opacity, with wireframe linework on top. It signals model and drawing space. Never put it over photographs.

## Type (3.7–3.11)
- **Inter** for everything; fallback `'Inter', 'Segoe UI', Arial, sans-serif`. Self-host it with `@fontsource-variable/inter`, which is already installed.
- **JetBrains Mono** (`@fontsource-variable/jetbrains-mono`, already installed) only for eyebrows, labels, references, data and code. Never for headlines, body copy, buttons or anything over two lines. Mono eyebrows use capitals tracked +8 to +14%, weight 500.
- Weights:

  | Weight | Use |
  |---|---|
  | 800 | Display and H1, tracking −3%, never below 24px |
  | 700 | H2 and H3, tracking −1 to −2% |
  | 600 | Buttons, navigation and labels |
  | 500 | Standfirsts |
  | 400 | Body, line height 1.5–1.6 |

  **No weights from 100 to 300.**
- Scale at the 1440px reference, fluid with `clamp()`:

  | Role | Size | Line height |
  |---|---|---|
  | Display | `clamp(40px, 6vw, 88px)`, never below 36px on mobile | 1.02 |
  | H1 | 40px | 1.08 |
  | H2 | 28px | 1.18 |
  | H3 | 19px | 1.3 |
  | Body | 16px | 1.55 |
  | Small | 13.5px | |
  | Caption and mono | 12px | |
- **Sentence case everywhere. Headlines end with a full stop.** Use one green word per headline at most, chosen for meaning, and one green word per page in display. (3.11, 2.3)
- Body measure is 68 characters or fewer. No justified text and no centred body copy. Never underline for emphasis; underline means a link. Never use two display sizes on one page. (3.11)
- Use real apostrophes (’) and proper dashes. Write numerals for quantities. Tables use tabular figures. Dates look like 18 November 2026. (3.11)

## Voice (section 04)
- Technical, plain, direct, useful and honest. Short sentences. The answer first. British English. (4.1)
- **Banned:** leading, cutting-edge, revolutionising, game changer, next-generation, seamless, end-to-end solutions provider, leverage synergies, innovative, holistic, “drive excellence”. No exclamation marks or emoji. (1.10, 4.2, 7.12)
- **The competitor test:** if a competitor could paste a sentence onto their site unchanged, rewrite it with a specific standard, format, number or date. (4.2)
- **Never invent clients, projects, testimonials, figures, prices or standards.** Use a `[bracketed slot]` only in drafts. Brackets never ship. (4.2, 5.7, 7.12)
- Spell out an acronym on first use with one plain-English clause, and use no more than two acronyms in a sentence. (4.5)
- Retired copy must not appear anywhere: “the leading force…”, “cutting-edge digital solutions”, “Giving back to construction with advanced BIM solutions”, “holistic view”. (1.3)

## Imagery, icons, motion (4.6–4.12)
- Show real work from actual jobs. **No stock photos.** No glowing holograms or robot hands. Renders are labelled “visualisation”. (4.6–4.9)
- Model views sit on ink or white, in neutral greys, with iBIM Green highlighting only the element the image is about. Point clouds go on ink, never with rainbow ramps. (4.8)
- Illustration is **technical linework**: axonometrics, sections, exploded views and process diagrams, drawn with the icon pen on the drawing grid. Use one green element per diagram, the point being made. **No cartoon people, mascots, clip-art, 3D blobs, isometric cities, lightbulbs, rockets, handshakes or jigsaws.** (4.11)
- Icons come from **Lucide** (`lucide-static`, installed): 24px grid, 1.75px stroke, round caps, no fills. Colour them ink or ink-60, with Deep Green for one active state. Icons support a label and never replace one. Never use the logo’s gear as a UI icon. (4.10)
- Motion: “things assemble, nothing bounces.” The only easing curve is `cubic-bezier(0.2, 0.8, 0.2, 1)`. Timings are 120ms for hover, 280ms for reveals and panels, and 600ms for the hero or a line drawing on. Entrances fade and rise 8px, staggered 50ms. One orchestrated moment per page, then stillness. **Always respect `prefers-reduced-motion`.** (4.12)

## Website (section 05)
- **Every page answers one question, shows the evidence and gives the next step.** (5.1)
- Architectural, BIM and digital, and software and automation get equal weight in the navigation and on the home page. (5.1)
- A name, a phone number and an email are never more than one click away. (5.1, 5.12)
- **Architecture** (5.2):
  - No page is more than two clicks from home.
  - Location pages appear only in the footer.
  - Work pages are added only when a real, permitted case study exists.
- **Grid** (5.3):
  - 8px spacing unit; the scale runs 8, 16, 24, 32, 48, 64 and 112.
  - Container 1200px; 1440px for full-bleed bands.
  - 112px between sections on desktop, 64px on mobile.
  - Breakpoints at 480, 768, 1024 and 1440.
  - Radii: cards 14px, controls 8px, tags 999px, imagery 12px.
- **Home page** (5.4):
  1. Ink hero on the drawing grid with one piece of linework. A mono eyebrow, then a headline of 8 words or fewer with one green phrase, for example “Drawings, BIM and software. **One team.**” The standfirst is “We draw the building, manage its information and automate the admin in between.”
  2. One primary action (“Start a project”) and one secondary (“See how we work”). Never a carousel.
  3. The three pillars at equal width, within the first scroll.
  4. Then how we work (4 steps), selected work, who runs iBIM, a contact band and the footer.
  5. No proof bar until three real, sourced numbers exist.
- **Navigation** (5.5):
  - Four links and one action, never more: Architectural, BIM and digital, Software and automation, About, plus a **Start a project** button.
  - The two service menus open as plain lists.
  - The active page has a 2px Deep Green underline.
  - The bar is white and 64px tall, with a hairline once the page has scrolled. Without a reversed logo, keep the header white rather than transparent on ink.
  - On mobile: the logo and a menu button. The menu opens as a full-screen ink sheet with links at display size, the action pinned to the bottom and the phone number visible, opening in 280ms.
- **Buttons** (5.6):
  - Radius 8px, weight 600, sentence case. Sizes are L 52px, M 44px and S 36px.
  - Primary is ink with white text, one per view. Action green is Deep Green, for the conversion moment on light pages. Secondary is a 1.5px ink outline. Tertiary is Deep Green text with an arrow that moves 4px on hover.
  - Labels start with a verb, such as “Start a project” or “Request a quote”. Never “Submit”, “Click here” or “Learn more”.
  - Focus: a 2px Deep Green ring with a 2px offset, always visible.
  - No more than two buttons side by side. Full width on mobile.
- **Cards** (5.7):
  - Service card: icon, plain name and one sentence. On hover the border turns Deep Green.
  - Process card: tint surface with a numbered mono eyebrow.
  - Work card: real image, sector tag and one result.
  - Testimonial card: ink, with a named source.
  - Never publish invented work or testimonials.
- **Forms** (5.8):
  - Four fields, then a person: “What do you need?” (Drawings, Scan / model, BIM support, Software, Not sure), “The building or project”, “Email or phone” and “When do you need it?”
  - Labels sit above fields; never use a placeholder as a label. Errors appear inline, specific and polite.
  - End with what happens next, and when.
- **Service page** (5.9):
  - The same four blocks on every page: **What it is**, **What you receive** (listed by file format), **How it runs** and **Honestly?**.
  - A sticky side panel holds a typical job (inputs, standards, timescale), one green action (“Request a quote”), one outline action (“Ask a question”) and a named person.
  - Above the fold, a model view, drawing or screen. Use real imagery from the service where it exists.
- **Responsive** (5.11):
  - Display text never drops below 36px.
  - Tap targets are 44px or more; the primary action is full width.
  - The page never scrolls sideways.
  - Nothing that matters on desktop is hidden on mobile.
- **Quality gates** (5.12): Largest Contentful Paint under 2.0s on 4G, accessibility score 100, layout shift under 0.02, and one click to a human.
- **AI assistant** (5.16): don’t add one on the website in this rebuild.
