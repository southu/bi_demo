# Design Tokens & Component Patterns

Visual reference for every reusable pattern in the dashboard. Use these exact values.

---

## Color Tokens

### Backgrounds
- `page`:        `bg-[#0B0F19]`
- `card`:        `bg-[#111827]`
- `card-hover`:  `bg-[#1a2234]`
- `card-border`: `border-white/[0.06]`
- `input/pill`:  `bg-white/[0.05]`

### Accent
- `primary`:     `text-amber-500` / `bg-amber-500` (`#F59E0B`)
- `primary-dim`: `text-amber-500/20` (for glows, fills)
- `secondary`:   `text-cyan-500` / `bg-cyan-500` (`#06B6D4`)
- `tertiary`:    `text-blue-500` / `bg-blue-500` (`#3B82F6`) — optional, for mint/wintergreen callouts

### Semantic
- `positive`:    `text-emerald-400` / `bg-emerald-400/10` (`#34D399`)
- `negative`:    `text-rose-400` / `bg-rose-400/10` (`#FB7185`)
- `neutral`:     `text-gray-400`

### Text Hierarchy
- `heading`:     `text-white font-bold`
- `value`:       `text-white text-3xl font-bold tracking-tight`
- `label`:       `text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium`
- `body`:        `text-sm text-gray-400`
- `muted`:       `text-xs text-white/30`

---

## Chart Colors (Recharts)

Use these hex values directly in Recharts `fill`, `stroke` props:

```
const CHART_COLORS = {
  amber:    '#F59E0B',
  cyan:     '#06B6D4',
  emerald:  '#10B981',
  rose:     '#F43F5E',
  slate:    '#64748B',
  amberDim: 'rgba(245, 158, 11, 0.15)',
  cyanDim:  'rgba(6, 182, 212, 0.15)',
};
```

### Chart Axis & Grid Styling
```jsx
<XAxis
  dataKey="name"
  axisLine={false}
  tickLine={false}
  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
/>
<YAxis
  axisLine={false}
  tickLine={false}
  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
  tickFormatter={(v) => `$${v}M`}
/>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
```

### Custom Tooltip Pattern
```jsx
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2234] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};
```

---

## Component Patterns

### Glassmorphism Nav Bar
```
- Container: `sticky top-0 z-50 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] px-6 py-3`
- Layout: `flex items-center justify-between`
- Logo area (left): placeholder circle or text
- Title (center-left): `text-lg font-semibold text-white`
- Avatar (right): `w-9 h-9 rounded-full bg-amber-500/20`
```

### Filter Bar
Directly below nav, full width. Contains pill toggle groups and styled dropdowns.
```
- Container: `flex items-center gap-4 px-6 py-3 bg-[#0B0F19] border-b border-white/[0.04] flex-wrap`
- Pill toggle group: row of buttons, inactive = `px-3 py-1.5 text-xs font-medium rounded-full bg-white/[0.05] text-white/50 hover:text-white/70 transition-all`
- Pill active: `bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30`
- Dark dropdown: `bg-[#111827] border border-white/[0.08] rounded-lg text-sm text-gray-300 px-3 py-1.5 appearance-none`
- Filter label: `text-[10px] uppercase tracking-widest text-white/30 mb-1`
```

### Area Chart Gradient (SVG Defs)
Every area chart should include this in its Recharts component:
```jsx
<defs>
  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
  </linearGradient>
</defs>
// Then reference: <Area fill="url(#amberGradient)" stroke="#F59E0B" ... />
```

### KPI Card
```
┌─────────────────────────────────┐
│ [icon]  LABEL (uppercase tiny)  │
│                                 │
│ $847.2M          ~~~sparkline~~ │
│ ▲ +6.3% YoY                    │
└─────────────────────────────────┘
```
- Card: `bg-[#111827] border border-white/[0.06] rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300`
- Icon container: `w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center`
- Delta pill (positive): `inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400`
- Delta pill (negative): `... bg-rose-400/10 text-rose-400`

### Section Header
```
- Title: `text-lg font-semibold text-white`
- Optional subtitle: `text-xs text-white/40 mt-0.5`
- Bottom margin: `mb-4`
```

### Table Row Pattern
```
- Header row:  `text-[11px] uppercase tracking-wider text-white/40 border-b border-white/[0.06]`
- Body row:    `text-sm text-gray-300 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors`
- Cell padding: `py-3 px-4`
```

### Insight Card
```
┌──amber 2px top accent line─────┐
│ [Icon]  BOLD TITLE             │
│                                │
│ 2-3 lines of insight text in   │
│ text-sm text-gray-400          │
└────────────────────────────────┘
```
- Top accent: `border-t-2 border-amber-500` (or rose/emerald depending on card)
- Rest: same card treatment as above

### Inline Sparkline (SVG)
A simple polyline rendered as raw SVG, ~80px wide, 28px tall:
```jsx
const Sparkline = ({ data, color = '#F59E0B' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * 76 + 2},${28 - ((v - min) / (max - min)) * 24 - 2}`
  ).join(' ');
  return (
    <svg width="80" height="28" className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
```

---

## Layout Grid

```
Full page: min-h-screen bg-[#0B0F19] text-white

Nav bar:       sticky top-0 z-50 glassmorphism (backdrop-blur-xl)
Filter bar:    flex flex-wrap gap-4 px-6 py-3 border-b border-white/[0.04]
Content area:  p-6 lg:p-8 space-y-6

KPI strip:     grid grid-cols-5 gap-4
Charts row 1:  grid grid-cols-5 gap-6  → left chart col-span-3, right col-span-2
Charts row 2:  grid grid-cols-2 gap-6
Charts row 3:  grid grid-cols-2 gap-6
Insights row:  grid grid-cols-3 gap-6
```

Section spacing: `space-y-6` or `gap-6` between each major row.
