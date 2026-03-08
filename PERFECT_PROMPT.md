# Perfect Prompt for Your Graduation Project (Boat Assurance Website)

Use this prompt with any AI code generator:

---

Build a complete production-ready React.js website named `PFE` for a boat insurance platform named CASH Assurance.

## Objective

Create a multilingual insurance quote funnel with exact UI fidelity to provided designs for the first 3 pages, then add registration and payment continuation.

## Technical requirements

- Stack: React 18 + Vite + React Router DOM.
- Language support: English and French.
- Add a visible language button in header to switch EN/FR instantly.
- Use a clean, readable, and simple folder structure.
- Keep forms controlled with shared state (Context API or equivalent).
- Fully responsive desktop/mobile.
- Use reusable components for Header, Stepper, and form blocks.

## Mandatory user flow

1. Step 1 (Insurance Duration):
   - Duration radio options: 3 Months, 6 Months, 1 Year.
   - Start date and end date fields.
   - Next button.

2. Step 2 (Boat Details):
   - Boat name, type, power, construction year, material, gross tonnage, length, width.
   - Amount field.
   - Next button.

3. Step 3 (Guarantee & Calculation):
   - Show summary of input and estimated price.
   - Continue button.

4. Registration page (new step after quote):
   - Full name, email, phone, password, confirm password.
   - User can do first 3 steps anonymously.
   - Registration is required only when user accepts price and starts payment process.

5. Payment page:
   - Confirmation/placeholder UI to proceed with payment.

## UI and design constraints

- Reproduce provided screenshots as closely as possible:
  - Large centered heading: "Join CASH Assurance"
  - Subtitle below heading
  - 3-step progress bar with circular numbered indicators and connector lines
  - Rounded white card with subtle pink border and red drop-shadow
  - Light gray page background
  - Header with CASH logo left, Login and Test controls right
- Keep visual hierarchy, spacing, sizes, and alignment consistent with mockups.
- Use CSS variables for colors.

## Code quality and organization

- Provide complete runnable code (not pseudo-code).
- Include all files: package.json, main entry, routes, components, pages, styles, i18n files.
- Keep components small and focused.
- Use readable naming conventions.
- Include a README with run instructions and folder tree.

## Deliverables

- Full source code for the project.
- Clean directory structure rooted at folder `PFE`.
- No missing imports or placeholders that break execution.
- Final result should run directly with:
  - `npm install`
  - `npm run dev`

---

Generate every file in full.
