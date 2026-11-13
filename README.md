# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## Souvenir catalogue pricing and colour administration

Souvenir price tiers use **volume-based per-piece pricing**. Each tier defines a quantity range and a unit price; the customer-facing page estimates `quantity × unit price` and clearly labels the amount as an estimate. The backend remains authoritative and returns the persisted order total used for Paystack.

Existing price tiers must be reviewed after the backend pricing migration. Legacy fixed-tier totals are not valid per-piece rates and must not be copied into the new unit-price field without confirming the actual intended rate.

Admins can create, edit, activate, and deactivate product colour options. Customers may select one to five unique active colours per order. Historical order colour snapshots remain unchanged when catalogue options are edited or deactivated.


## Training programme Telegram onboarding

Admins manage each programme's private Telegram group invite link from **Admin → Training programs → Create/Edit program**. The field accepts HTTPS links hosted on `t.me` or `telegram.me`, including private invite links. The frontend sends the value as `telegramGroupUrl` through the existing training create/update endpoints. Leave it blank only while a programme is not accepting paid registrations; the backend blocks payment initialization when the programme has no configured link.

The backend intentionally omits this private invite URL from public programme responses. Students receive it in the payment-confirmation email after Paystack verification; it is not displayed on public programme pages or sent before payment confirmation.


## Static page hero backgrounds

The About, Gallery, Resources, and Souvenirs page hero backgrounds are intentionally hardcoded frontend assets stored in `public/`. They are separate from Admin → Site Settings / Site Content, whose managed images remain unchanged.

The paths are centralized in `src/config/siteImages.ts`:
- About: `/about.jpg.jpg`
- Gallery: `/gallery.jpg`
- Resources: `/resourcepage.jpg`
- Souvenirs: `/sourvenir.jpg` (the existing filename is intentionally preserved)

Each page preloads only its own hero image and renders it with eager loading and high fetch priority. Do not fetch these backgrounds from the API or make page rendering wait for Site Settings. If an asset is renamed or replaced, update the corresponding path in `siteImages.ts` and this documentation together.


## Organization information and footer

Public organization details are maintained in **Admin → Organization info** and loaded by the shared public footer from `GET /api/site-content/organization`. Admins can update the organization name, tagline, short description, public contact email, phone, WhatsApp number, address, operating hours, social profile URLs, and copyright text.

The footer keeps its internal navigation routes in frontend code. The Site Branding logo remains managed by the existing Site logo screen and is not duplicated in the organization profile.

**Email identity is intentionally separated:** the public contact email configured here is a website contact detail. It does not change `TRANSACTIONAL_FROM_EMAIL`, `CERTIFICATE_FROM_EMAIL`, or any Resend sender configuration.

The organization profile is cached by React Query for five minutes. After an admin saves changes, the admin query is invalidated; public visitors receive the updated profile when their cached data refreshes.


## FAQ management

Admins manage questions and answers in **Admin → FAQs**. New entries are saved as drafts. Admins can edit, publish, unpublish, archive, restore, and delete entries. Published FAQs are displayed on the public **/faq** page and ordered by their configured display order.

The public frontend reads `GET /api/site-content/faq`; it never requests the admin list. The backend public query filters to `PUBLISHED` records at the database layer. Admin operations use the authenticated admin routes under `/api/site-content/admin/faq`.

FAQ answers are plain text with line breaks preserved. Do not place HTML in answers; the public page renders answer content as text.


## Creative workshop repeat event bookings

The public creative workshop form treats each submission as a separate event request. A customer may submit multiple dates for the same workshop offering and reuse the same participant tier; the resulting requests have separate references and private booking pages.

Participant tiers are shared price options attached to one workshop offering, not event slots. The same participant count can be defined once per offering and reused across bookings. For a one-off negotiated price, the KPX team sets the final price in that booking's proposal rather than creating a duplicate shared tier.

The success screen includes **Request another event**. It starts a new request while retaining the customer's contact details and selected workshop/tier, and clears date- and venue-specific fields. The offering selector displays the configured offering title alongside its category so similarly categorized offerings remain distinguishable.

## Certificate proof-of-work review

Admins review student submissions in **Admin → Certificates → Proof submissions**. The certificate API returns a signed authenticated Cloudinary `proofAccessUrl` for each submission; the frontend must use that field rather than exposing stored `proofUrl` or `proofPublicId` values. Image proofs (JPEG, PNG, WebP) are previewed inline, while PDFs are opened through the secure proof link. The admin list also displays the original filename and uploaded size. If an image cannot load, the card retains an explicit fallback and the secure original link so the review is still possible.

## Shared frontend upload optimization

All frontend file-upload API paths should pass selected files through `prepareUploadFile` or `prepareUploadFiles` from `src/lib/fileCompression.ts` before creating the multipart request. The utility optimizes supported raster images (JPEG, PNG, WebP) in the browser: it applies EXIF orientation, caps the longest edge at 2,560 px, encodes WebP at progressively lower quality, and keeps the original if encoding fails or does not reduce the file size. It skips small images under 350 KB to avoid needless re-encoding.

GIFs are passed through unchanged to preserve animation. SVG, PDF, video, audio, archives, and other formats are also passed through unchanged because an image codec is not a valid or safe compressor for those formats. The shared helper still handles these uploads consistently; format-specific document/video optimization would require a separate validated pipeline. Upload limits must still be enforced by the UI and backend after preparation.


## Technical SEO and static prerendering

The public application uses React Router framework mode with static prerendering enabled (`ssr: false`). The production build generates HTML for the approved public routes and hydrates the existing React application on the client. A shared public-route manifest drives both prerender path discovery and sitemap generation.

The prerender manifest includes the static public routes `/`, `/about`, `/programs`, `/certificates`, `/resources`, `/gallery`, `/faq`, and `/souvenirs`, plus active programme details, published resource readers, and active non-archived souvenir products. Build-time loaders prefetch public API data into the React Query cache so route content and metadata can be rendered into the generated HTML. The build fails if the required public catalogue data cannot be fetched; keep the Render API reachable during Vercel builds.

Each route emits its own title, description, canonical URL, Open Graph metadata, Twitter metadata, and robots directives. The root document includes default metadata and EducationalOrganization JSON-LD. The `/courses` alias canonicalizes to `/programs`. Payment-result and tokenized guest-access routes are marked `noindex, nofollow` and excluded from the sitemap. Their paths remain crawlable in `robots.txt` so search engines can read those directives. Admin paths remain disallowed from crawling; authentication, not `robots.txt`, is the access-control boundary.

The sitemap is regenerated before every build from the same public-route manifest. Only active programmes, published resources, and active non-archived souvenir products are included. If the public API is unavailable, the build fails rather than publishing a stale sitemap. Never add private guest-access URLs, admin pages, payment pages, registration pages, or query-string variants.

The React Router/Vercel preview build completed and logged HTML prerender output for 21 routes, including the SPA fallback. After the production release, verify direct HTTP responses and page metadata, check `/robots.txt` and `/sitemap.xml`, then submit the sitemap in Google Search Console. Catalogue changes require a new build/deployment to update static HTML and the sitemap; an authenticated automatic rebuild hook remains future work.


## Public-site visual consistency and accessibility remediation

**Status:** Source inventory complete; accessibility audit and remediation in progress.  
**Scope:** Public-facing website only. The admin workspace is excluded unless a later, separately approved audit identifies an issue.

### Audit findings

The public pages currently use multiple hero implementations and layout conventions. The observed differences include:

- Different content-width limits, including approximately 1,152 px, 1,280 px, and a wider homepage layout.
- Inconsistent horizontal and vertical section padding.
- Different heading sizes, eyebrow styles, line heights, and description widths.
- Different hero compositions (image-backed, solid-background, and split layouts) without a shared structural standard.
- Brand colours are defined both as Tailwind theme tokens and as page-level literal colours. The configured primary value (#1D4ED8) does not match the navy used in several public sections (#17324D).
- The existing brand palette includes navy (#17324D), teal (#2A7F7F), warm cream (#F7F5F0), soft coral (#F3D7CC), and magenta accents (#D94A91, #8B1E5A). These need semantic roles rather than competing definitions.

A preliminary contrast check of solid colour pairs identified likely WCAG AA risks. The figures below are recalculated against the exact hex values and must be interpreted in the context of the actual rendered pairing:

| Foreground | Background | Approx. contrast | Interpretation |
|---|---|---:|---|
| #D94A91 | #FFFFFF | 3.93:1 | Fails normal-text AA; can pass large-text AA |
| #D94A91 | #FAF8F5 | 3.71:1 | Fails normal-text AA; can pass large-text AA |
| #D94A91 | #F7F5F0 | 3.61:1 | Fails normal-text AA; can pass large-text AA |
| #D94A91 | #07152F | 4.61:1 | Passes normal-text AA for this flat pairing |
| #D94A91 | #212529 | 3.92:1 | Fails normal-text AA; passes large-text AA if the text meets WCAG large-text sizing |
| #2A7F7F | #FAF8F5 | 4.46:1 | Slightly below normal-text AA |
| #2A7F7F | #F7F5F0 | 4.34:1 | Fails normal-text AA |
| #2A7F7F | #FFFFFF | 4.73:1 | Passes normal-text AA |
| #17324D | #FFFFFF | 13.13:1 | Passes |
| #8B1E5A | #FFFFFF | 8.64:1 | Passes |
| #212529 | #8B1E5A | 1.79:1 | Fails; this pairing is present in the About-page callout |
| #6B7280 | #FAF8F5 | 4.56:1 | Passes normal-text AA |
| #F4DCD6 | #17324D | 10.04:1 | Passes |

Important correction: the bright magenta heading colour is not automatically a failure everywhere it appears. In the inspected hero source it is used over dark backgrounds; its solid-colour ratios are 4.61:1 over #07152F and 3.92:1 over #212529. The About-page heading is large text and may meet the 3:1 large-text threshold for the flat colour pair, but its photographic background and overlay still require rendered-state testing. The clear source-level failure found so far is dark charcoal text (#212529) on the deep-magenta (#8B1E5A) About-page callout. The teal text colour (#2A7F7F) is also just below normal-text AA on the warm background token (#FAF8F5).

These calculations are for opaque, flat colour pairs only. They do not certify text over photographs, gradients, overlays, transparency, hover states, or disabled states. Large text has a 3:1 WCAG AA minimum; normal text has a 4.5:1 minimum. Non-text UI components and meaningful graphical objects generally require 3:1 contrast against adjacent colours.

### Verified source inventory (Phase 0)

The route tree in `src/router.tsx` confirms these public routes:

- Core pages: `/`, `/about`, `/register`, `/programs`, `/courses` (alias), `/programs/:slug`, `/certificates`, `/resources`, `/resources/:slug`, `/gallery`, and `/faq`.
- Payment and guest workflows: `/payment/success`, `/payment/failed`, `/workshops/book`, `/workshops/track-booking`, `/workshops/access/:reference/:token`, `/souvenirs`, `/souvenirs/enquire`, `/souvenirs/:resource/access/:token`, and `/souvenirs/:slug`.
- The public shell is shared through `src/components/layouts/Layout.tsx`, with a sticky `SiteHeader`, route content, and `SiteFooter`. The admin route tree is separate and remains out of scope.

The source-level hero inventory confirms the following differences:

| Page | Current structure | Measured source conventions |
|---|---|---|
| Homepage | Dynamic, image-backed carousel | 1,440 px content width; px-5 / sm:px-8 / lg:px-12; top padding 16 / 20 / 24; min-height 650 / 690 / 720 px |
| About | Image-backed split layout | Shared 1,280 px Container; vertical padding 20 / 28 / 36; H1 5xl / 6xl / 7xl |
| FAQ | Solid navy hero with search | Outer px-5 / sm:px-8 plus nested Container gutters (double horizontal padding); vertical padding 16 / 20 |
| Gallery | Image-backed dark hero | max-w-6xl (1,152 px); outer px-5 / sm:px-8; vertical padding 16 / 20; H1 4xl / 6xl |
| Resources | Image-backed dark hero with search | max-w-6xl (1,152 px); outer px-5 / sm:px-8; vertical padding 16 / 20; H1 4xl / 6xl |
| Certificates | Image-backed hero with two actions | Shared 1,280 px Container; vertical padding 16 / 20; H1 4xl / 5xl |
| Training programmes | Image-backed hero | Shared 1,280 px Container; vertical padding 16 / 20 / 28; H1 4xl / 5xl / 6xl |
| Souvenir catalogue | Image-backed hero | Shared 1,280 px Container; vertical padding 16 / 20 / 28; H1 4xl / 5xl / 6xl |
| Workshop booking | Image-backed hero | Shared 1,280 px Container; vertical padding 14 / 20 / 24 |
| Souvenir enquiry | Solid hero | Shared 1,280 px Container; vertical padding 14 / 20 |

Registration, programme detail, resource reader, payment result, booking tracker, guest-access, and product/enquiry detail screens use task-specific layouts rather than marketing heroes. They remain in the accessibility and responsive audit, but should not be forced into the marketing-hero component.

The FAQ double-gutter issue was corrected during migration by removing the redundant nested Container. The About and Certificates heroes have also been migrated; the About callout now uses white text on deep magenta to correct the identified source-level contrast failure. Training Programmes, Souvenir Catalogue, Workshop Booking, and Souvenir Enquiry now use the shared hero. The public layout includes a keyboard skip link targeting the main content region.

### Existing design-system inventory

- `src/styles/design-system.css` already defines root CSS variables, typography (Sora and Inter), a 1,280 px content/container width, spacing scale, radii, focus styling, and legacy semantic colour variables.
- `tailwind.config.js` separately defines Tailwind colour tokens. Its legacy `primary` is royal blue (#1D4ED8), while several public pages use literal navy (#17324D) and teal (#2A7F7F).
- Page-level literals remain in public and admin files. The inventory must preserve the admin boundary: do not globally change existing `primary`, `secondary`, or legacy variables until their admin and public consumers are fully mapped.
- The current public shell header is sticky and uses the shared Container. Header and footer states are included in the later contrast review.

### Remediation phases and completion criteria

#### Phase 0 — Baseline and inventory
- [x] Confirm the public routes and identify the marketing hero/header implementations from the route tree and page source.
- [x] Inventory the shared public shell, existing design-system variables, Tailwind tokens, typography, container widths, and spacing conventions for the inspected public pages.
- [x] Record the supplied mobile PageSpeed baseline: FCP 1.8 s, LCP 64.5 s, TBT 0 ms, CLS 0.052, and Speed Index 9.3 s. The screenshot does not identify the exact tested route or expose the LCP element.
- [ ] Capture representative rendered screenshots at mobile, tablet, and desktop widths. Source inspection cannot establish actual visual alignment or overlay contrast.
- [ ] Record a desktop PageSpeed baseline under comparable conditions.
- [ ] Identify the LCP element and inspect its request timing before attributing the delay to Render, images, or application code.

**Phase 0 status:** Source inventory is complete for the confirmed public route tree and the primary marketing heroes. Rendered screenshot baselines, desktop performance data, and LCP-element diagnosis remain outstanding. These gaps do not prevent defining additive design tokens, but they must be closed before declaring the full baseline/verification work complete.

#### Phase 1 — Authoritative design tokens
- [x] Add semantic public-site colour roles for page backgrounds, primary text, muted text, headings, links, primary/secondary actions, borders, and focus indicators.
- [ ] Reconcile Tailwind theme values with the approved KPX brand palette; remove conflicting definitions only after all usages are mapped.
- [x] Select accessible text variants for magenta and teal where the existing brand colour does not meet the required contrast. The deep-magenta text variant is #8B1E5A; the accessible teal text variant is #287979.
- [x] Preserve bright magenta (#D94A91) as an accent and avoid using it for normal-sized text on light surfaces.
- [ ] Standardise the public typography scale using Sora for headings and Inter for body text.

**Phase 1 progress:** Additive semantic tokens have been introduced in `src/styles/design-system.css` and exposed through the Tailwind `kpx` colour namespace. Existing `primary`, `secondary`, and legacy semantic tokens were deliberately left unchanged to avoid unintended effects on admin screens and existing components. The new teal text token (#287979) provides at least 4.70:1 contrast against #F7F5F0 and 4.83:1 against #FAF8F5. Full public-page usage mapping and typography standardisation remain outstanding.

**Exit criteria:** One documented source of truth for public design tokens, with contrast values verified for intended text/background pairings. This phase remains in progress until all in-scope page usages are mapped and the typography scale is standardised.

#### Phase 2 — Shared public-page hero structure
- [x] Introduce a reusable public-page hero component with solid and image-backed variants.
- [x] Standardise content width, responsive horizontal gutters, vertical spacing, eyebrow placement, H1 scale, description width, and optional icon/search content.
- [x] Keep page-specific copy, imagery, and search controls configurable.
- [x] Add a restrained entrance animation that respects `prefers-reduced-motion`.
- [x] Use icons as visual signposts where they clarify the page purpose; decorative icons are hidden from assistive technology and controls retain text labels.
- [x] Add a split-layout variant for pages that need a side-by-side hero composition.
- [ ] Inspect hero alignment and text/image contrast at mobile, tablet, and desktop breakpoints.

**Phase 2 progress:** `src/components/ui/PublicPageHero.tsx` now supports solid, image-backed, and split layouts. FAQ, Gallery, Resources, About, Certificates, Training Programmes, Souvenir Catalogue, Workshop Booking, and Souvenir Enquiry use the shared component. The FAQ search control, certificate actions, workshop booking flow, and souvenir enquiry flow remain functional. A keyboard-visible skip link now moves focus to the main content region. The About page retains its side-by-side promise panel through the split variant. Hero content has a short opacity/vertical entrance transition; the transition is disabled when the user requests reduced motion. The homepage carousel now has an explicit pause/play control, pauses when users focus or hover over it, and does not auto-rotate when reduced motion is requested. Slide changes are not announced automatically to screen readers. No animation is required to reveal information or operate controls.

**Animation and icon rules:** Motion is progressive enhancement only. Respect `prefers-reduced-motion`, avoid parallax and continuously moving decorative elements, and do not animate essential content in a way that delays access. Icons should reinforce a visible text label, not replace it; decorative icons must be `aria-hidden`, and icon-only buttons require accessible names.

**Exit criteria:** Shared structural rules are used by all in-scope public pages, with no unintended visual regressions at mobile and desktop breakpoints. This phase remains in progress until the split variant, remaining page migrations, and rendered responsive review are complete.

#### Phase 3 — Public-page migration
- [x] Migrate the remaining public informational/catalogue pages to the shared hero structure where appropriate. The homepage retains its carousel-specific composition and now has accessible motion controls.
- [x] Retain intentional page-specific compositions (for example, split layouts) through documented variants rather than one-off spacing overrides.
- [ ] Remove obsolete page-level hero styles only after confirming they have no remaining consumers.

**Exit criteria:** All in-scope public pages follow the shared spacing, alignment, and typography rules while retaining their intended imagery and content.

#### Phase 4 — WCAG 2.2 AA contrast and interaction states
- [x] Add a keyboard-visible skip link to the main content region.
- [x] Restore keyboard focus to the mobile navigation trigger when the menu is dismissed with Escape.
- [x] Associate workshop and souvenir enquiry forms with their headings, expose submission state, and announce submission errors; expose the selected-file count as a polite live status.
- [ ] Correct normal-text contrast to at least 4.5:1 and large-text contrast to at least 3:1.
- [ ] Check links, buttons, navigation, form labels, placeholders, helper/error text, badges, footer text, and text over images/gradients.
- [ ] Check non-text controls, boundaries, and meaningful graphical indicators for applicable 3:1 contrast.
- [ ] Provide visible keyboard focus indicators and verify hover, active, disabled, and error states.
- [ ] Do not rely on colour alone to communicate status or errors.

**Progress:** Structural keyboard and form-feedback improvements are in place. Contrast mapping and rendered checks of all public controls, navigation states, and text over images remain outstanding.

**Exit criteria:** Automated contrast checks pass for applicable states, and manual inspection confirms image/gradient overlays and interactive states are readable.

#### Phase 5 — Verification and regression checks
- [ ] Run the production build and repository CI checks.
- [ ] Inspect representative public routes at mobile, tablet, and desktop widths.
- [ ] Run an accessibility scan and manually review keyboard navigation, focus order, headings, and link purpose.
- [ ] Re-run PageSpeed Insights under comparable test conditions and compare against the recorded baseline.
- [ ] Record remaining exceptions and follow-up work in this README.

**Exit criteria:** Build and CI pass; no material layout regressions; documented WCAG issues are resolved or explicitly tracked with rationale.

### Performance investigation — separate workstream

The mobile PageSpeed capture recorded FCP 1.8 s, LCP 64.5 s, TBT 0 ms, CLS 0.052, and Speed Index 9.3 s. A free Render web service may spin down after inactivity and delay the initial server response, but this does not prove that the full LCP delay is caused by Render. The LCP element, request waterfall, server response timing, and image/resource loading behaviour must be inspected before choosing a fix. Performance remediation must preserve the good TBT and CLS results.

### Phase 5 — Performance and production quality (in progress)

**Baseline available:** A prior mobile PageSpeed capture recorded FCP **1.8 s**, LCP **64.5 s**, TBT **0 ms**, CLS **0.052**, and Speed Index **9.3 s**. This is a historical baseline, not a current post-change measurement. The very high LCP must not be attributed to Render cold starts without identifying the LCP element and separating document TTFB, image transfer/decode, font loading, and client-side work.

#### Initial source audit and targeted optimisations

- The document root previously fetched site branding separately just to update the browser favicon, even though the public header already fetches/caches the same branding record. The duplicate request has been removed; the header now updates the favicon from its existing React Query data.
- The brand fonts were loaded through CSS `@import`. This has been removed; Google Fonts stylesheet loading now lives in the document head, with preconnect hints for `fonts.googleapis.com` and `fonts.gstatic.com`. This removes the CSS import chain and allows the browser to establish font connections earlier. It does not guarantee that font loading is no longer render-blocking; verify the waterfall and fallback-font behaviour.
- The homepage hero previously rendered every carousel image at once. It now renders only the active slide and its next slide, assigning high fetch priority to the active image and low priority to the next. This reduces the initial hero image request set from all slides to at most two, while keeping the next slide ready for the carousel transition.
- The five hardcoded Unsplash fallback hero images have been reduced from 2,200 px at quality 85 to 1,600 px at quality 75. Confirm actual transferred formats and byte sizes in the browser; uploaded admin-managed hero images are not transformed by this change.
- Existing static prerendering and route-specific metadata remain the SEO baseline. The shared route manifest drives generated public HTML and sitemap entries; private, payment, and tokenized access routes must remain excluded from indexing. Do not switch to runtime SSR or change the hosting architecture without evidence.

- The first PageSpeed retest (Moto G Power, slow 4G) reports LCP **21.8 s**, FCP **1.8 s**, TBT **0 ms**, CLS **0**, Speed Index **4.4 s**, and Performance **71**. Lighthouse estimates **6,334 KiB** of image savings; the two admin-managed homepage hero images alone transfer about **3.49 MB** and **2.82 MB**. This confirms image delivery is the immediate optimisation target, not main-thread blocking.
- The hero now requests only the active slide on initial load. The previously rendered next slide was positioned inside the viewport and could still be fetched by the browser despite its lazy hint. Cloudinary-hosted hero images now request automatic format/quality and a responsive width set (480–1,920 px); the browser selects a suitable candidate using `sizes="100vw"`. The header logo is also requested at a bounded 128 px width instead of downloading the full 1,600 × 900 source.
- The report labels its device profile as **Moto G Power** and its score calculator as **mobile**; it is therefore treated as a mobile run even though the pasted page heading says “computer Desktop.” The report also flags a 720 ms render-blocking opportunity, 143 KiB of unused JavaScript, 7,183 KiB total payload, one contrast issue, and browser console errors. These are secondary investigations after the oversized image requests are corrected.
- The report's two hero images both appear as eager/high-priority resources, which conflicts with the expected low-priority next-slide source behaviour. Removing the second in-viewport image from the initial DOM makes that initial request behaviour explicit rather than relying on native lazy-loading thresholds.

- The follow-up mobile report records LCP **4.9 s**, down from **21.8 s**, with FCP **1.8 s**, TBT **0 ms**, and CLS **0**. The reported Accessibility score is 96, but the contrast audit flags two homepage headings.
- Root cause: the global `h1–h6` rule in `design-system.css` assigns headings the charcoal colour directly. In the two homepage sections, `text-white` was only inherited from the parent section, so it did not override the heading's own colour declaration. Charcoal text against deep magenta/navy is low contrast. Both headings now explicitly declare `text-white`; the blush-highlighted inline phrases retain their explicit accent colour.
- The PageSpeed report URL could not be fetched directly in this review environment. The pasted failing-element details were cross-checked against the current source, which exposed the heading-specific CSS cascade issue. Re-run the contrast audit after deployment to verify the fix.

#### Phase 5 verification still required

- Capture a fresh mobile and desktop Lighthouse/PageSpeed run against the deployed production build, using the same URL, device profile, network conditions, and test location as the baseline where possible.
- Record LCP element, TTFB, FCP, LCP subparts, CLS contributors, INP/TBT, total transfer size, request count, image byte sizes, and font loading waterfall. Compare field data (CrUX, if available) separately from lab data.
- Check homepage, programmes, programme detail, resources, resource detail, souvenirs, souvenir detail, gallery, and certificates. Verify that prerendered HTML contains meaningful route content and metadata without waiting for client-side API requests.
- Inspect image dimensions, responsive delivery, caching headers, third-party requests, JavaScript chunk sizes, and console/network errors. Do not lazy-load the actual LCP image; below-the-fold media should remain lazy-loaded.
- Run production regression flows: registration and Paystack return, certificate verification/proof submission, workshop booking and guest tracking, souvenir enquiry, and admin login/content management. Admin checks are regression coverage only; the public-site visual remediation remains out of scope for admin.
- Phase 4 browser verification remains open in parallel: keyboard navigation, screen-reader announcements, zoom/reflow, focus visibility, and reduced motion.

**Evidence boundary:** The changes above are source-level optimisations. No new Lighthouse/PageSpeed measurement, browser waterfall, bundle analysis, or full production regression run has been completed yet. Do not claim a score improvement until comparable measurements confirm it.

### Working rules

- Keep this README updated as each phase starts, changes scope, and passes its exit criteria.
- Make targeted changes; do not perform broad visual rewrites without a route-by-route comparison.
- Keep admin pages out of scope for this public-site remediation.
- Do not claim WCAG compliance based only on a Lighthouse score or a few colour-pair calculations.
- Do not claim a performance improvement from a hosting change without comparable measurements.

### Phase 4 — WCAG 2.2 AA contrast audit (in progress)

The public footer uses the Tailwind `bg-primary` token (`#1D4ED8`). Its descriptive and copyright text previously used `text-white/75`, which composites to approximately `#C6D3F5` and yields a 4.48:1 contrast ratio against that background. This is below the 4.5:1 requirement for normal text. The footer text opacity has been raised to `text-white/80` (approximately 4.89:1 for the same flat pairing). Footer links already use `text-white/80`; their blush hover/focus colour has approximately 5.12:1 contrast against the footer background.

These are calculated flat-colour values, not a full rendered-page certification. Remaining work includes auditing every public-page text/control pairing, including translucent text, focus indicators, badges, disabled states, and image-backed heroes, then verifying keyboard operation, responsive layouts, and form error states in a browser. Do not mark WCAG conformance complete based on token calculations alone.

#### Keyboard and landmark remediation — completed in source

- Replaced page-level `<main>` wrappers in FAQ, Gallery, About, Certificate, and Resource Reader route components with neutral containers. The shared public `Layout` owns the single main landmark; route components must not introduce nested main landmarks.
- Gallery category filters now expose their selected state with `aria-pressed` and have explicit `focus-visible` rings. The filter controls remain native buttons and retain their existing URL-driven selection behavior.
- The FAQ disclosure controls use native `<details>/<summary>`, preserving keyboard-operable disclosure behavior.

This is a source-level remediation. Verify the actual route tree and keyboard focus order in a browser before treating the landmark audit as closed. Login and admin layouts are separate route surfaces and are not part of the public shared-layout correction.


#### Public form validation and submission feedback — source remediation

The public-form source review identified and corrected these issues:

- Training registration now associates its form with the page heading, marks the three required controls with native `required` semantics while retaining the existing custom validation flow, announces the presence/count of validation errors, and exposes the pending state through `aria-busy`. Existing per-field `aria-invalid` and `aria-describedby` relationships remain in place.
- Certificate-number verification now requires a value, exposes its pending state, and announces the returned verification result through a polite status region.
- Proof-of-work submission now includes file preparation inside the guarded submission lifecycle. Preparation failures are caught and shown through the existing error announcement; the form exposes its pending state. The post-optimization 10 MB limit remains enforced.

Workshop booking already uses native required-field validation, labelled controls, a grouped venue radio set, an `aria-busy` form state, and an assertive submission error region. Its dynamic venue/custom-workshop requirements remain conditional on the selected options.

**Verification boundary:** These are source-level checks and targeted code corrections. No browser-driven keyboard/screen-reader session, live API submission, production build, lint run, or CI result has been established by this review. Those remain explicit Phase 5 tasks.

- Workshop booking's successful-request state now exposes its confirmation message as a polite status announcement, complementing the existing assertive submission-error feedback.


#### Phase 4 — Interaction, focus, and status-message audit (source pass)

The next source review found several gaps in the public experience and applied targeted fixes:

- Two public forms (training registration and certificate verification/proof submission) used 70%-opacity muted placeholders. On white, the effective colour was approximately `#979CA6`, giving about **2.76:1** contrast. Both now use the full muted-text colour (`#6B7280`), approximately **4.83:1** on white.
- Several controls used low-opacity focus rings (`/15`, `/20`, or `/30`) while also resetting the native outline. The public layout now supplies a high-visibility, 3 px deep-magenta outline with a white separation halo. The selector is scoped to `.public-site-shell` so the separate admin workspace is not changed by this public-site remediation.
- Client-side route changes now move keyboard focus to the shared main-content landmark. This prevents focus from remaining on a navigation link that no longer represents the newly rendered page, including when a mobile menu closes after navigation.
- Payment verification state changes now have a polite status announcement, and the result panel exposes its busy state.
- Workshop booking tracking now exposes pending states and the verification-code transition to assistive technology, and its forms expose `aria-busy`.
- Successful souvenir enquiry submission now announces the confirmation state.
- A further contrast pass found white text at 70% and 75% opacity over the royal-blue background (`#1D4ED8`) below normal-text AA (approximately **4.10:1** and **4.48:1**). The homepage CTA, About-page CTA, and programme-detail CTA now use 80% white text, approximately **4.89:1**.
- Two muted About-page text treatments also failed on their light surfaces: charcoal at 60% opacity on white was approximately **4.19:1**, and at 65% opacity on blush was approximately **4.36:1**. Both are now 70% opacity, yielding approximately **5.76:1** on white and **5.04:1** on blush.
- Public form-control and outlined-action boundaries previously used very pale neutral borders (about **1.29:1** against white). Public text inputs, selects, textareas, and outlined buttons/links now use a stronger neutral boundary when idle (`#767676`, at least **3:1** on the audited light surfaces). FAQ/resource hero search containers and homepage carousel controls also have stronger boundaries; the final blue CTA uses the blush border, which exceeds **5:1** on royal blue.

**Contrast notes:** The flat colour pairs `#8B1E5A` on white and warm-white backgrounds are approximately 8.64:1 and 8.15:1. The public muted-text token `#6B7280` is approximately 4.83:1 on white and 4.56:1 on `#FAF8F5`. The bright teal `#2A7F7F` remains below normal-text AA on warm-white at approximately 4.46:1; do not use it for normal-sized text on that surface. These calculations do not certify translucent, photographic, gradient, hover, or disabled states.

**Still requiring browser verification:** Test route-change focus, skip-link operation, the new dual focus indicator against light and dark components, mobile menu keyboard behavior, all form error/success announcements, zoom/reflow, and reduced-motion behavior. A source edit is not proof that a screen reader/browser combination announces content correctly. No browser-driven keyboard or screen-reader session has been completed yet.


## November 2026 PageSpeed follow-up

The latest mobile Lighthouse run reported a 6.3 s LCP with the homepage hero still correctly discovered in the initial document and requested with eager loading/high fetch priority. The reported LCP subparts show a 1.73 s element-render delay; TTFB was 10 ms and image resource load duration was 410 ms. These subparts do not account for the full reported LCP, so they are diagnostic clues rather than a complete timing explanation. The run had no CrUX field data.

The same report identified oversized responsive programme-card imagery and repeated generic “View details” link names. Programme cards now request bounded Cloudinary widths with responsive `srcSet` values where the media URL is a Cloudinary image, and the CTA links include the programme title in their accessible names. Non-Cloudinary media URLs are left unchanged by the shared URL helper.

The report also showed cross-origin failures for `/api/auth/me` and public training-media requests. The backend CORS configuration was corrected separately: the production apex and www origins are explicitly allowed, and CORS now runs before the global rate limiter so 429 responses retain readable CORS headers. This is a source-level fix only until the backend deploy is live and the actual response headers and Render logs are checked.

Still outstanding: investigate the hero element-render delay using a browser performance trace; optimise the 220 KB `/homepagehero.jpg` and the 164 KB training image if those assets are confirmed to be served on the measured route; inspect Google Fonts and unused-JavaScript costs before changing loading strategy; and rerun PageSpeed after both deployments. Do not infer a Render cold-start problem from the current 10 ms TTFB measurement.

#### Phase 5A — remaining image payload (source change in progress)

The latest mobile PageSpeed run supplied on 13 November 2026 reports Performance **83**, LCP **4.6 s**, FCP **1.8 s**, TBT **0 ms**, CLS **0.013**, and Speed Index **1.8 s**. Its current LCP image is already a small Cloudinary hero image (~50 KiB) with a healthy reported LCP subpart breakdown (10 ms TTFB, 50 ms resource delay, 50 ms resource duration, 150 ms element-render delay). Do not regress or unnecessarily rewrite that LCP path.

The remaining image audit identified two separate opportunities:

- **Site logo:** the header already requests a 128 px Cloudinary transformation, but the footer used the original Cloudinary PNG. The footer now uses the same bounded 128 px transformation, declares intrinsic dimensions, and defers this below-the-fold image with lazy loading and asynchronous decoding. This removes the inconsistent full-resolution logo request when the URL is a Cloudinary image. The actual byte reduction must be confirmed in the deployed browser network panel; the previous report showed the untransformed logo at about 101 KiB and a transformed logo variant at about 3 KiB, but those figures are not a verified before/after comparison for this code change.
- **Local homepage section image:** `/homepagehero.jpg` is a local public asset (~220 KiB in the supplied Lighthouse report), displayed at roughly 651 × 651 CSS pixels while its source is 1280 × 895. It is below the LCP hero and is already lazy-loaded through the shared `SiteImage` component. The Cloudinary helper intentionally leaves local URLs unchanged, so adding Cloudinary transformations would do nothing. The next safe step is to create and compare a correctly cropped, responsive modern-format local variant (e.g. WebP/AVIF), then update the source only after visual comparison confirms that the crop and quality are preserved. That binary optimisation has not been performed in this source pass.

**Verification boundary:** this commit is a targeted source change and README update. No production build, CI result, deployed network waterfall, or new PageSpeed run has been verified here. Re-run the same mobile test after deployment and confirm that the footer requests the transformed logo rather than the original asset. Record the measured transfer size before claiming a saving.

#### Phase 5B — font request consolidation (source change in progress)

The latest mobile PageSpeed report identifies Google Fonts CSS as a render-blocking request (~750 ms in the lab trace) and shows multiple Inter/Sora font resources in the critical request chain. The document already preconnects to `fonts.googleapis.com` and `fonts.gstatic.com`, and the stylesheet uses `display=swap`; adding more preconnects or changing to `font-display: optional` without evidence is not justified.

The Google Fonts request now asks for variable weight ranges instead of enumerating separate static weights:

- Inter: 400–700
- Sora: 400–800

This matches the public site's observed body and heading weight usage, including the 800-weight Sora homepage heading, while allowing the browser to select intermediate weights from variable font files. It is intended to consolidate font resources; it does **not** remove the render-blocking stylesheet dependency and must not be described as a measured performance gain until the deployed network waterfall confirms fewer/smaller font transfers and the PageSpeed retest confirms the effect.

**Next verification:** inspect the generated Google Fonts CSS and deployed font requests, confirm all required weights render without synthetic-weight regressions, check heading/layout stability (CLS), then compare mobile PageSpeed using the same conditions. If the CSS request remains the dominant delay, evaluate self-hosted WOFF2 files with correct subsets and font metric overrides as a separate change; do not add speculative preload hints.

**Remaining Phase 5A item:** the local `/homepagehero.jpg` binary has not yet been converted. It is already lazy-loaded and is not the LCP image. A correctly cropped WebP/AVIF derivative still requires visual comparison before swapping the asset; no fake Cloudinary transform or unverified external image proxy will be introduced.


#### Phase 5C — avoid anonymous current-user requests (source change in progress)

The frontend previously mounted `AuthBootstrap` around the entire application, and that component unconditionally ran `useCurrentUser`. As a result, every public page and the administrator login page could call the protected `GET /auth/me` endpoint even when no administrator session was needed. The latest Lighthouse report showed a 401 response for this request. A 401 is an expected response for an unauthenticated request, but making that request on every public visit is unnecessary noise and avoidable network work.

The auth bootstrap now enables the current-user query only on protected `/admin` routes, excluding `/admin/login`. Public routes and the login page no longer initiate the current-user request. When a protected admin route is entered, the existing session check still runs before `AdminRoute` grants access. Login and logout mutations, cookie handling, endpoint contracts, and authorization enforcement are unchanged.

**Verification boundary:** this is a targeted frontend source change. Confirm after deployment that public pages and `/admin/login` do not request `/api/auth/me`, while a direct visit to `/admin` still checks the existing session and redirects unauthenticated visitors to `/admin/login`. Also verify a successful login still reaches the dashboard and a page refresh preserves a valid administrator session. No build, CI result, browser network trace, or production authentication regression test has been completed in this source pass.


#### Phase 6A — baseline security response headers (source change)

The production Vercel response already includes `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. Do not add a duplicate HSTS header in `vercel.json`.

The frontend's `vercel.json` now adds these response headers to all routes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

These are baseline hardening controls and do not require an application script/style allowlist. The existing SPA rewrite is retained.

**Deliberately deferred:** no enforced Content Security Policy, COOP, or Permissions-Policy has been added. CSP requires an inventory of inline scripts, Google Fonts, Cloudinary, payment and authentication integrations, and any other runtime origins. COOP can interfere with popup-based authentication/payment flows. Permissions-Policy must be based on actual browser API usage. The next security step is to inspect the deployed response headers and run registration, Paystack, Google sign-in, and admin-login regression checks before adding those policies.

**Verification boundary:** the configuration change is committed, but the Vercel deployment and response headers have not yet been verified. Do not treat Phase 6A as deployed until the Vercel build is READY and the response headers are confirmed on the production domain.


#### Phase 6A verification — baseline headers deployed

The Vercel production deployment for the baseline header commit and its README follow-up reached **READY**. A direct fetch of the deployed root response confirmed:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (already present from the platform configuration)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

The existing SPA fallback rewrite to `/__spa-fallback.html` was preserved. The fetched `/admin/login` path also returned HTTP 200 with the SPA fallback document, as expected for this client-routed application; this verifies routing fallback delivery, not interactive login behavior. Browser-level authentication, payment, and registration regression tests remain outstanding.

#### Phase 6B — report-only Content Security Policy (source change)

A `Content-Security-Policy-Report-Only` header has been added for observation before enforcement. It allows the currently identified runtime dependencies: same-origin application resources, the Render API, Cloudinary images, Google Fonts styles/fonts, and the backend-hosted PDF resource iframe. Inline scripts and styles remain allowed in this report-only policy because the React Router SPA document includes inline hydration/runtime code and JSON-LD, and the app uses inline styling patterns. `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'none'` are included in the policy.

**Important limitations:** report-only does not block resources; it only surfaces policy violations in browser developer tools. No CSP reporting collector is configured, so violations are not centrally collected. The policy is an initial inventory, not proof that every route and admin workflow is covered. In particular, verify PDF preview, Cloudinary uploads/previews, admin operations, Google sign-in if enabled, and Paystack checkout before tightening any directive. Do not convert this policy to enforced CSP until browser testing confirms there are no required-resource violations. The use of `'unsafe-inline'` means this is not yet a strong script-injection mitigation; nonce/hash-based script policy is a later hardening step and requires a compatible document-generation strategy.

**Verification boundary:** the report-only policy is committed, but its deployment and browser console reports have not yet been verified. Do not claim CSP is enforced or that the application is CSP-clean.


### Phase 7 — JavaScript bundle optimisation (admin route splitting)

The production build generated a `framework-app` chunk of 500.23 KB minified (117.34 KB gzip), alongside the shared client entry and JSX runtime. The previous Lighthouse report showed unused JavaScript, but low JavaScript execution time and zero Total Blocking Time. This means the correct first intervention is not arbitrary vendor chunking: it is removing route-specific code from the initial public download.

The route tree previously statically imported every administrator page and the administrator layout. Those modules are now loaded with `React.lazy()` and dynamic imports:

- Admin login
- Admin layout and all dashboard/management pages
- Testimonials, certificates, training, registrations, content, gallery, resources, souvenirs, founder and organization modules

Public route imports, route paths, authorization guard placement, and route components' props remain unchanged. A shared Suspense fallback provides a status announcement while an administrator-only module loads. The admin authorization guard remains outside the lazy admin layout, so loading a page chunk does not grant access.

**Expected effect:** public visitors should not download admin-only page/layout modules until an admin route is requested. This should reduce the initial public JavaScript payload, but no byte saving is claimed until the next production build and browser network waterfall are measured.

**Regression risks to verify:** direct navigation to `/admin/login`; unauthenticated direct navigation to `/admin`; successful admin login and dashboard load; refresh on a protected admin subroute; navigation between admin modules; and public route prerendering/refreshes. Dynamic chunks must resolve correctly on the deployed Vercel origin.

**Verification boundary:** source change committed; production build, CI and deployment checks are pending. Do not mark Phase 7 complete until build output shows admin chunks separated from the initial framework chunk and the production routes above are verified.


#### Phase 7B — public route code splitting (source change)

The public route tree now keeps only the homepage eager. The other public pages are loaded through route-level dynamic imports when their URL is visited:

- About, registration, certificates, programmes and programme details
- Resources and resource reader
- Gallery and FAQ
- Payment success and failure
- Workshop booking, booking tracking and tokenized workshop access
- Souvenir catalogue, product details, enquiries and tokenized guest access

Named-export page modules are mapped explicitly to the default export expected by `React.lazy`. Existing URL patterns, route nesting, page component props, admin guard placement, and the public route manifest used by prerendering are unchanged. The homepage remains eager to avoid adding a route-chunk wait to the primary landing page and its LCP path. The shared Suspense fallback now uses a neutral “Loading page…” status message.

**Important distinction:** this change splits route modules; it does not guarantee every page dependency is absent from the initial bundle. Dependencies imported by the homepage, root document, shared layout, or common modules can still be part of the initial dependency graph. The next build audit must inspect the actual emitted chunks and preload links rather than assume all public-only dependencies have been removed.

**Regression checks required:** build and typecheck; confirm all static and dynamic URLs remain in the generated prerender output; confirm the homepage does not preload unrelated public page chunks; direct-load and refresh representative public routes; navigate between routes; verify metadata and canonical tags after route changes; and confirm the admin login/protected route flow remains intact.

**Build verification:** Vercel ran the configured build command (`react-router typegen && tsc -b && react-router build`) and reached the client build and prerender stage. The output reports `✓ built in 3.92s`, and the prerender logs show the 21-route manifest and generated HTML/data files for the public static and dynamic routes. The output also confirms distinct async chunks for public pages (for example About 15.24 KB, Program Details 12.69 KB, Training Programs 10.03 KB, Registration 9.83 KB, Certificates 12.18 KB, and Resources 4.11 KB).

The `framework-app` chunk decreased from 224.40 KB (49.53 KB gzip) after admin splitting to 67.66 KB (18.77 KB gzip) after public route splitting: a 69.9% reduction in that chunk only. This is **not** a 69.9% reduction in total initial JavaScript: the build still emits shared `entry.client` (214.80 KB), `jsx-runtime` (132.27 KB), and `registrationApi` (75.01 KB) chunks. Actual homepage transfer/preload behavior must be measured from the built HTML/network waterfall before claiming total initial-payload savings.

**Remaining verification:** the Vercel preview deployment is still marked BUILDING after the build/prerender output, so it is not yet considered deployed/ready. The preview is behind Vercel Deployment Protection, preventing unauthenticated automated fetches. Do not disable protection. Once READY, verify homepage preload behavior, direct-load and refresh representative public routes, route metadata/canonical tags, admin login/protected routes, and PageSpeed using the same mobile conditions.

**Verification boundary:** type generation, TypeScript build, Vite client build, and the 21-route prerender output are confirmed by Vercel build logs. Browser behavior, deployment readiness, total initial network transfer, and PageSpeed impact remain unverified.
