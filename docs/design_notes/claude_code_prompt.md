# Claude Code Prompt — Design Implementation for BI_Dashboard_Example

> Copy this entire prompt and paste it into Claude Code opened in the project directory.

---

## Context

I just ran a design audit on this project. The full audit is in `docs/design_notes/design_audit.md` — read it first for full context.

This is a react project using tailwind.

## Constraints

- **Design/UI changes ONLY.** Do not modify business logic, API calls, data fetching, routing, or state management.
- Stay on the existing design system grid. Use Tailwind utilities — avoid arbitrary values `[]` unless no utility exists.
- Do not add new dependencies without asking.
- If a change requires restructuring a component, explain what and why before doing it.

## Implementation Steps

### Phase 1: Quick Wins

**Step 1:** Region: 'OVERALL STATUS: CAUTION' Bar: Change text color to `text-white` (`#FFFFFF`) and apply `font-bold` to ensure sufficient contrast and prominence against the `bg-amber-500/[0.08]` background.
**Step 2:** Region: Metric Cards: Increase the font size of the '-22.0% vs Ship' text in the 'Retail Offtake' card from current `~10px` to `text-xs` (12px).
**Step 3:** Region: Regional Inventory Cards: Increase the font size of 'Gap: -X.X%' text from current `~10px` to `text-xs` (12px).
**Step 4:** Region: Source/Last Refreshed Text: Increase font size from `~9px` to `text-xs` (12px) and ensure `text-slate-400` has sufficient contrast against the dark background.
**Step 5:** Region: 'Flavor Mix' Chart: Change 'click to cross-filter' text from current `~10px` to `text-xs` (12px) and ensure it has sufficient contrast.

### Phase 2: Critical Fixes

**Step 6: Global Spacing System**
Audit all spacing values. Normalize all margins, paddings, and gaps to a strict 8px grid scale (e.g., 8px, 16px, 24px, 32px, 48px). Update `tailwind.config.js` to define a proper spacing scale and eliminate all hardcoded arbitrary values like `gap-1.5` and `px-2.5`.

**Step 7: Global Typography - Small Text Sizes**
Establish a minimum font size of 12px for all functional labels and captions, and 14px for all body text. For 'Source' and 'Last Refreshed' information, increase to 12px and ensure adequate contrast. For metric details, increase to 12px or 14px. Refactor `tailwind.config.js` to remove hardcoded pixel values and define a semantic type scale.

### Phase 3: Major Improvements

**Step 8: Filter Bar - Selected State Visual Weight**
Apply a more distinct visual treatment to selected filters. Increase the background opacity for the selected state to `bg-white/[0.12]` or use the accent color, `#06b6d4`, with a 15-20% opacity. Also, increase the font weight to `font-semibold` for the selected option to reinforce its active status. Standardize `borderRadius` to `4px` across all buttons.

**Step 9: 'OVERALL STATUS: CAUTION' Bar - Contrast & Prominence**
Increase the contrast of the text against the background. Change the text color to `text-white` (`#FFFFFF`) to ensure sufficient contrast against the `bg-amber-500/[0.08]` background. Additionally, apply `font-bold` to the status text for increased prominence.

### Phase 4: Structural Changes

**Step 10:** Implement a strict 8px spacing grid: This requires a comprehensive audit and refactor of all `gap`, `margin`, and `padding` utility classes. Define a custom spacing scale in `tailwind.config.js` with values like `spacing: { 0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px' }`. This will eliminate the numerous fractional and non-grid values currently in use.
**Step 11:** Redefine Typography Scale: Consolidate font sizes and weights into a maximum of 4-5 semantic levels (e.g., h1, h2, body, label, caption). Remove all hardcoded `text-[Xpx]` values. Define these in `tailwind.config.js` to ensure consistency and accessibility (minimum 12px for labels/captions, 14px for body text).
**Step 12:** Standardize Border Radii: The codebase analysis shows no `borderRadius` tokens. Define a consistent `borderRadius` scale (e.g., `2px`, `4px`, `8px`) and apply it consistently across all components like cards, buttons, and input fields. Currently, some elements appear to have `4px` and others `8px` or `0px`, creating visual inconsistency.

### Phase 5: Design Token Updates

**Step 13:** Update color tokens: #94a3b8
**Step 14:** Update spacing: spacing-xs: 4px, spacing-sm: 8px, spacing-md: 16px, spacing-lg: 24px, spacing-xl: 32px, spacing-2xl: 48px
**Step 15:** Update typography: font-size-caption: 12px, font-size-body: 14px, font-size-subheading: 16px, font-size-heading: 20px, font-size-display: 24px, font-weight-regular: 400, font-weight-medium: 500, font-weight-semibold: 600, font-weight-bold: 700

## Verification

After completing all steps:
1. Run the dev server and visually verify each change
2. Check responsive behavior at mobile (390px) and desktop (1440px)
3. Verify no regressions in existing functionality
4. Reference `docs/design_notes/design_audit.md` to confirm each issue was addressed
