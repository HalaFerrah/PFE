# PFE - Boat Assurance (React)

This project is a React + Vite implementation of your graduation project UI for boat assurance.

## What is included

- Pixel-focused UI based on the 3 provided screenshots.
- Step 1: Insurance Duration
- Step 2: Boat Details
- Step 3: Guarantee & Calculation
- Anonymous tester flow for first 3 steps.
- Registration page after calculation (before payment).
- Payment placeholder page.
- Language switch button EN <-> FR.

## Run

```bash
npm install
npm run dev
```

## Simple folder structure

```text
PFE/
  public/
    logo.svg
  src/
    components/
      layout/
        Header.jsx
        MainLayout.jsx
      ui/
        Stepper.jsx
    features/
      quote/
        QuoteContext.jsx
        pages/
          InsuranceDurationPage.jsx
          BoatDetailsPage.jsx
          GuaranteeCalculationPage.jsx
      auth/
        pages/
          RegisterPage.jsx
      payment/
        pages/
          PaymentPage.jsx
    i18n/
      I18nProvider.jsx
      translations.js
    router/
      AppRouter.jsx
    styles/
      global.css
    App.jsx
    main.jsx
  index.html
  package.json
  vite.config.js
  PERFECT_PROMPT.md
```
