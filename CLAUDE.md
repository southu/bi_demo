# Revenue Command Center — Dashboard Mockup

## Project Context
This is a **high-fidelity UI mockup** of a Revenue Management BI dashboard for a smokeless tobacco company. It is a single-page React artifact (`.jsx`) designed for presentation in Claude.ai's artifact renderer.

## Critical Constraints
- **Single file output.** Everything lives in `dashboard.jsx`. No separate CSS, no separate data files — inline everything.
- **Only these imports are available in the artifact renderer:**
  - `react` (useState, useEffect, useMemo, useCallback)
  - `recharts` (all chart components)
  - `lucide-react` (all icons)
  - Tailwind CSS utility classes (pre-loaded, no config needed)
- **Do NOT use:** localStorage, sessionStorage, fetch calls, external fonts, external CDNs, shadcn/ui, or any other library not listed above.
- **Do NOT use** `<form>` tags. Use `onClick`/`onChange` handlers directly.
- **Default export required.** `export default function Dashboard() { ... }`

## Design Non-Negotiables
- Dark mode only. Background `#0B0F19`, card surfaces `#111827`.
- All text is white/gray. Never use black text.
- **No 3D charts. Ever.** They distort data and look dated.
- Charts must use custom dark-themed tooltips — never default white Recharts tooltips.
- All Recharts axes: `axisLine={false}`, `tickLine={false}`. No solid grid lines — use `rgba(255,255,255,0.04)` or remove entirely.
- Area charts must use SVG `<linearGradient>` fills fading from accent color to transparent.
- The top nav bar must use glassmorphism: `bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]`.
- The filter bar below the nav must include Category, Flavor Profile, Nicotine Strength, Region, and Timeframe controls — visually styled and toggle-able via useState, but non-functional (mockup only).
- Every Recharts chart must set `<ResponsiveContainer width="100%" height={...}>` as the outermost wrapper.
- Minimum chart height: 300px for primary charts, 200px for secondary.
- All cards: `rounded-2xl`, subtle border `border border-white/[0.06]`, padding `p-6`.
- Accent color: amber-500 (`#F59E0B`). Secondary: cyan-500 (`#06B6D4`).

## Code Style
- Use `const` for all data arrays/objects, defined before the component.
- Group data constants at the top of the file under a `// ============ MOCK DATA ============` comment block.
- Group sub-components (custom tooltip, sparkline, metric card) as small functions INSIDE the file, above the main component.
- Use descriptive Tailwind classes — prefer readability over brevity.

## Quality Gate
Before finishing, verify:
1. No white/light backgrounds anywhere — including tooltips, dropdowns, and select elements
2. All charts render inside ResponsiveContainer
3. Hover states exist on KPI cards and table rows
4. Delta badges use green for positive, rose for negative
5. The dashboard scrolls smoothly with no horizontal overflow
6. Waterfall chart bars are properly offset (not just stacked)
7. Nav bar has visible glassmorphism effect (backdrop-blur + semi-transparent bg)
8. Filter bar is present with Category pills, Flavor/Strength/Region dropdowns, and Timeframe pills
9. Area charts use SVG linearGradient fills (not flat color fills)
10. No chart has solid background grid lines — use `rgba(255,255,255,0.04)` or none
11. All Recharts axes have `axisLine={false}` and `tickLine={false}`
12. No 3D charts anywhere
