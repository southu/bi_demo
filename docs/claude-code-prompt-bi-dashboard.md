# Claude Code Prompt: Smokeless Tobacco Revenue Management BI Dashboard

Build a single-file React dashboard (`dashboard.jsx`) — a **production-grade mockup** for a smokeless tobacco company's Revenue Management team. This is a showcase piece. Design quality is the #1 priority. No shortcuts on aesthetics.

---

## DESIGN SYSTEM

### Visual Identity
- **Aesthetic direction:** Sleek, premium, slightly industrial. Think modern nicotine pouch branding (ZYN, Rogue, VELO) — bold, clean, high-contrast. Not corporate-safe boring. This should feel like a premium product company's war room, not a generic SaaS dashboard.
- **Dark mode primary.** Background: deep charcoal/near-black (`#0B0F19`). Card surfaces: `#111827` with subtle `1px` borders in `rgba(255,255,255,0.06)`.
- **Accent palette:** Amber/gold (`#F59E0B`) as the primary action color. Use a muted teal (`#06B6D4`) as secondary. Emerald (`#10B981`) for positive deltas, rose (`#F43F5E`) for negative. Electric blue (`#3B82F6`) as an optional tertiary for mint/wintergreen category callouts.
- **Typography:** Clean, tight. Use `font-family: 'Inter', system-ui, sans-serif`. Metric values should be large (2xl–4xl) and `font-weight: 700`. Labels should be `text-xs uppercase tracking-widest` in `rgba(255,255,255,0.45)`.
- **Spacing:** Generous whitespace. Cards should breathe. `gap-6` between cards, `p-6` internal padding.
- **Borders & Depth:** No heavy shadows. Use very subtle inset borders and occasional `backdrop-blur` on overlays. Cards should have `rounded-2xl`.
- **Micro-interactions:** Hover states on cards (subtle border glow in amber). Active filter/tab indicators with smooth highlight transitions. Smooth transitions everywhere (`transition-all duration-300`).

### Layout
- **Top nav bar (glassmorphism):** Sticky top. Use `bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]`. Contents: Company logo placeholder (left), dashboard title "Revenue Command Center" (center-left), user avatar circle (far right). This bar should feel like frosted glass floating over the dark background.
- **Filter bar:** Directly below the nav. A single horizontal row of compact filter dropdowns/pills with these smokeless-tobacco-specific slicers:
  - **Category:** All | Moist Snuff | Nicotine Pouches | Snus | Chewing Tobacco (pill-style toggle group, active pill highlighted in amber)
  - **Flavor Profile:** All | Mint/Wintergreen | Straight/Natural | Fruit/Citrus (dropdown select, styled dark)
  - **Nicotine Strength:** All | 3mg | 6mg | 15mg (dropdown select — critical for pouch analytics)
  - **Region:** All | Southeast | Midwest | Northeast | Southwest | West | Mid-Atlantic (dropdown select)
  - **Timeframe:** Quick-select pills: 7D | 30D | QTD | YTD | 1Y (pill toggle group, active in amber)
  - These filters are **non-functional in the mockup** — just visually present with `useState` toggling the active states for the pill groups. Dropdowns should be styled `select` elements with dark backgrounds.
- **Grid:** 12-column CSS grid. Responsive but optimize for 1440px+ widescreen.

---

## CHART HYGIENE RULES (apply to every chart)

- **Absolutely no 3D charts.** Ever. They distort data and look dated.
- **Remove background grid lines** or make them barely visible (`stroke: rgba(255,255,255,0.04)`). Never use solid grid lines.
- **Hide unnecessary axis borders.** Set `axisLine={false}` and `tickLine={false}` on all Recharts axes.
- **Use tooltips on hover** instead of cluttering charts with permanent data labels. Exception: waterfall chart value labels are OK because they tell the bridge story.
- **Gradient fills on area charts.** Use SVG `<defs><linearGradient>` fading from the accent color at ~20% opacity to transparent at the bottom.
- **Horizontal bar charts** for any chart with long text labels (SKU names, flavor names). Vertical bars are fine for short labels (price tiers, months).

---

## DASHBOARD SECTIONS (top to bottom)

### 1. KPI Hero Strip (full width, single row of 5 cards)
Compact metric cards in a horizontal row:
| Metric | Value | Delta | Sparkline |
|---|---|---|---|
| Net Revenue | $847.2M | +6.3% YoY | 12-month mini line |
| Gross Margin | 68.4% | +1.2pp | 12-month mini line |
| Volume (MSE cans) | 312.6M | -2.1% | 12-month mini line |
| Revenue Per Can | $2.71 | +8.6% | 12-month mini line |
| Trade Spend Efficiency | 14.2% | -0.8pp | 12-month mini line |

Each card: icon on left (use Lucide icons — DollarSign, TrendingUp, Package, BarChart3, Target), value prominent, delta badge (green/red pill), and a tiny inline sparkline (just a simple SVG path, 60px wide).

### 2. Primary Charts Row (2 columns: 60/40 split)

**Left — Revenue Bridge (Waterfall Chart):**
- Title: "Revenue Bridge: PY → CY"
- Horizontal waterfall showing: Prior Year Base → Price Increase → Mix Shift → Volume Decline → Promo Impact → New Products → **Current Year**
- Bars: use amber for positive contributions, rose for negative, final bar in bright teal.
- Render with Recharts `BarChart` using stacked/offset technique to simulate waterfall. Include value labels on each bar.

**Right — Category Mix Donut:**
- Title: "Revenue by Category"
- Donut chart (Recharts `PieChart` with `innerRadius`) showing: Moist Snuff (52%), Nicotine Pouches (28%), Snus (12%), Chewing Tobacco (8%).
- Use the amber → teal → slate → muted-rose color sequence.
- Center text: Total revenue "$847.2M"
- Legend below with colored dots + percentage + dollar value.

### 3. Trend & Geography Row (2 columns: 50/50)

**Left — Monthly Revenue Trend (Area Chart):**
- Title: "Monthly Net Revenue — Trailing 24 Months"
- Recharts `AreaChart` with gradient fill (amber at 20% opacity fading to transparent).
- Two overlapping areas: Current Year (amber) and Prior Year (white at 15% opacity, dashed stroke) for easy comparison.
- X-axis: month labels. Y-axis: dollar values. Subtle grid lines in `rgba(255,255,255,0.04)`.

**Right — Regional Revenue Heat Table:**
- Title: "Revenue by Region"
- A styled table (not a map) — 6 rows (Southeast, Midwest, Northeast, Southwest, West, Mid-Atlantic).
- Columns: Region | Revenue | vs PY% | Share %
- The `vs PY%` column should have inline horizontal micro-bars (like a bar-in-cell visual) with green/red fills proportional to the value.
- Highlight the top-performing region row with a subtle amber left-border accent.

### 4. Product & Pricing Row (2 columns: 50/50)

**Left — Top 10 SKUs Table:**
- Title: "Top SKUs by Net Revenue"
- Sleek table with columns: Rank | SKU Name | Net Revenue | Units | Rev/Unit | Δ YoY
- Use alternating row shading (barely perceptible). Rank column as circular badges. YoY delta as colored pills.
- Mock SKU names: "Timber Wolf Long Cut Wintergreen", "Grizzly Dark Mint Pouch", "Copenhagen Snuff Original", "Kodiak Wintergreen", "Skoal Classic Mint", "ZYN Cool Mint 6mg", "ZYN Spearmint 3mg", "Grizzly Wide Cut Natural", "Copenhagen Long Cut", "Longhorn Straight"

**Right — Price Pack Architecture (Grouped Bar Chart):**
- Title: "Price Pack Architecture — Avg Retail Price"
- Recharts grouped `BarChart`. Groups by price tier: Value, Mainstream, Premium, Super Premium.
- Two bars per group: Current Year (amber) vs Prior Year (teal outline, no fill — ghost bar).
- Y-axis: dollar price. Clean value labels on top of each bar.

### 5. Bottom Insights Row (full width, 3 equal columns)

Three "insight cards" with a slightly different treatment — these have a top colored accent line (2px) and an icon:
1. **Promo ROI Alert** (rose accent) — "Q3 BOGO promotions returned $0.82 per $1.00 invested — below the $1.15 threshold. Recommend shifting 12% of trade budget to everyday low price."
2. **Nicotine Pouch Growth** (emerald accent) — "Pouch segment +34% YoY, now 28% of portfolio revenue. ZYN 6mg Cool Mint is the #1 velocity SKU in convenience."
3. **Pricing Opportunity** (amber accent) — "Elasticity modeling shows 3.2% price increase headroom on Premium moist snuff in Southeast without volume risk above -1.5%."

Each card: icon top-left, bold title, 2-3 line description text in `text-sm text-gray-400`.

---

## TECHNICAL REQUIREMENTS

- **Single `.jsx` file.** Default export. No required props.
- **Tailwind utility classes only** for all styling. No external CSS.
- **Recharts** for all charts (`import { AreaChart, BarChart, PieChart, ... } from "recharts"`).
- **Lucide React** for icons (`import { DollarSign, TrendingUp, ... } from "lucide-react"`).
- **All data is hardcoded** inline as const arrays/objects at the top of the file. This is a mockup — no API calls.
- **useState** for: active timeframe pill (7D / 30D / QTD / YTD / 1Y), active category pill (All / Moist Snuff / Nicotine Pouches / Snus / Chewing Tobacco), and a hoverable KPI card highlight effect. The filter pill toggles should visually switch active states on click — amber highlight for active, muted for inactive. Dropdown selects just need to be styled dark; they don't need to filter the data.
- Use `overflow-y-auto` on the outer wrapper so the full dashboard scrolls smoothly.
- Every chart must have a clean custom tooltip styled to match the dark theme (dark bg, rounded, small shadow).

---

## QUALITY BAR

This should look like it belongs in a Dribbble "Dashboard UI" collection. If it looks like a default Recharts demo with Tailwind defaults, it's not good enough. The bar is: a revenue management VP opens this on a 4K monitor in a boardroom and it commands the room.
