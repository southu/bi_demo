# Claude Code Prompt — Add Light Mode to Revenue Command Center

> Copy this entire prompt and paste it into Claude Code opened in the project directory.

---

## Context

I need to add a light/dark mode toggle to this dashboard. Read `docs/design_notes/light_mode_brief.md` for the full design spec with exact color mappings, token values, and implementation strategy.

This is a React + Tailwind v4 project. The entire dashboard lives in `dashboard.jsx` (609 lines) with theme tokens in `src/index.css`.

## Constraints

- **Design/UI changes ONLY.** Do not modify business logic, data generation, filtering, or state management.
- Do not add new dependencies — use existing `lucide-react` for Sun/Moon icons and `framer-motion` for toggle animation.
- Do not restructure the component or split it into files. Keep everything in `dashboard.jsx`.
- Preserve the existing dark mode appearance exactly. When toggled to dark, the dashboard should look identical to how it looks today.

## Implementation Steps

### Step 1: Define CSS custom properties in `src/index.css`

Add the full set of CSS variables under `:root` (light mode) and `.dark` (dark mode) as specified in the design brief. Register them in the `@theme` block so Tailwind can reference them.

Key tokens: `--surface`, `--card`, `--card-border`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--nav-bg`, `--nav-border`, `--input-bg`, `--input-border`, `--tooltip-bg`, `--tooltip-border`, `--skeleton`, `--filter-active-bg`, `--filter-active-text`, `--filter-inactive-bg`, `--filter-inactive-text`, `--pill-bg`, `--pill-text`, `--grid-stroke`, `--progress-track`.

### Step 2: Add theme state management in `dashboard.jsx`

- Add a `theme` state: check `localStorage.getItem('theme')` first, then fall back to `window.matchMedia('(prefers-color-scheme: dark)')`.
- Add a `useEffect` that toggles the `dark` class on `document.documentElement` and persists to `localStorage`.
- Create a `toggleTheme` function.

### Step 3: Add the toggle button to the nav bar

Place it between the title and the VP avatar. Use `Sun` icon in dark mode, `Moon` icon in light mode (from lucide-react). Wrap in framer-motion `AnimatePresence` with a rotate+fade transition (200ms). Size: `w-9 h-9 rounded-lg`.

### Step 4: Replace hardcoded colors with CSS variable references

Go through `dashboard.jsx` and replace hardcoded dark-mode colors with the CSS variable equivalents. Key replacements:

- `bg-[#0F172A]` → `bg-[var(--surface)]`
- `bg-[rgba(30,41,59,0.7)]` (GlassCard) → `bg-[var(--card)] border-[var(--card-border)]`
- `text-white` (primary text) → `text-[var(--text-primary)]`
- `text-slate-400` (secondary) → `text-[var(--text-secondary)]`
- `text-slate-500`, `text-white/40` (tertiary) → `text-[var(--text-tertiary)]`
- Nav: `bg-slate-900/60` → `bg-[var(--nav-bg)]`, border → `border-[var(--nav-border)]`
- Filter buttons active/inactive → use `--filter-active-*` and `--filter-inactive-*` vars
- Filter pills: `bg-amber-500/15 text-amber-400` → `bg-[var(--pill-bg)] text-[var(--pill-text)]`
- Dropdowns: `bg-white/[0.05] border-white/[0.08]` → `bg-[var(--input-bg)] border-[var(--input-border)]`
- Tooltips (CustomTooltip): → `bg-[var(--tooltip-bg)] border-[var(--tooltip-border)]`
- Skeletons: → `bg-[var(--skeleton)]`
- Progress bar tracks: `bg-white/[0.06]` → `bg-[var(--progress-track)]`

### Step 5: Handle status banner colors

The status colors object needs mode-aware values. Use the CSS variable approach or Tailwind's `dark:` prefix for these four states. In light mode use `-50` backgrounds and `-200` borders (e.g., `bg-emerald-50 border-emerald-200`). Status text: use `-600` variant in light mode, `-400` in dark.

### Step 6: Handle Recharts theme

Pass the CSS variable values to Recharts components:
- `CartesianGrid`: `stroke="var(--grid-stroke)"`
- Axis tick styles: `fill: "var(--text-secondary)"`
- Tooltip content component already handled by Step 4

### Step 7: Handle the ambient glow

The decorative blur circle (`bg-amber-500/[0.04] blur-[120px]`): reduce to `bg-amber-500/[0.03]` in light mode or keep as-is — it's subtle enough to work in both.

### Step 8: Verify edge cases

- The VP avatar gradient (`from-amber-500 to-orange-600`) works in both modes — don't change it.
- The flame icon in nav (`text-amber-400`) works in both — don't change it.
- Recharts data series colors (`COLORS` constant) are mode-agnostic — don't change them.
- KPI card top gradient bars work in both — don't change them.
- Regional inventory card conditional borders (amber for low stock) work in both.

## Verification

After completing all steps:
1. Toggle between light and dark mode — verify dark mode looks identical to the current design
2. Refresh the page — verify the preference persists
3. Check that all chart labels, tooltips, and axis text are readable in both modes
4. Verify the status banner (caution/healthy/critical) is legible in both modes
5. Check mobile (390px) — verify the toggle is accessible and both modes render correctly
6. Verify no semantic color meaning is lost in light mode (red still means bad, green still means good)
