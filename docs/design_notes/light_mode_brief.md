# Light Mode Design Brief — Revenue Command Center
> Generated: 2026-03-25

## Design Direction

The current dark theme (`#0F172A` base, `rgba(30,41,59,0.7)` cards, white text) is the product's identity. Light mode must feel like a **sibling, not a stranger** — same layout, same hierarchy, same density, just inverted for daytime/office use.

The goal is NOT "white background with gray text." It's a warm, professional light palette that maintains the dashboard's authority and data-forward character.

## Color Mapping — Dark to Light

### Surfaces
| Role | Dark Value | Light Value | Tailwind |
|------|-----------|-------------|---------|
| Page background | `#0F172A` | `#F8FAFC` (slate-50) | `bg-slate-50` |
| Card background | `rgba(30,41,59,0.7)` | `#FFFFFF` with subtle border | `bg-white border border-slate-200` |
| Nav / filter bar | `bg-slate-900/60` | `bg-white/80 backdrop-blur` | `bg-white/80` |
| Ambient glow (hero blur) | `bg-amber-500/[0.04]` | `bg-amber-500/[0.03]` | Keep, reduce opacity |
| Skeleton / empty states | `bg-white/[0.03]` to `bg-white/[0.06]` | `bg-slate-100` to `bg-slate-200` | `bg-slate-100` |

### Text
| Role | Dark Value | Light Value | Tailwind |
|------|-----------|-------------|---------|
| Primary text | `text-white` | `text-slate-900` | `text-slate-900` |
| Secondary text | `text-slate-400` | `text-slate-500` | `text-slate-500` |
| Tertiary / disabled | `text-slate-500`, `text-white/40` | `text-slate-400` | `text-slate-400` |
| Section labels (uppercase) | `text-slate-400` | `text-slate-500` | `text-slate-500` |

### Borders
| Role | Dark Value | Light Value | Tailwind |
|------|-----------|-------------|---------|
| Card borders | `border-white/[0.06]` to `border-white/10` | `border-slate-200` | `border-slate-200` |
| Dividers | `border-slate-700/40` | `border-slate-200` | `border-slate-200` |
| Nav border | `border-white/[0.04]` | `border-slate-200/60` | `border-slate-200/60` |

### Semantic Colors (Unchanged)
These accent/semantic colors work in both modes — they're already mid-range saturated values:
- Amber: `#F59E0B` — warnings, caution, brand accent
- Cyan: `#06B6D4` — active filters, primary actions
- Emerald: `#10B981` — healthy, positive
- Rose: `#F43F5E` — critical, negative values
- Blue: `#3B82F6` — informational
- Violet: `#8B5CF6` — secondary data series

**Exception:** In light mode, the semantic background tints need slightly higher opacity to read against white. Change `bg-emerald-500/10` → `bg-emerald-500/[0.08]`, etc. The current values will be too faint on white.

### Status Banner Colors (Light Mode Adjustments)
| Status | Dark bg/border | Light bg/border |
|--------|---------------|----------------|
| Healthy | `bg-emerald-500/10 border-emerald-500/20` | `bg-emerald-50 border-emerald-200` |
| Caution | `bg-amber-500/10 border-amber-500/20` | `bg-amber-50 border-amber-200` |
| Critical | `bg-rose-500/10 border-rose-500/20` | `bg-rose-50 border-rose-200` |

Status text should use the `-600` variant in light mode (e.g., `text-amber-600`) instead of `-400` for contrast.

### KPI Card Top Gradient
The colored gradient bar at the top of each KPI card (`linear-gradient(to right, ${color}99, ${color}33, transparent)`) works in both modes. Keep as-is.

### Filter Buttons
| State | Dark | Light |
|-------|------|-------|
| Active | `bg-cyan-500/15 text-cyan-400 ring-cyan-500/30` | `bg-cyan-500/10 text-cyan-700 ring-cyan-500/30` |
| Inactive | `bg-white/[0.05] text-white/40` | `bg-slate-100 text-slate-500` |
| Hover | `bg-white/[0.08] text-white/60` | `bg-slate-200 text-slate-700` |

### Active Filter Pills
- Dark: `bg-amber-500/15 text-amber-400`
- Light: `bg-amber-100 text-amber-700`

### Dropdowns (FilterDropdown)
- Dark: `bg-white/[0.05] border-white/[0.08] text-slate-300`
- Light: `bg-white border-slate-300 text-slate-700`

### Chart Considerations (Recharts)
- The `COLORS` constant (`amber`, `cyan`, `blue`, etc.) works in both modes since they're mid-saturated.
- **CartesianGrid:** Currently invisible or very faint. In light mode use `stroke="#E2E8F0"` (slate-200).
- **Axis labels:** Dark mode uses slate-400/500 which will need to be slate-500/600 in light mode.
- **Tooltips:** Currently `bg-slate-800/95 border-white/10 text-white`. In light mode: `bg-white border-slate-200 text-slate-900 shadow-lg`.
- **Chart area fills:** Transparent gradients work in both modes. No change needed.

### Scatter Plot (RGM Price Ladder)
The colored dots use the same `COLORS` constants — they'll pop nicely on a light background. No change.

### Regional Inventory Progress Bars
- Track: `bg-white/[0.06]` → `bg-slate-200`
- Fill colors (amber gradient) remain the same.

### Insight Cards (Bottom Row)
- Border-top accent colors stay the same.
- Icon background pills: keep the current colored backgrounds, they work in both modes.
- Body text: `text-slate-400` → `text-slate-600`

## Theme Toggle Design

Place a sun/moon icon toggle in the nav bar, left of the "VP" avatar. Use `lucide-react` icons `Sun` and `Moon`.

- Size: `w-9 h-9` (matches avatar)
- Style: `rounded-lg` with subtle background on hover
- Dark mode appearance: `text-slate-400 hover:bg-white/[0.06]`
- Light mode appearance: `text-slate-500 hover:bg-slate-100`
- Animation: Use framer-motion `AnimatePresence` for a smooth icon swap (rotate + fade, 200ms)

## Implementation Strategy

Use Tailwind's built-in `dark:` variant with class-based toggling. This means:

1. **Invert the mental model**: The JSX currently has dark colors as the default (no prefix). The cleanest approach is to make light mode the new default and add `dark:` prefixes for the existing dark values. However, since the entire 609-line component is already built dark-first, the pragmatic approach is:

   - Keep dark as the default styling
   - Add `dark:` class to `<html>` element when dark mode is active
   - Actually — **use a CSS custom property approach instead**: define color tokens as CSS variables in `index.css` under `:root` (light) and `.dark` (dark), then reference them via Tailwind's theme. This avoids doubling every className.

2. **Recommended approach — CSS custom properties:**

```css
:root {
  --surface: #F8FAFC;
  --card: #FFFFFF;
  --card-border: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-tertiary: #94A3B8;
  --nav-bg: rgba(255, 255, 255, 0.8);
  --nav-border: rgba(226, 232, 240, 0.6);
  --input-bg: #FFFFFF;
  --input-border: #CBD5E1;
  --tooltip-bg: #FFFFFF;
  --tooltip-border: #E2E8F0;
  --skeleton: #F1F5F9;
  --filter-active-bg: rgba(6, 182, 212, 0.1);
  --filter-active-text: #0E7490;
  --filter-inactive-bg: #F1F5F9;
  --filter-inactive-text: #64748B;
  --pill-bg: #FEF3C7;
  --pill-text: #92400E;
  --grid-stroke: #E2E8F0;
  --progress-track: #E2E8F0;
}

.dark {
  --surface: #0F172A;
  --card: rgba(30, 41, 59, 0.7);
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #FFFFFF;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --nav-bg: rgba(15, 23, 42, 0.6);
  --nav-border: rgba(255, 255, 255, 0.04);
  --input-bg: rgba(255, 255, 255, 0.05);
  --input-border: rgba(255, 255, 255, 0.08);
  --tooltip-bg: rgba(30, 41, 59, 0.95);
  --tooltip-border: rgba(255, 255, 255, 0.1);
  --skeleton: rgba(255, 255, 255, 0.03);
  --filter-active-bg: rgba(6, 182, 212, 0.15);
  --filter-active-text: #22D3EE;
  --filter-inactive-bg: rgba(255, 255, 255, 0.05);
  --filter-inactive-text: rgba(255, 255, 255, 0.4);
  --pill-bg: rgba(245, 158, 11, 0.15);
  --pill-text: #FBBF24;
  --grid-stroke: rgba(255, 255, 255, 0.06);
  --progress-track: rgba(255, 255, 255, 0.06);
}
```

3. **State management**: Simple `useState` + `localStorage` persistence. Check `prefers-color-scheme` on first load as the default, then respect the user's toggle choice.

## What NOT to Change
- Layout structure, grid, spacing — untouched
- Data logic, filtering, state management — untouched
- Animation behavior — untouched
- The `COLORS` constant values — they're mode-agnostic
- Chart data series colors — they work in both modes
- The amber brand accent — it's the product's identity in both modes
