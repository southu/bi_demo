import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, Package, BarChart3, Target,
  AlertTriangle, Leaf, Tag,
} from "lucide-react";

// ============ MOCK DATA ============

const CHART_COLORS = {
  amber: "#F59E0B",
  cyan: "#06B6D4",
  emerald: "#10B981",
  rose: "#F43F5E",
  slate: "#64748B",
  amberDim: "rgba(245, 158, 11, 0.15)",
  cyanDim: "rgba(6, 182, 212, 0.15)",
};

const KPI_DATA = [
  { label: "Net Revenue", value: "$847.2M", delta: "+6.3%", suffix: "YoY", up: true, icon: DollarSign, spark: [58, 55, 62, 59, 64, 67, 72, 69, 65, 66, 72, 79] },
  { label: "Gross Margin", value: "68.4%", delta: "+1.2pp", suffix: "", up: true, icon: TrendingUp, spark: [66, 67, 67, 68, 67, 68, 69, 68, 69, 68, 69, 68] },
  { label: "Volume (MSE Cans)", value: "312.6M", delta: "-2.1%", suffix: "", up: false, icon: Package, spark: [28, 27, 26, 27, 26, 26, 25, 26, 25, 25, 24, 25] },
  { label: "Revenue Per Can", value: "$2.71", delta: "+8.6%", suffix: "YoY", up: true, icon: BarChart3, spark: [2.3, 2.35, 2.4, 2.42, 2.48, 2.52, 2.58, 2.6, 2.63, 2.65, 2.68, 2.71] },
  { label: "Trade Spend Efficiency", value: "14.2%", delta: "-0.8pp", suffix: "", up: false, icon: Target, spark: [15.8, 15.4, 15.1, 14.9, 14.8, 14.6, 14.5, 14.4, 14.3, 14.2, 14.2, 14.2] },
];

const MONTHLY_REVENUE = [
  { month: "Jan PY", py: 58.2, cy: null }, { month: "Feb PY", py: 54.8, cy: null },
  { month: "Mar PY", py: 62.1, cy: null }, { month: "Apr PY", py: 59.4, cy: null },
  { month: "May PY", py: 63.7, cy: null }, { month: "Jun PY", py: 67.2, cy: null },
  { month: "Jul PY", py: 71.8, cy: null }, { month: "Aug PY", py: 69.3, cy: null },
  { month: "Sep PY", py: 64.5, cy: null }, { month: "Oct PY", py: 66.1, cy: null },
  { month: "Nov PY", py: 72.4, cy: null }, { month: "Dec PY", py: 78.9, cy: null },
  { month: "Jan", py: 58.2, cy: 61.4 }, { month: "Feb", py: 54.8, cy: 58.2 },
  { month: "Mar", py: 62.1, cy: 65.8 }, { month: "Apr", py: 59.4, cy: 63.1 },
  { month: "May", py: 63.7, cy: 68.4 }, { month: "Jun", py: 67.2, cy: 72.9 },
  { month: "Jul", py: 71.8, cy: 76.3 }, { month: "Aug", py: 69.3, cy: 73.8 },
  { month: "Sep", py: 64.5, cy: 69.2 }, { month: "Oct", py: 66.1, cy: 71.5 },
  { month: "Nov", py: 72.4, cy: 78.1 }, { month: "Dec", py: 78.9, cy: 84.5 },
];

const WATERFALL_DATA = [
  { name: "Prior Year", value: 788.4, type: "base" },
  { name: "Price Increase", value: 72.3, type: "positive" },
  { name: "Mix Shift", value: 18.6, type: "positive" },
  { name: "Volume Decline", value: -41.2, type: "negative" },
  { name: "Promo Impact", value: -15.8, type: "negative" },
  { name: "New Products", value: 24.9, type: "positive" },
  { name: "Current Year", value: 847.2, type: "total" },
];

// Pre-compute waterfall offsets
const waterfallBars = (() => {
  let running = 0;
  return WATERFALL_DATA.map((d) => {
    if (d.type === "base") {
      running = d.value;
      return { ...d, offset: 0, height: d.value, display: d.value };
    }
    if (d.type === "total") {
      return { ...d, offset: 0, height: d.value, display: d.value };
    }
    if (d.type === "positive") {
      const offset = running;
      running += d.value;
      return { ...d, offset, height: d.value, display: `+${d.value}` };
    }
    // negative
    running += d.value;
    return { ...d, offset: running, height: Math.abs(d.value), display: d.value.toString() };
  });
})();

const CATEGORY_MIX = [
  { name: "Moist Snuff", share: 52, revenue: "$440.5M" },
  { name: "Nicotine Pouches", share: 28, revenue: "$237.2M" },
  { name: "Snus", share: 12, revenue: "$101.7M" },
  { name: "Chewing Tobacco", share: 8, revenue: "$67.8M" },
];

const CATEGORY_COLORS = [CHART_COLORS.amber, CHART_COLORS.cyan, CHART_COLORS.slate, CHART_COLORS.rose];

const REGIONAL_DATA = [
  { region: "Southeast", revenue: "$245.7M", vsPY: 8.4, share: "29.0%" },
  { region: "Midwest", revenue: "$186.4M", vsPY: 5.1, share: "22.0%" },
  { region: "Northeast", revenue: "$135.6M", vsPY: 3.2, share: "16.0%" },
  { region: "Southwest", revenue: "$118.6M", vsPY: 9.7, share: "14.0%" },
  { region: "West", revenue: "$93.2M", vsPY: 4.8, share: "11.0%" },
  { region: "Mid-Atlantic", revenue: "$67.7M", vsPY: 2.1, share: "8.0%" },
];

const TOP_SKUS = [
  { rank: 1, sku: "Copenhagen Snuff Original", revenue: "$98.4M", units: "28.2M", revUnit: "$3.49", yoy: "+4.2%" },
  { rank: 2, sku: "Grizzly Dark Mint Pouch", revenue: "$87.1M", units: "34.6M", revUnit: "$2.52", yoy: "+7.8%" },
  { rank: 3, sku: "ZYN Cool Mint 6mg", revenue: "$76.8M", units: "42.1M", revUnit: "$1.82", yoy: "+38.4%" },
  { rank: 4, sku: "Copenhagen Long Cut", revenue: "$72.3M", units: "24.8M", revUnit: "$2.92", yoy: "+2.1%" },
  { rank: 5, sku: "Grizzly Wide Cut Natural", revenue: "$64.5M", units: "29.4M", revUnit: "$2.19", yoy: "-1.3%" },
  { rank: 6, sku: "Timber Wolf LC Wintergreen", revenue: "$58.2M", units: "31.7M", revUnit: "$1.84", yoy: "-4.6%" },
  { rank: 7, sku: "ZYN Spearmint 3mg", revenue: "$52.9M", units: "32.8M", revUnit: "$1.61", yoy: "+42.1%" },
  { rank: 8, sku: "Skoal Classic Mint", revenue: "$48.7M", units: "19.2M", revUnit: "$2.54", yoy: "-2.8%" },
  { rank: 9, sku: "Kodiak Wintergreen", revenue: "$44.1M", units: "16.8M", revUnit: "$2.63", yoy: "+1.5%" },
  { rank: 10, sku: "Longhorn Straight", revenue: "$38.6M", units: "22.4M", revUnit: "$1.72", yoy: "-5.2%" },
];

const PRICE_PACK = [
  { tier: "Value", py: 3.29, cy: 3.59 },
  { tier: "Mainstream", py: 5.19, cy: 5.69 },
  { tier: "Premium", py: 7.49, cy: 8.19 },
  { tier: "Super Premium", py: 9.99, cy: 10.79 },
];

const INSIGHTS = [
  {
    icon: AlertTriangle,
    title: "Promo ROI Alert",
    text: "Q3 BOGO promotions returned $0.82 per $1.00 invested — below the $1.15 threshold. Recommend shifting 12% of trade budget to everyday low price.",
    accent: "border-rose-500",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-400/10",
  },
  {
    icon: Leaf,
    title: "Nicotine Pouch Growth",
    text: "Pouch segment +34% YoY, now 28% of portfolio revenue. ZYN 6mg Cool Mint is the #1 velocity SKU in convenience.",
    accent: "border-emerald-500",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
  },
  {
    icon: Tag,
    title: "Pricing Opportunity",
    text: "Elasticity modeling shows 3.2% price increase headroom on Premium moist snuff in Southeast without volume risk above -1.5%.",
    accent: "border-amber-500",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
  },
];

const CATEGORIES = ["All", "Moist Snuff", "Nicotine Pouches", "Snus", "Chewing Tobacco"];
const TIMEFRAMES = ["7D", "30D", "QTD", "YTD", "1Y"];

// ============ SUB-COMPONENTS ============

const Sparkline = ({ data, color = "#F59E0B" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 76 + 2},${28 - ((v - min) / range) * 24 - 2}`)
    .join(" ");
  return (
    <svg width="80" height="28" className="flex-shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2234] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: ${entry.value}M
        </p>
      ))}
    </div>
  );
};

const WaterfallTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-[#1a2234] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{d.name}</p>
      <p className="text-sm font-semibold text-white">${d.value >= 0 ? "+" : ""}{d.type === "base" || d.type === "total" ? "" : ""}{typeof d.display === "string" ? d.display : d.value}M</p>
    </div>
  );
};

const PriceTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2234] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || entry.stroke }}>
          {entry.name}: ${entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
};

// ============ MAIN COMPONENT ============

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTimeframe, setActiveTimeframe] = useState("YTD");
  const [hoveredKpi, setHoveredKpi] = useState(null);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-y-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ===== NAV BAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] px-6 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <BarChart3 size={18} className="text-amber-400" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Revenue Command Center</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">VP</div>
        </div>
      </nav>

      {/* ===== FILTER BAR ===== */}
      <div className="flex items-end gap-6 px-6 py-3 bg-[#0B0F19] border-b border-white/[0.04] flex-wrap max-w-[1600px] mx-auto">
        {/* Category pills */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Category</div>
          <div className="flex gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                  activeCategory === c
                    ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                    : "bg-white/[0.05] text-white/50 hover:text-white/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Flavor dropdown */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Flavor Profile</div>
          <select className="bg-[#111827] border border-white/[0.08] rounded-lg text-sm text-gray-300 px-3 py-1.5 appearance-none pr-8 cursor-pointer">
            <option>All</option>
            <option>Mint/Wintergreen</option>
            <option>Straight/Natural</option>
            <option>Fruit/Citrus</option>
          </select>
        </div>

        {/* Nicotine Strength dropdown */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Nicotine Strength</div>
          <select className="bg-[#111827] border border-white/[0.08] rounded-lg text-sm text-gray-300 px-3 py-1.5 appearance-none pr-8 cursor-pointer">
            <option>All</option>
            <option>3mg</option>
            <option>6mg</option>
            <option>15mg</option>
          </select>
        </div>

        {/* Region dropdown */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Region</div>
          <select className="bg-[#111827] border border-white/[0.08] rounded-lg text-sm text-gray-300 px-3 py-1.5 appearance-none pr-8 cursor-pointer">
            <option>All</option>
            <option>Southeast</option>
            <option>Midwest</option>
            <option>Northeast</option>
            <option>Southwest</option>
            <option>West</option>
            <option>Mid-Atlantic</option>
          </select>
        </div>

        {/* Timeframe pills */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Timeframe</div>
          <div className="flex gap-1.5">
            {TIMEFRAMES.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                  activeTimeframe === t
                    ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                    : "bg-white/[0.05] text-white/50 hover:text-white/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

        {/* ===== KPI HERO STRIP ===== */}
        <div className="grid grid-cols-5 gap-4">
          {KPI_DATA.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredKpi(idx)}
                onMouseLeave={() => setHoveredKpi(null)}
                className={`bg-[#111827] border rounded-2xl p-5 transition-all duration-300 ${
                  hoveredKpi === idx ? "border-amber-500/30" : "border-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Icon size={16} className="text-amber-400" />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">{kpi.label}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">{kpi.value}</div>
                    <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1.5 ${
                      kpi.up ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
                    }`}>
                      {kpi.up ? "▲" : "▼"} {kpi.delta} {kpi.suffix}
                    </div>
                  </div>
                  <Sparkline data={kpi.spark} color={kpi.up ? CHART_COLORS.emerald : CHART_COLORS.rose} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== PRIMARY CHARTS ROW ===== */}
        <div className="grid grid-cols-5 gap-6">
          {/* Revenue Bridge Waterfall — 3 cols */}
          <div className="col-span-3 bg-[#111827] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Revenue Bridge: PY → CY</h2>
            <p className="text-xs text-white/40 mb-4">Year-over-year revenue change decomposition ($M)</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={waterfallBars} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} interval={0} angle={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} domain={[0, 900]} />
                <Tooltip content={<WaterfallTooltip />} cursor={false} />
                {/* Invisible offset bar */}
                <Bar dataKey="offset" stackId="waterfall" fill="transparent" />
                {/* Visible bar */}
                <Bar dataKey="height" stackId="waterfall" radius={[4, 4, 0, 0]} label={{ position: "top", fill: "rgba(255,255,255,0.7)", fontSize: 11, formatter: (_, entry) => "" }}>
                  {waterfallBars.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.type === "base" ? CHART_COLORS.amber
                        : entry.type === "total" ? CHART_COLORS.cyan
                        : entry.type === "positive" ? CHART_COLORS.amber
                        : CHART_COLORS.rose
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Value labels rendered below chart as a legend row */}
            <div className="flex justify-around mt-2 text-xs text-white/60 font-medium">
              {waterfallBars.map((d, i) => (
                <span key={i} className="text-center" style={{ color: d.type === "negative" ? CHART_COLORS.rose : d.type === "total" ? CHART_COLORS.cyan : CHART_COLORS.amber }}>
                  {d.type === "base" || d.type === "total" ? `$${d.value}M` : `${d.display}M`}
                </span>
              ))}
            </div>
          </div>

          {/* Category Mix Donut — 2 cols */}
          <div className="col-span-2 bg-[#111827] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Revenue by Category</h2>
            <p className="text-xs text-white/40 mb-4">Portfolio mix by product category</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={CATEGORY_MIX} dataKey="share" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={3} strokeWidth={0}>
                  {CATEGORY_MIX.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#1a2234] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-sm font-semibold text-white">{d.name}</p>
                      <p className="text-xs text-white/50">{d.share}% — {d.revenue}</p>
                    </div>
                  );
                }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label overlay */}
            <div className="text-center -mt-[170px] mb-[110px] pointer-events-none">
              <div className="text-2xl font-bold text-white">$847.2M</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Total Revenue</div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CATEGORY_MIX.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
                  <span className="text-xs text-gray-400">{c.name}</span>
                  <span className="text-xs text-white/60 ml-auto">{c.share}%</span>
                  <span className="text-xs text-white/40">{c.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== TREND & GEOGRAPHY ROW ===== */}
        <div className="grid grid-cols-2 gap-6">
          {/* Monthly Revenue Trend */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Monthly Net Revenue — Trailing 24 Months</h2>
            <p className="text-xs text-white/40 mb-4">Current year vs prior year ($M)</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={MONTHLY_REVENUE}>
                <defs>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="whiteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} interval={2} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} domain={[45, 90]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="py" name="Prior Year" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="6 3" fill="url(#whiteGradient)" dot={false} connectNulls />
                <Area type="monotone" dataKey="cy" name="Current Year" stroke="#F59E0B" strokeWidth={2} fill="url(#amberGradient)" dot={false} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Revenue Heat Table */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Revenue by Region</h2>
            <p className="text-xs text-white/40 mb-4">Performance by geography with year-over-year comparison</p>
            <table className="w-full">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-white/40 border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 font-medium">Region</th>
                  <th className="text-right py-3 px-4 font-medium">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium w-40">vs PY%</th>
                  <th className="text-right py-3 px-4 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {REGIONAL_DATA.map((r, i) => {
                  const maxVsPY = Math.max(...REGIONAL_DATA.map((d) => d.vsPY));
                  const barWidth = (r.vsPY / maxVsPY) * 100;
                  const isTop = r.vsPY === maxVsPY;
                  return (
                    <tr key={i} className={`text-sm text-gray-300 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${isTop ? "border-l-2 border-l-amber-500" : ""}`}>
                      <td className="py-3 px-4 font-medium text-white/80">{r.region}</td>
                      <td className="py-3 px-4 text-right text-white/90">{r.revenue}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: r.vsPY >= 0 ? CHART_COLORS.emerald : CHART_COLORS.rose,
                              }}
                            />
                          </div>
                          <span className={`text-xs font-medium w-12 text-right ${r.vsPY >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            +{r.vsPY}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-white/60">{r.share}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== PRODUCT & PRICING ROW ===== */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top 10 SKUs Table */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Top SKUs by Net Revenue</h2>
            <p className="text-xs text-white/40 mb-4">Ranked by current year net revenue</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-white/40 border-b border-white/[0.06]">
                    <th className="text-center py-2.5 px-2 font-medium w-10">#</th>
                    <th className="text-left py-2.5 px-3 font-medium">SKU Name</th>
                    <th className="text-right py-2.5 px-3 font-medium">Revenue</th>
                    <th className="text-right py-2.5 px-3 font-medium">Units</th>
                    <th className="text-right py-2.5 px-3 font-medium">Rev/Unit</th>
                    <th className="text-right py-2.5 px-3 font-medium">Δ YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_SKUS.map((s, i) => {
                    const isPositive = s.yoy.startsWith("+");
                    return (
                      <tr key={i} className={`text-sm border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                        <td className="py-2.5 px-2 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.06] text-[10px] font-bold text-white/60">{s.rank}</span>
                        </td>
                        <td className="py-2.5 px-3 text-white/80 font-medium text-xs">{s.sku}</td>
                        <td className="py-2.5 px-3 text-right text-white/90">{s.revenue}</td>
                        <td className="py-2.5 px-3 text-right text-white/60">{s.units}</td>
                        <td className="py-2.5 px-3 text-right text-white/60">{s.revUnit}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                            isPositive ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
                          }`}>
                            {s.yoy}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Pack Architecture */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Price Pack Architecture — Avg Retail Price</h2>
            <p className="text-xs text-white/40 mb-4">Current year vs prior year by price tier</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={PRICE_PACK} barGap={4} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="tier" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} domain={[0, 12]} />
                <Tooltip content={<PriceTooltip />} cursor={false} />
                <Bar dataKey="py" name="Prior Year" fill="transparent" stroke={CHART_COLORS.cyan} strokeWidth={2} radius={[4, 4, 0, 0]} label={{ position: "top", fill: "rgba(255,255,255,0.5)", fontSize: 10, formatter: (v) => `$${v}` }} />
                <Bar dataKey="cy" name="Current Year" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} label={{ position: "top", fill: "rgba(255,255,255,0.7)", fontSize: 10, formatter: (v) => `$${v}` }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm border-2" style={{ borderColor: CHART_COLORS.cyan }} />
                <span className="text-xs text-white/50">Prior Year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS.amber }} />
                <span className="text-xs text-white/50">Current Year</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM INSIGHTS ROW ===== */}
        <div className="grid grid-cols-3 gap-6">
          {INSIGHTS.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <div key={i} className={`bg-[#111827] border border-white/[0.06] rounded-2xl p-6 border-t-2 ${ins.accent}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${ins.iconBg} flex items-center justify-center`}>
                    <Icon size={16} className={ins.iconColor} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{ins.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{ins.text}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
