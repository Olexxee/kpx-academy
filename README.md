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
