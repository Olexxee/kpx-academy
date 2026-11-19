# KPX Academy: About Page and Product Calculators Delivery Plan

**Status:** Planning baseline; combined calculator implementation in PR #69  
**Repository:** `Olexxee/kpx-academy`  
**Base branch at planning:** `master`  
**Scope:** About page content alignment, Resin Planning & Cost Calculator, and Lip Care Formulation Calculator  
**Source documents:** `The KPX Approach new.docx` and `KPX Calculator.docx`

## 1. Delivery strategy

Deliver this work in two independent implementation pull requests, after this planning document is reviewed:

1. **Track A — About page refresh.** Update the existing About page to reflect the approved November KPX Approach document.
2. **Track B — Product Calculators.** Add browser-only resin planning/costing and lip care formulation tools on one shared page and canonical URL.

Track A is intentionally independent of Track B and should be completed first. Track B must not be bundled into the About page PR. The calculator work may be further divided into implementation commits or sub-phases, but it should remain one coherent feature PR unless scope or review risk justifies splitting it.

No PR is to be merged by the implementation agent. The repository owner reviews and merges after CI and acceptance checks pass.

## 2. Track A — About page refresh

### Objective

Bring the existing `/about` page into alignment with *The KPX Approach new.docx*, without rebuilding the page architecture or breaking existing integrations.

### Content to align

- **Hero:** “Get to Know KPX Academy”; “Skills are the start. Possibility is the point.” Include the approved overview of practical skills, creative development and entrepreneurial knowledge.
- **Why We Exist:** Explain learning as understanding, practice where applicable, and meaningful application. Retain the source's emphasis on detailed instruction, useful resources, demonstrations where applicable and guidance.
- **Founder:** Use the approved founder story for Kepemi Oluwafunke (Keplex), including the Keplex beginnings in 2022 and the transition to KPX Academy. Keep the content readable on the page; do not turn the full narrative into an unbroken wall of text.
- **Purpose:** Use the approved purpose statement.
- **Mission:** Use the approved mission statement.
- **Vision:** Use the approved vision statement.
- **Values:** Show the four approved values:
  1. Practical Learning
  2. Quality and Integrity
  3. Creativity and Innovation
  4. Accessibility and Empowerment
- **What You Can Explore:** Show the six source categories:
  - Creative Skills & Crafts
  - Beauty & Lip Care
  - Entrepreneurship & Business Skills
  - Creative Workshops & Experiences
  - Souvenirs & Custom Gifts
  - And More

### Implementation constraints

- Update the existing `src/pages/AboutPage.tsx`; do not create a second About page.
- Preserve the current route, shared site header/footer, responsive layout conventions and design system.
- Preserve the dynamic founder profile/API integration. Do not replace it with hard-coded founder data or remove the existing admin-managed content path.
- Use the source document as the content authority. Do not add unsupported claims, promises, credentials or services.
- Keep existing calls to action and working links unless the page audit shows they are obsolete; verify any changed destination.

### Acceptance criteria

- All content sections above are represented accurately.
- Founder content remains dynamically integrated as currently implemented.
- No unrelated public or admin route changes.
- Desktop, tablet and mobile layouts remain usable.
- Accessibility basics are maintained: semantic heading order, meaningful link text, image alternatives and visible focus states.
- Build and CI pass.

## 3. Track B — Product Calculators

### Objective

Build a beginner-friendly calculator page with a resin planning/costing tool and a separate lip care formulation calculator, both running entirely in the visitor's browser.

### Product boundaries

- The original plan deferred the Lip Care Formulation Calculator. The owner has now authorized it as part of PR #69.
- Both calculators share the existing `/calculators/resin` page. Use an in-page switch; do not add a second route or a second canonical SEO page.
- The Lip Care calculator is arithmetic-only: no recipe generation, ingredient recommendations, or preloaded percentages.
- Calculations must run in the visitor's browser.
- Do not add a backend endpoint, database table, account requirement, analytics payload, remote persistence or server submission for calculator inputs.
- Do not store visitor entries in local storage/session storage unless a later explicit product decision changes this privacy boundary.
- Display currency in Nigerian naira (₦).

### Proposed routes and structure

- Dedicated calculator route: `/calculators/resin`.
- Add a calculator entry point only where the navigation and footer can link to a working page.
- Follow the repository's current routing, page metadata, layout and feature-module conventions. Confirm exact route wiring during implementation rather than duplicating route systems.
- Keep calculation logic in pure, independently testable functions, separate from React form state and presentation.

### Required calculator sections

Follow the source document's order:

1. Project Information
2. Mould Measurement
3. Resin Measurement and Mixing Ratio
4. Resin and Hardener Purchase Information
5. Additional Project Expenses
6. Mould Cost Allocation
7. Selling Price (Optional)
8. Calculation Results
9. Resin Colour Combination Guide
10. Resin Working Conditions and Safety Guide

#### Project information and mould measurement

- Optional project name/description.
- Mould shapes: round/circular, square, rectangular, oval and irregular/other.
- Measurement units: centimetres, millimetres and inches.
- Shape-specific dimensions:
  - Round: diameter and depth.
  - Square/rectangle/oval: length, width and depth.
  - Irregular: water capacity per cavity in ml; depth may be recorded as reference only.
- Number of identical cavities/moulds.
- Separate number of finished pieces required.
- Extra material allowance defaults to 10%, is editable and may be set to 0%.
- For irregular moulds, show the source-required warning that the mould must be emptied and completely dried after water-capacity measurement.

#### Resin measurement and mixing ratio

- Measurement basis: by volume (ml) or by weight (g).
- Ratio choices listed in the source: 1:1, 2:1 and 3:1.
- Clearly label the first ratio part as resin and the second as hardener.
- State that the ratio and measurement basis must follow the specific manufacturer's instructions; volume and weight ratios are not interchangeable.
- Do not silently infer a ratio, density or conversion.

**Approved density rule:** A weight-based estimate derived from mould volume must require manufacturer-provided mixed-system density in g/ml. If that density is missing, invalid or non-positive, the calculator must not show a reliable weight estimate. Explain the missing requirement next to the field.

**Ratio-basis safeguard:** The selected ratio must be interpreted on the same basis specified by the manufacturer. A weight calculation must use a manufacturer-specified weight ratio. A volume calculation must use a manufacturer-specified volume ratio. Do not convert a volume ratio into component weights using mixed-system density alone; that would require component-specific density/conversion data. If the selected inputs do not provide the data needed for a valid conversion, block that estimate and explain why.

#### Production-volume rule

Cavity count determines production rounds; it must not inflate the total order quantity.

- `productionRounds = ceil(piecesInOrder / cavityCount)`
- `baseVolume = volumePerCavity × piecesInOrder`
- Apply the selected extra-material allowance to the total order volume.
- Do not calculate `volumePerCavity × cavityCount × productionRounds` as the total order volume, because the final round may be partial and this formula overestimates the order.

Example: four cavities, 20 ml per cavity and five ordered pieces require 100 ml before allowance, not 160 ml. The four cavities affect the number of rounds, not the number of ordered pieces.

#### Purchase information and costs

- Separate resin and hardener purchase quantity and purchase price.
- Validate positive purchase quantities and non-negative prices; never divide by zero.
- Calculate unit cost and the cost of the quantity consumed.
- Additional optional costs:
  - Accessories
  - Pigments and colours
  - Decorative add-ons
  - Customisation
  - Packaging and finishing
  - Labour and other expenses
- Mould cost allocation: purchase price plus no allocation, 5%, 10% or custom percentage.
- Optional selling price per piece.
- Results must include material estimates, each cost category, total order cost, piece count, cost per piece, and (when a selling price is supplied) sales value and estimated profit per piece/order.
- Clearly flag a proposed selling price below estimated cost per piece.
- Include reset. Keep results visible and easy to review on the page; print/download is not part of the requested user experience.
- Include the exact disclaimer from the source requirements.

### Colour combination guide

Implement as an independent interactive section below the main calculator. Support these source combinations:

- Red + Yellow = Orange
- Blue + Yellow = Green
- Red + Blue = Purple
- Red + White = Pink
- Blue + White = Light Blue
- Black + White = Grey
- Purple + White = Lavender
- Green + White = Mint Green
- Yellow + White = Pale Yellow

Show the selected colours and suggested result visually. Include the source note explaining that pigment type, concentration, transparency and colour strength affect the final appearance, and that users should test a small sample.

### Working conditions and safety guide

Use expandable sections for:

- Hot weather
- Cold weather
- Humidity and moisture
- Before pouring resin
- Resin safety

Preserve the source's manufacturer-first wording. Include PPE, ventilation, label and Safety Data Sheet guidance, keeping children and pets away, and the instruction not to pour uncured resin into drains. Do not add unsupported chemical safety claims or substitute generic advice for the product label/SDS.

### Calculation architecture

- Keep geometry, unit conversion, ratio splitting, density conversion, purchase costing, expense aggregation and profit calculations as pure functions.
- Keep input parsing/validation separate from calculation functions.
- Use explicit types for measurement basis, ratio basis, mould shape, units and calculation result/error states.
- Avoid hidden defaults for density, ratio or material unit cost.
- Use full precision internally; round only for display. Avoid repeated rounding at intermediate calculation steps.
- A calculation should be invalid/incomplete rather than showing plausible-looking totals when required inputs are missing.
- The results panel should distinguish volume, mass and cost units clearly.

### Core calculation definitions

- Circle cavity volume: `π × (diameter / 2)² × depth`.
- Square/rectangle cavity volume: `length × width × depth`.
- Oval cavity volume: `π × (length / 2) × (width / 2) × depth`.
- Irregular cavity volume: entered water capacity in ml.
- Convert dimensions to one internal length unit before geometry calculations; convert cubic centimetres to millilitres where applicable.
- Total order volume is per-cavity volume multiplied by ordered pieces, then increased by the selected allowance.
- Split the required mixed amount according to the manufacturer's ratio and ratio basis.
- Resin/hardener costs are quantity consumed multiplied by each material's unit cost.
- Total estimated order cost is resin cost + hardener cost + all additional expenses + mould allocation.
- Estimated cost per piece is total estimated order cost divided by pieces ordered.
- Total estimated sales is selling price per piece multiplied by pieces ordered.
- Estimated profit per piece is selling price per piece minus cost per piece.
- Estimated total profit is total estimated sales minus total estimated order cost.

### Acceptance criteria

- All required inputs, shape-dependent fields, validation states and result outputs work.
- Results recalculate when relevant inputs change.
- No assumed density or silent ratio-basis conversion.
- No calculation based on cavities × rounds that overstates a partial final batch.
- Currency is naira throughout.
- Colour guide works independently of the cost calculator.
- Safety/working-condition panels are accessible and preserve manufacturer/SDS caveats.
- Reset clears all user-entered calculator state.
- Results remain visible on the page; no print/download workflow is required.
- No calculator inputs are sent to or stored by the backend.
- Responsive layout works on mobile, tablet and desktop.
- Unit tests cover geometry, unit conversion, ratio splitting, density validation, partial production rounds, extra allowance, purchase costs, expense aggregation, mould allocation and profit calculations.
- Build, lint/typecheck and CI pass.

## 4. Testing and release gates

Before opening the implementation PR:

1. Inspect the current route tree, navigation, footer, metadata and build/test scripts.
2. Identify the repository's existing testing conventions. If no test runner exists, introduce the smallest maintainable test setup needed for pure calculation functions; do not add a large testing stack without justification.
3. Run the available build, lint and typecheck commands.
4. Add and run automated tests for all pure calculation functions and critical edge cases.
5. Manually verify the About page and calculator at mobile and desktop widths.
6. Confirm no calculator request is made to the API and no input is persisted.
7. Record actual test commands and outcomes in the PR description. Do not report a check as passing unless it was run and passed.

## 5. Lip Care Formulation Calculator requirements

- Product types: Lip Gloss, Lip Balm and Lip Scrub only. Do not add pink lip cream.
- Product selection is a label only; it must not load or modify a formula.
- User supplies total batch size in grams and any number of ingredient rows. Each row contains an ingredient name and percentage.
- Calculate each ingredient weight as `batchSizeGrams × percentage / 100`.
- Show total percentage, remaining percentage below 100%, and overage above 100%.
- Only show a valid formulation result when batch size is positive, each row is named, percentages are in range and the total is 100% (allowing only floating-point rounding tolerance).
- Support adding, removing, editing and resetting ingredient rows. Results update as values change.
- Show product label, batch size, ingredient names, percentages, calculated grams and total ingredient weight.
- Include the exact disclaimer: “This calculator performs mathematical formulation calculations only. It does not create, verify or approve recipes. Always use a properly verified formulation and check ingredient suitability, usage limits, compatibility, preservation requirements and applicable product safety standards before preparing or selling lip care products.”
- Do not send or persist visitor inputs; no backend/API/database or browser storage.

## 6. Out of scope / deferred

- Formulation/recipe generation, ingredient recommendations, and manufacturer-specific ingredient libraries.
- Backend, database, authentication, saved projects or cloud calculation history.
- Manufacturer-specific resin catalogue or preloaded density database.
- Automatic density inference or assumed 1 ml = 1 g conversion.
- New training, payment, souvenir or workshop workflows.
- Changes to admin-managed founder content APIs beyond preserving the existing About-page integration.

## 7. Pull request plan

| PR | Scope | Dependency | Merge gate |
|---|---|---|---|
| PR A — Refresh About page using the approved KPX Approach | About content/layout/metadata only | This planning baseline | Review content against source; founder integration preserved; CI passes |
| PR B — Add shared Product Calculators page | Resin and Lip Care calculators on the existing route, pure calculation engines, resin colour/safety guides, shared SEO metadata, sitemap and tests | PR A reviewed; owner-approved lip care scope | Formula tests, privacy check, responsive review and CI pass |

## 8. Progress tracker

- [x] Review the approved About-page source document.
- [x] Review the calculator functional requirements.
- [x] Agree to require manufacturer-provided mixed-system density for weight-based estimates.
- [x] Separate About refresh and Resin Calculator into independent tracks.
- [ ] Merge this planning document.
- [ ] Implement and review PR A — About page refresh.
- [x] Implement PR #69 — shared Resin and Lip Care calculators (open; CI/review pending).
- [ ] Owner review and merge PR #69.
- [ ] Verify production behaviour after owner-controlled merges.
