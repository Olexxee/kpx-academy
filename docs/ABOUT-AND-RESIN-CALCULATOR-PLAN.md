# KPX Academy: About Page and Resin Calculator Delivery Plan

**Status:** Planning baseline  
**Repository:** `Olexxee/kpx-academy`  
**Base branch at planning:** `master`  
**Scope:** About page content alignment and the Resin Planning & Cost Calculator  
**Source documents:** `The KPX Approach new.docx` and `KPX Calculator.docx`

## 1. Delivery strategy

Deliver this work in two independent implementation pull requests, after this planning document is reviewed:

1. **Track A — About page refresh.** Update the existing About page to reflect the approved November KPX Approach document.
2. **Track B — Resin Planning & Cost Calculator.** Add a browser-only resin planning and costing tool with its own route and supporting guidance.

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

## 3. Track B — Resin Planning & Cost Calculator

### Objective

Build a dedicated, beginner-friendly calculator that estimates mould material requirements, resin/hardener quantities, project costs and optional selling-price outcomes.

### Product boundaries

- Deliver the **Resin Planning & Cost Calculator only** in this track.
- The source requirements also describe a Lip Care Formulation Calculator. It is explicitly deferred; do not build it, expose an inactive option, or imply it is available.
- A future calculator landing page may be added only if it has a real, working destination for the resin tool. Do not publish a dead-end Lip Care tile.
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
- Include reset and browser-based print/download summary where feasible.
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
- Print/download output is generated locally in the browser.
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

## 5. Out of scope / deferred

- Lip Care Formulation Calculator and any formulation or recipe recommendations.
- Backend, database, authentication, saved projects or cloud calculation history.
- Manufacturer-specific resin catalogue or preloaded density database.
- Automatic density inference or assumed 1 ml = 1 g conversion.
- New training, payment, souvenir or workshop workflows.
- Changes to admin-managed founder content APIs beyond preserving the existing About-page integration.

## 6. Pull request plan

| PR | Scope | Dependency | Merge gate |
|---|---|---|---|
| PR A — Refresh About page using the approved KPX Approach | About content/layout/metadata only | This planning baseline | Review content against source; founder integration preserved; CI passes |
| PR B — Add Resin Planning & Cost Calculator | Dedicated route, UI, pure calculation engine, colour/safety guides, navigation/metadata, tests | Can start after PR A is reviewed; should branch from the updated base after PR A merges to avoid overlap | Formula tests, privacy check, responsive review and CI pass |

## 7. Progress tracker

- [x] Review the approved About-page source document.
- [x] Review the calculator functional requirements.
- [x] Agree to require manufacturer-provided mixed-system density for weight-based estimates.
- [x] Separate About refresh and Resin Calculator into independent tracks.
- [ ] Merge this planning document.
- [ ] Implement and review PR A — About page refresh.
- [ ] Implement and review PR B — Resin calculator.
- [ ] Verify production behaviour after owner-controlled merges.
