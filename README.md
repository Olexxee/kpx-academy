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
