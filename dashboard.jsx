import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, TrendingUp, Package, BarChart3, Target, Store,
  AlertTriangle, Leaf, Tag, Activity, ChevronDown, Flame, Zap,
} from "lucide-react";

// ============ MOCK DATA ============

const COLORS = {
  amber: "#F59E0B",
  cyan: "#06B6D4",
  blue: "#3B82F6",
  emerald: "#10B981",
  rose: "#F43F5E",
  slate: "#64748B",
  violet: "#8B5CF6",
};

const KPI_DATA = [
  { label: "Can Volume", value: "312.6M", delta: "-2.1%", up: false, icon: Package, spark: [28, 27, 26, 27, 26, 26, 25, 26, 25, 25, 24, 25] },
  { label: "Net Revenue", value: "$847.2M", delta: "+6.3%", up: true, icon: DollarSign, spark: [58, 55, 62, 59, 64, 67, 72, 69, 65, 66, 72, 79], live: true },
  { label: "Door Count", value: "127.4K", delta: "+3.8%", up: true, icon: Store, spark: [118, 119, 120, 121, 122, 122, 123, 124, 125, 126, 127, 127] },
  { label: "Pouch Share", value: "28.0%", delta: "+5.2pp", up: true, icon: Zap, spark: [19, 20, 21, 22, 23, 23, 24, 25, 26, 26, 27, 28] },
];

const CATEGORY_TRANSITION = [
  { month: "Jan", traditional: 38.1, snus: 7.4, pouches: 15.9 },
  { month: "Feb", traditional: 35.9, snus: 7.0, pouches: 15.3 },
  { month: "Mar", traditional: 39.8, snus: 7.9, pouches: 18.1 },
  { month: "Apr", traditional: 37.4, snus: 7.6, pouches: 18.1 },
  { month: "May", traditional: 39.6, snus: 8.2, pouches: 20.6 },
  { month: "Jun", traditional: 41.2, snus: 8.7, pouches: 23.0 },
  { month: "Jul", traditional: 42.2, snus: 9.2, pouches: 24.9 },
  { month: "Aug", traditional: 40.4, snus: 8.9, pouches: 24.5 },
  { month: "Sep", traditional: 37.2, snus: 8.3, pouches: 23.7 },
  { month: "Oct", traditional: 37.8, snus: 8.6, pouches: 25.1 },
  { month: "Nov", traditional: 40.2, snus: 9.4, pouches: 28.5 },
  { month: "Dec", traditional: 42.6, snus: 10.1, pouches: 31.8 },
];

const FLAVOR_DATA = [
  { flavor: "Wintergreen", revenue: 248, color: COLORS.emerald },
  { flavor: "Mint", revenue: 214, color: COLORS.cyan },
  { flavor: "Straight/Natural", revenue: 168, color: COLORS.amber },
  { flavor: "Citrus", revenue: 89, color: COLORS.blue },
  { flavor: "Coffee", revenue: 42, color: COLORS.violet },
  { flavor: "Others", revenue: 86, color: COLORS.slate },
];

const REGIONAL_DATA = [
  { region: "Southeast", revenue: 245.7, vsPY: 8.4, share: 29.0, intensity: 1.0 },
  { region: "Midwest", revenue: 186.4, vsPY: 5.1, share: 22.0, intensity: 0.76 },
  { region: "Northeast", revenue: 135.6, vsPY: 3.2, share: 16.0, intensity: 0.55 },
  { region: "Southwest", revenue: 118.6, vsPY: 9.7, share: 14.0, intensity: 0.48 },
  { region: "West", revenue: 93.2, vsPY: 4.8, share: 11.0, intensity: 0.38 },
  { region: "Mid-Atlantic", revenue: 67.7, vsPY: 2.1, share: 8.0, intensity: 0.28 },
];

const TOP_SKUS = [
  { rank: 1, sku: "Copenhagen Snuff Original", revenue: "$98.4M", velocity: 94, yoy: "+4.2%", cat: "Moist Snuff" },
  { rank: 2, sku: "Grizzly Dark Mint Pouch", revenue: "$87.1M", velocity: 88, yoy: "+7.8%", cat: "Moist Snuff" },
  { rank: 3, sku: "ZYN Cool Mint 6mg", revenue: "$76.8M", velocity: 97, yoy: "+38.4%", cat: "Pouch" },
  { rank: 4, sku: "Copenhagen Long Cut", revenue: "$72.3M", velocity: 81, yoy: "+2.1%", cat: "Moist Snuff" },
  { rank: 5, sku: "Grizzly Wide Cut Natural", revenue: "$64.5M", velocity: 76, yoy: "-1.3%", cat: "Moist Snuff" },
];

const WATERFALL_DATA = [
  { name: "Prior Year", value: 788.4, type: "base" },
  { name: "Price ↑", value: 72.3, type: "positive" },
  { name: "Mix Shift", value: 18.6, type: "positive" },
  { name: "Vol Decline", value: -41.2, type: "negative" },
  { name: "Promo", value: -15.8, type: "negative" },
  { name: "New SKUs", value: 24.9, type: "positive" },
  { name: "Current Year", value: 847.2, type: "total" },
];

const waterfallBars = (() => {
  let running = 0;
  return WATERFALL_DATA.map((d) => {
    if (d.type === "base") { running = d.value; return { ...d, offset: 0, height: d.value, label: `$${d.value}M` }; }
    if (d.type === "total") { return { ...d, offset: 0, height: d.value, label: `$${d.value}M` }; }
    if (d.type === "positive") { const o = running; running += d.value; return { ...d, offset: o, height: d.value, label: `+$${d.value}M` }; }
    running += d.value;
    return { ...d, offset: running, height: Math.abs(d.value), label: `-$${Math.abs(d.value)}M` };
  });
})();

const INSIGHTS = [
  { icon: AlertTriangle, title: "Promo ROI Alert", text: "Q3 BOGO promotions returned $0.82 per $1.00 invested — below the $1.15 threshold. Recommend shifting 12% of trade budget to everyday low price.", accent: "border-t-rose-500", iconColor: "text-rose-400", iconBg: "bg-rose-500/10" },
  { icon: Leaf, title: "Nicotine Pouch Growth", text: "Pouch segment +34% YoY, now 28% of portfolio revenue. ZYN 6mg Cool Mint is the #1 velocity SKU in convenience.", accent: "border-t-emerald-500", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  { icon: Tag, title: "Pricing Opportunity", text: "Elasticity modeling shows 3.2% price increase headroom on Premium moist snuff in Southeast without volume risk above -1.5%.", accent: "border-t-amber-500", iconColor: "text-amber-400", iconBg: "bg-amber-500/10" },
];

const TIMEFRAMES = ["7D", "30D", "YTD", "Max"];
const STRENGTHS = ["All", "3mg", "6mg", "9mg+", "Zero"];
const CHANNELS = ["All", "C-Store", "Smoke Shop", "E-Commerce"];

// ============ ANIMATION VARIANTS ============

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ============ SUB-COMPONENTS ============

const Sparkline = ({ data, color = COLORS.amber }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 76 + 2},${28 - ((v - min) / range) * 24 - 2}`).join(" ");
  return (
    <svg width="80" height="28" className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Pulse = ({ color = "bg-emerald-500" }) => (
  <span className="relative flex h-2 w-2">
    <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />
    <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
  </span>
);

const ChartTooltip = ({ active, payload, label, prefix = "$", suffix = "M" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || entry.stroke }}>
          {entry.name}: {prefix}{typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}{suffix}
        </p>
      ))}
    </div>
  );
};

const GlassCard = ({ children, className = "", noPad = false, accent = "" }) => (
  <div className={`bg-[rgba(30,41,59,0.7)] backdrop-blur-md border border-white/10 rounded-2xl ${noPad ? "" : "p-6"} ${accent} ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-white">{children}</h2>
    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

const CategoryPill = ({ cat }) => {
  const colorMap = { "Moist Snuff": "bg-amber-500/15 text-amber-400", "Pouch": "bg-blue-500/15 text-blue-400", "Snus": "bg-cyan-500/15 text-cyan-400" };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorMap[cat] || "bg-slate-500/15 text-slate-400"}`}>{cat}</span>;
};

const FilterDropdown = ({ label, options, value, onChange }) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 font-medium">{label}</div>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-slate-300 pl-3 pr-8 py-2 appearance-none cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/30"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  </div>
);

// ============ MAIN DASHBOARD ============

export default function Dashboard() {
  const [activeTimeframe, setActiveTimeframe] = useState("YTD");
  const [strength, setStrength] = useState("All");
  const [channel, setChannel] = useState("All");

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-y-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* ===== NAV BAR ===== */}
      <nav className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Flame size={18} className="text-amber-400" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Revenue Command Center</span>
              <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">Smokeless Division</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <Pulse />
              <span className="font-medium">Live</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-amber-500/20">VP</div>
          </div>
        </div>
      </nav>

      {/* ===== FILTER BAR ===== */}
      <div className="sticky top-[57px] z-40 bg-slate-900/50 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-end gap-6 flex-wrap">
          {/* Timeframe pills */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 font-medium">Timeframe</div>
            <div className="flex gap-1.5">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTimeframe(t)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                    activeTimeframe === t
                      ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                      : "bg-white/[0.05] text-white/40 hover:text-white/60 hover:bg-white/[0.08]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <FilterDropdown label="Nicotine Strength" options={STRENGTHS} value={strength} onChange={setStrength} />
          <FilterDropdown label="Channel" options={CHANNELS} value={channel} onChange={setChannel} />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <motion.div
        className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ===== KPI HERO STRIP ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_DATA.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={idx} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <GlassCard className="relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
                  {/* Subtle gradient accent on top */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/60 via-amber-500/20 to-transparent" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                        <Icon size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400 font-medium">{kpi.label}</div>
                        {kpi.live && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Pulse />
                            <span className="text-[9px] text-emerald-400/70 font-medium uppercase tracking-wider">Live</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Sparkline data={kpi.spark} color={kpi.up ? COLORS.emerald : COLORS.rose} />
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-white">{kpi.value}</div>
                  <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 ${
                    kpi.up ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {kpi.up ? "▲" : "▼"} {kpi.delta}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* ===== CATEGORY TRANSITION + FLAVOR VELOCITY ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Category Transition — 3 cols */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <GlassCard>
              <SectionTitle subtitle="12-month trend showing Modern Oral growth vs. Traditional">Category Transition</SectionTitle>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={CATEGORY_TRANSITION}>
                  <defs>
                    <linearGradient id="gradTraditional" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradPouches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSnus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="traditional" name="Traditional" stackId="1" stroke={COLORS.amber} strokeWidth={2} fill="url(#gradTraditional)" />
                  <Area type="monotone" dataKey="snus" name="Snus" stackId="1" stroke={COLORS.cyan} strokeWidth={2} fill="url(#gradSnus)" />
                  <Area type="monotone" dataKey="pouches" name="Pouches" stackId="1" stroke={COLORS.blue} strokeWidth={2} fill="url(#gradPouches)" />
                </AreaChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center gap-5 mt-3 ml-1">
                {[{ label: "Traditional", color: COLORS.amber }, { label: "Snus", color: COLORS.cyan }, { label: "Pouches", color: COLORS.blue }].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-slate-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Flavor Velocity — 2 cols */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <GlassCard>
              <SectionTitle subtitle="Revenue by flavor profile ($M)">Flavor Velocity Matrix</SectionTitle>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={FLAVOR_DATA} layout="vertical" barSize={22}>
                  <defs>
                    {FLAVOR_DATA.map((f) => (
                      <linearGradient key={f.flavor} id={`grad-${f.flavor.replace(/[^a-zA-Z]/g, "")}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={f.color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={f.color} stopOpacity={0.4} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                  <YAxis type="category" dataKey="flavor" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }} width={110} />
                  <Tooltip content={<ChartTooltip />} cursor={false} />
                  <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]}>
                    {FLAVOR_DATA.map((f) => (
                      <Cell key={f.flavor} fill={`url(#grad-${f.flavor.replace(/[^a-zA-Z]/g, "")})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>

        {/* ===== REGIONAL HEATMAP + SKU LEADERBOARD ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Heatmap */}
          <motion.div variants={fadeUp}>
            <GlassCard>
              <SectionTitle subtitle="Revenue performance by geography ($M)">Regional Heatmap</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {REGIONAL_DATA.map((r) => (
                  <div
                    key={r.region}
                    className="relative rounded-xl p-4 border border-white/[0.06] overflow-hidden hover:border-amber-500/20 transition-all duration-300 group"
                  >
                    {/* Heat gradient background */}
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, rgba(245,158,11,${r.intensity * 0.15}) 0%, rgba(245,158,11,${r.intensity * 0.04}) 100%)`,
                      }}
                    />
                    <div className="relative">
                      <div className="text-xs text-slate-400 font-medium mb-1">{r.region}</div>
                      <div className="text-xl font-bold text-white">${r.revenue}M</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold ${r.vsPY >= 5 ? "text-emerald-400" : "text-amber-400"}`}>
                          +{r.vsPY}%
                        </span>
                        <span className="text-[10px] text-slate-500">{r.share}% share</span>
                      </div>
                      {/* Intensity bar */}
                      <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${r.intensity * 100}%`,
                            background: `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.amber}88)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* SKU Leaderboard */}
          <motion.div variants={fadeUp}>
            <GlassCard>
              <SectionTitle subtitle="Top 5 SKUs by velocity score">SKU Leaderboard</SectionTitle>
              <div className="space-y-3">
                {TOP_SKUS.map((s) => {
                  const isPositive = s.yoy.startsWith("+");
                  return (
                    <div key={s.rank} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                      {/* Rank badge */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        s.rank <= 3 ? "bg-amber-500/15 text-amber-400" : "bg-white/[0.06] text-slate-400"
                      }`}>
                        {s.rank}
                      </div>
                      {/* SKU info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate group-hover:text-amber-50 transition-colors">{s.sku}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryPill cat={s.cat} />
                          <span className="text-xs text-slate-500">{s.revenue}</span>
                        </div>
                      </div>
                      {/* Velocity bar */}
                      <div className="w-20 flex-shrink-0">
                        <div className="text-[10px] text-slate-500 text-right mb-1">Velocity</div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.velocity}%`,
                              background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.blue})`,
                            }}
                          />
                        </div>
                      </div>
                      {/* YoY delta */}
                      <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {s.yoy}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ===== REVENUE BRIDGE ===== */}
        <motion.div variants={fadeUp}>
          <GlassCard>
            <SectionTitle subtitle="Year-over-year revenue change decomposition ($M)">Revenue Bridge: PY → CY</SectionTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waterfallBars} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} domain={[0, 900]} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{d.name}</p>
                      <p className="text-sm font-bold text-white">{d.label}</p>
                    </div>
                  );
                }} cursor={false} />
                <Bar dataKey="offset" stackId="w" fill="transparent" />
                <Bar dataKey="height" stackId="w" radius={[6, 6, 0, 0]}>
                  {waterfallBars.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.type === "total" ? COLORS.cyan
                        : entry.type === "negative" ? COLORS.rose
                        : COLORS.amber
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-1">
              {waterfallBars.map((d, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold"
                  style={{
                    color: d.type === "negative" ? COLORS.rose : d.type === "total" ? COLORS.cyan : COLORS.amber,
                  }}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* ===== INSIGHT CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INSIGHTS.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <GlassCard className={`border-t-2 ${ins.accent} hover:border-white/15 transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${ins.iconBg} flex items-center justify-center`}>
                      <Icon size={18} className={ins.iconColor} />
                    </div>
                    <h3 className="text-sm font-bold text-white">{ins.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{ins.text}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
