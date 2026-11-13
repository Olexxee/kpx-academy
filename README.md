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

**Status:** Audit documented; implementation not yet started.  
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

The FAQ double-gutter issue is confirmed in source: its hero section applies horizontal padding and then nests the shared Container, which applies its own horizontal padding. This should be corrected during hero migration, not patched with a one-off negative margin.

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

**Phase 1 progress:** Additive semantic tokens have been introduced in `src/styles/design-system.css` and exposed through the Tailwind `kpx` colour namespace. Existing `primary`, `secondary`, and legacy semantic tokens were deliberately left unchanged to avoid unintended effects on admin screens and existing components. The new teal text token (#287979) provides at least 4.70:1 contrast against #F7F5F0 and 4.83:1 against #FAF8F5. No page components have been migrated yet.

**Exit criteria:** One documented source of truth for public design tokens, with contrast values verified for intended text/background pairings. This phase remains in progress until all in-scope page usages are mapped and the typography scale is standardised.

#### Phase 2 — Shared public-page hero structure
- [ ] Introduce a reusable public-page hero component with explicit variants for solid, image-backed, and split layouts.
- [ ] Standardise content width, horizontal gutters, vertical spacing, eyebrow placement, H1 scale, description width, and CTA spacing.
- [ ] Keep page-specific content, imagery, and visual identity configurable; do not force every page into an identical composition.
- [ ] Ensure mobile layouts stack predictably, avoid clipped text, and retain readable spacing.
- [ ] Preserve existing hero image loading behaviour unless measured evidence supports a change.

**Exit criteria:** Shared structural rules are used by the in-scope public pages, with no unintended visual regressions at mobile and desktop breakpoints.

#### Phase 3 — Public-page migration
- [ ] Migrate the homepage and each public informational/catalogue page to the shared hero structure where appropriate.
- [ ] Retain intentional page-specific compositions (for example, split layouts) through documented variants rather than one-off spacing overrides.
- [ ] Remove obsolete page-level hero styles only after confirming they have no remaining consumers.

**Exit criteria:** All in-scope public pages follow the shared spacing, alignment, and typography rules while retaining their intended imagery and content.

#### Phase 4 — WCAG 2.2 AA contrast and interaction states
- [ ] Correct normal-text contrast to at least 4.5:1 and large-text contrast to at least 3:1.
- [ ] Check links, buttons, navigation, form labels, placeholders, helper/error text, badges, footer text, and text over images/gradients.
- [ ] Check non-text controls, boundaries, and meaningful graphical indicators for applicable 3:1 contrast.
- [ ] Provide visible keyboard focus indicators and verify hover, active, disabled, and error states.
- [ ] Do not rely on colour alone to communicate status or errors.

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

### Working rules

- Keep this README updated as each phase starts, changes scope, and passes its exit criteria.
- Make targeted changes; do not perform broad visual rewrites without a route-by-route comparison.
- Keep admin pages out of scope for this public-site remediation.
- Do not claim WCAG compliance based only on a Lighthouse score or a few colour-pair calculations.
- Do not claim a performance improvement from a hosting change without comparable measurements.
