import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Package, Store, Zap, Flame, ChevronDown,
  AlertTriangle, Leaf, Tag, X, SearchX, ArrowLeft,
} from "lucide-react";

// ============ CONSTANTS ============

const COLORS = {
  amber: "#F59E0B", cyan: "#06B6D4", blue: "#3B82F6",
  emerald: "#10B981", rose: "#F43F5E", slate: "#64748B", violet: "#8B5CF6",
};

const TIMEFRAMES = ["7D", "30D", "YTD", "Max"];
const STRENGTHS = ["All", "3mg", "6mg", "9mg+", "Zero", "Regular"];
const CHANNELS = ["All", "C-Store", "Smoke Shop", "E-Commerce"];
const CATEGORIES = ["All", "Dip", "Pouch", "Snus", "Chewing"];

const REGION_WEIGHTS = { Southeast: 0.29, Midwest: 0.22, Northeast: 0.16, Southwest: 0.14, West: 0.11, "Mid-Atlantic": 0.08 };
const CHANNEL_WEIGHTS = { "C-Store": 0.62, "Smoke Shop": 0.25, "E-Commerce": 0.13 };
const SEASON = [0.86, 0.81, 0.93, 0.89, 0.97, 1.03, 1.08, 1.05, 0.98, 1.01, 1.10, 1.19];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FLAVOR_COLORS = {
  Wintergreen: COLORS.emerald, Mint: COLORS.cyan, Straight: COLORS.amber,
  Citrus: COLORS.blue, Coffee: COLORS.violet, Cinnamon: COLORS.rose,
};

const BRIDGE_RATIOS = { price: 72.3, mix: 18.6, volume: -41.2, promo: -15.8, newProducts: 24.9 };
const BRIDGE_REF_DELTA = Object.values(BRIDGE_RATIOS).reduce((s, v) => s + v, 0);

// ============ DETERMINISTIC DATA GENERATOR ============

const mulberry32 = (a) => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const PRODUCT_CATALOG = [
  { sku: "Copenhagen Snuff Original", cat: "Dip", flav: "Straight", str: "Regular", rev: 98.4, grow: 0.042 },
  { sku: "Grizzly Dark Mint Pouch", cat: "Dip", flav: "Mint", str: "Regular", rev: 87.1, grow: 0.078 },
  { sku: "ZYN Cool Mint 6mg", cat: "Pouch", flav: "Mint", str: "6mg", rev: 76.8, grow: 0.384 },
  { sku: "Copenhagen Long Cut", cat: "Dip", flav: "Straight", str: "Regular", rev: 72.3, grow: 0.021 },
  { sku: "Grizzly Wide Cut Natural", cat: "Dip", flav: "Straight", str: "Regular", rev: 64.5, grow: -0.013 },
  { sku: "Timber Wolf LC Wintergreen", cat: "Dip", flav: "Wintergreen", str: "Regular", rev: 58.2, grow: -0.046 },
  { sku: "ZYN Spearmint 3mg", cat: "Pouch", flav: "Mint", str: "3mg", rev: 52.9, grow: 0.421 },
  { sku: "Skoal Classic Mint", cat: "Dip", flav: "Mint", str: "Regular", rev: 48.7, grow: -0.028 },
  { sku: "Kodiak Wintergreen", cat: "Dip", flav: "Wintergreen", str: "Regular", rev: 44.1, grow: 0.015 },
  { sku: "Longhorn Straight", cat: "Chewing", flav: "Straight", str: "Regular", rev: 38.6, grow: -0.052 },
  { sku: "Other Dip Wintergreen", cat: "Dip", flav: "Wintergreen", str: "Regular", rev: 28.0, grow: -0.03 },
  { sku: "Pouch Wintergreen 6mg", cat: "Pouch", flav: "Wintergreen", str: "6mg", rev: 26.5, grow: 0.28 },
  { sku: "Pouch Citrus 6mg", cat: "Pouch", flav: "Citrus", str: "6mg", rev: 24.2, grow: 0.32 },
  { sku: "General Snus Wintergreen", cat: "Snus", flav: "Wintergreen", str: "6mg", rev: 42.0, grow: 0.04 },
  { sku: "General Snus Mint", cat: "Snus", flav: "Mint", str: "6mg", rev: 38.5, grow: 0.05 },
  { sku: "Snus Original 9mg", cat: "Snus", flav: "Straight", str: "9mg+", rev: 21.2, grow: 0.02 },
  { sku: "Pouch Coffee 6mg", cat: "Pouch", flav: "Coffee", str: "6mg", rev: 16.8, grow: 0.18 },
  { sku: "Pouch Cinnamon 6mg", cat: "Pouch", flav: "Cinnamon", str: "6mg", rev: 12.4, grow: 0.15 },
  { sku: "Pouch Mint 9mg+", cat: "Pouch", flav: "Mint", str: "9mg+", rev: 14.2, grow: 0.25 },
  { sku: "Pouch Citrus 3mg", cat: "Pouch", flav: "Citrus", str: "3mg", rev: 9.8, grow: 0.35 },
  { sku: "Pouch Zero Mint", cat: "Pouch", flav: "Mint", str: "Zero", rev: 7.5, grow: 0.50 },
  { sku: "Red Man Chewing WG", cat: "Chewing", flav: "Wintergreen", str: "Regular", rev: 29.2, grow: -0.06 },
];

const generateSalesData = () => {
  const rand = mulberry32(42);
  const records = [];
  const regions = Object.keys(REGION_WEIGHTS);
  const channels = Object.keys(CHANNEL_WEIGHTS);

  PRODUCT_CATALOG.forEach((p) => {
    [2024, 2025].forEach((year) => {
      const annual = year === 2025 ? p.rev : p.rev / (1 + p.grow);
      for (let m = 0; m < 12; m++) {
        const monthBase = (annual / 12) * SEASON[m];
        regions.forEach((region) => {
          channels.forEach((channel) => {
            const noise = 0.88 + rand() * 0.24;
            const rev = monthBase * REGION_WEIGHTS[region] * CHANNEL_WEIGHTS[channel] * noise;
            records.push({
              date: `${year}-${String(m + 1).padStart(2, "0")}-15`,
              year, month: m,
              category: p.cat, flavor: p.flav, nicotineStrength: p.str,
              region, channel, sku: p.sku,
              revenue: +rev.toFixed(4),
              units: +(rev * (0.32 + rand() * 0.12)).toFixed(4),
            });
          });
        });
      }
    });
  });
  return records;
};

const SALES_RECORDS = generateSalesData();

// ============ UTILITY FUNCTIONS ============

const getGrowthRate = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const groupByKey = (data, key) => {
  const map = {};
  data.forEach((r) => {
    const k = r[key];
    if (!map[k]) map[k] = { key: k, revenue: 0, units: 0, count: 0 };
    map[k].revenue += r.revenue;
    map[k].units += r.units;
    map[k].count += 1;
  });
  return Object.values(map);
};

const filterByTime = (data, range) => {
  if (range === "Max") return data;
  const cy = data.filter((r) => r.year === 2025);
  if (range === "YTD") return cy;
  if (range === "30D") return cy.filter((r) => r.month >= 10);
  if (range === "7D") return cy.filter((r) => r.month === 11);
  return cy;
};

// ============ useDashboardData HOOK ============

const DEFAULT_FILTERS = { timeframe: "YTD", nicotineStrength: "All", channel: "All", category: "All", flavor: "All", region: "All" };

const useDashboardData = (filters) => {
  const filtered = useMemo(() => {
    let d = filterByTime(SALES_RECORDS, filters.timeframe);
    if (filters.nicotineStrength !== "All") d = d.filter((r) => r.nicotineStrength === filters.nicotineStrength);
    if (filters.channel !== "All") d = d.filter((r) => r.channel === filters.channel);
    if (filters.category !== "All") d = d.filter((r) => r.category === filters.category);
    if (filters.flavor !== "All") d = d.filter((r) => r.flavor === filters.flavor);
    if (filters.region !== "All") d = d.filter((r) => r.region === filters.region);
    return d;
  }, [filters]);

  // Prior year equivalent for growth calcs
  const filteredPY = useMemo(() => {
    let d = SALES_RECORDS.filter((r) => r.year === 2024);
    if (filters.nicotineStrength !== "All") d = d.filter((r) => r.nicotineStrength === filters.nicotineStrength);
    if (filters.channel !== "All") d = d.filter((r) => r.channel === filters.channel);
    if (filters.category !== "All") d = d.filter((r) => r.category === filters.category);
    if (filters.flavor !== "All") d = d.filter((r) => r.flavor === filters.flavor);
    if (filters.region !== "All") d = d.filter((r) => r.region === filters.region);
    if (filters.timeframe === "30D") d = d.filter((r) => r.month >= 10);
    if (filters.timeframe === "7D") d = d.filter((r) => r.month === 11);
    return d;
  }, [filters]);

  const isEmpty = filtered.length === 0;

  // KPIs
  const kpis = useMemo(() => {
    const cyRev = filtered.reduce((s, r) => s + r.revenue, 0);
    const pyRev = filteredPY.reduce((s, r) => s + r.revenue, 0);
    const cyUnits = filtered.reduce((s, r) => s + r.units, 0);
    const pyUnits = filteredPY.reduce((s, r) => s + r.units, 0);
    const pouchRev = filtered.filter((r) => r.category === "Pouch").reduce((s, r) => s + r.revenue, 0);
    const pouchShare = cyRev > 0 ? (pouchRev / cyRev) * 100 : 0;
    const pyPouchRev = filteredPY.filter((r) => r.category === "Pouch").reduce((s, r) => s + r.revenue, 0);
    const pyPouchShare = pyRev > 0 ? (pyPouchRev / pyRev) * 100 : 0;
    const doorCount = cyRev * 0.1504; // proportional proxy

    // Sparklines — monthly CY revenue
    const monthlyRev = Array.from({ length: 12 }, (_, m) => filtered.filter((r) => r.month === m).reduce((s, r) => s + r.revenue, 0));
    const monthlyUnits = Array.from({ length: 12 }, (_, m) => filtered.filter((r) => r.month === m).reduce((s, r) => s + r.units, 0));
    const monthlyPouch = Array.from({ length: 12 }, (_, m) => {
      const total = filtered.filter((r) => r.month === m).reduce((s, r) => s + r.revenue, 0);
      const pouch = filtered.filter((r) => r.month === m && r.category === "Pouch").reduce((s, r) => s + r.revenue, 0);
      return total > 0 ? (pouch / total) * 100 : 0;
    });

    return [
      { label: "Can Volume", value: `${(cyUnits).toFixed(1)}M`, delta: `${getGrowthRate(cyUnits, pyUnits) >= 0 ? "+" : ""}${getGrowthRate(cyUnits, pyUnits).toFixed(1)}%`, up: cyUnits >= pyUnits, icon: Package, spark: monthlyUnits },
      { label: "Net Revenue", value: `$${cyRev.toFixed(1)}M`, delta: `${getGrowthRate(cyRev, pyRev) >= 0 ? "+" : ""}${getGrowthRate(cyRev, pyRev).toFixed(1)}%`, up: cyRev >= pyRev, icon: DollarSign, spark: monthlyRev, live: true },
      { label: "Door Count", value: `${(doorCount).toFixed(1)}K`, delta: `${getGrowthRate(doorCount, pyRev * 0.1504) >= 0 ? "+" : ""}${getGrowthRate(doorCount, pyRev * 0.1504).toFixed(1)}%`, up: doorCount >= pyRev * 0.1504, icon: Store, spark: monthlyRev.map((v) => v * 0.1504) },
      { label: "Pouch Share", value: `${pouchShare.toFixed(1)}%`, delta: `${(pouchShare - pyPouchShare) >= 0 ? "+" : ""}${(pouchShare - pyPouchShare).toFixed(1)}pp`, up: pouchShare >= pyPouchShare, icon: Zap, spark: monthlyPouch },
    ];
  }, [filtered, filteredPY]);

  // Category Transition — monthly stacked
  const categoryTrend = useMemo(() => {
    return MONTH_LABELS.map((label, m) => {
      const monthRecs = filtered.filter((r) => r.month === m);
      return {
        month: label,
        Dip: +monthRecs.filter((r) => r.category === "Dip").reduce((s, r) => s + r.revenue, 0).toFixed(2),
        Snus: +monthRecs.filter((r) => r.category === "Snus").reduce((s, r) => s + r.revenue, 0).toFixed(2),
        Pouch: +monthRecs.filter((r) => r.category === "Pouch").reduce((s, r) => s + r.revenue, 0).toFixed(2),
        Chewing: +monthRecs.filter((r) => r.category === "Chewing").reduce((s, r) => s + r.revenue, 0).toFixed(2),
      };
    });
  }, [filtered]);

  // Flavor Velocity
  const flavorData = useMemo(() => {
    return groupByKey(filtered, "flavor")
      .sort((a, b) => b.revenue - a.revenue)
      .map((f) => ({ flavor: f.key, revenue: +f.revenue.toFixed(1), color: FLAVOR_COLORS[f.key] || COLORS.slate }));
  }, [filtered]);

  // Regional Heatmap
  const regionalData = useMemo(() => {
    const cyByRegion = groupByKey(filtered, "region");
    const pyByRegion = groupByKey(filteredPY, "region");
    const pyMap = {};
    pyByRegion.forEach((r) => { pyMap[r.key] = r.revenue; });
    const totalRev = cyByRegion.reduce((s, r) => s + r.revenue, 0);
    const maxRev = Math.max(...cyByRegion.map((r) => r.revenue), 1);
    return cyByRegion
      .sort((a, b) => b.revenue - a.revenue)
      .map((r) => ({
        region: r.key,
        revenue: +r.revenue.toFixed(1),
        vsPY: +getGrowthRate(r.revenue, pyMap[r.key] || 0).toFixed(1),
        share: totalRev > 0 ? +((r.revenue / totalRev) * 100).toFixed(1) : 0,
        intensity: r.revenue / maxRev,
      }));
  }, [filtered, filteredPY]);

  // SKU Leaderboard
  const skuData = useMemo(() => {
    const cyBySku = groupByKey(filtered, "sku");
    const pyBySku = groupByKey(filteredPY, "sku");
    const pyMap = {};
    pyBySku.forEach((r) => { pyMap[r.key] = r.revenue; });
    const maxRev = Math.max(...cyBySku.map((r) => r.revenue), 1);
    // Get category for each SKU from first matching record
    const skuCatMap = {};
    filtered.forEach((r) => { if (!skuCatMap[r.sku]) skuCatMap[r.sku] = r.category; });
    return cyBySku
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((r, i) => ({
        rank: i + 1,
        sku: r.key,
        revenue: r.revenue,
        velocity: Math.round((r.revenue / maxRev) * 100),
        yoy: getGrowthRate(r.revenue, pyMap[r.key] || 0),
        cat: skuCatMap[r.key] || "Other",
      }));
  }, [filtered, filteredPY]);

  // Revenue Bridge
  const waterfallData = useMemo(() => {
    const cyTotal = filtered.reduce((s, r) => s + r.revenue, 0);
    const pyTotal = filteredPY.reduce((s, r) => s + r.revenue, 0);
    const delta = cyTotal - pyTotal;
    const scale = BRIDGE_REF_DELTA !== 0 ? delta / BRIDGE_REF_DELTA : 0;
    const steps = [
      { name: "Prior Year", value: +pyTotal.toFixed(1), type: "base" },
      { name: "Price ↑", value: +(BRIDGE_RATIOS.price * scale).toFixed(1), type: "positive" },
      { name: "Mix Shift", value: +(BRIDGE_RATIOS.mix * scale).toFixed(1), type: "positive" },
      { name: "Vol Decline", value: +(BRIDGE_RATIOS.volume * scale).toFixed(1), type: "negative" },
      { name: "Promo", value: +(BRIDGE_RATIOS.promo * scale).toFixed(1), type: "negative" },
      { name: "New SKUs", value: +(BRIDGE_RATIOS.newProducts * scale).toFixed(1), type: "positive" },
      { name: "Current Year", value: +cyTotal.toFixed(1), type: "total" },
    ];
    let running = 0;
    return steps.map((d) => {
      if (d.type === "base") { running = d.value; return { ...d, offset: 0, height: d.value, label: `$${d.value.toFixed(1)}M` }; }
      if (d.type === "total") { return { ...d, offset: 0, height: d.value, label: `$${d.value.toFixed(1)}M` }; }
      if (d.type === "positive") { const o = running; running += d.value; return { ...d, offset: o, height: d.value, label: `+$${d.value.toFixed(1)}M` }; }
      running += d.value;
      return { ...d, offset: running, height: Math.abs(d.value), label: `-$${Math.abs(d.value).toFixed(1)}M` };
    });
  }, [filtered, filteredPY]);

  return { isEmpty, kpis, categoryTrend, flavorData, regionalData, skuData, waterfallData };
};

// ============ ANIMATION ============

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

// ============ SUB-COMPONENTS ============

const Sparkline = ({ data, color = COLORS.amber }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 76 + 2},${28 - ((v - min) / range) * 24 - 2}`).join(" ");
  return (
    <svg width="80" height="28" className="flex-shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Pulse = () => (
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
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

const GlassCard = ({ children, className = "", accent = "" }) => (
  <div className={`bg-[rgba(30,41,59,0.7)] backdrop-blur-md border border-white/10 rounded-2xl p-6 ${accent} ${className}`}>
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
  const m = { Dip: "bg-amber-500/15 text-amber-400", Pouch: "bg-blue-500/15 text-blue-400", Snus: "bg-cyan-500/15 text-cyan-400", Chewing: "bg-rose-500/15 text-rose-400" };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${m[cat] || "bg-slate-500/15 text-slate-400"}`}>{cat}</span>;
};

const FilterDropdown = ({ label, options, value, onChange }) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 font-medium">{label}</div>
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-slate-300 pl-3 pr-8 py-2 appearance-none cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/30">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  </div>
);

// Skeleton shimmer for loading states
const Skeleton = ({ height = 300, rows = 0 }) => (
  <div className="animate-pulse space-y-3" style={{ minHeight: height }}>
    <div className="h-4 w-1/3 bg-white/[0.06] rounded" />
    <div className="h-3 w-1/5 bg-white/[0.04] rounded" />
    {rows > 0 ? (
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-10 bg-white/[0.03] rounded-xl" style={{ opacity: 1 - i * 0.12 }} />
        ))}
      </div>
    ) : (
      <div className="flex-1 bg-white/[0.03] rounded-xl" style={{ height: height - 40 }} />
    )}
  </div>
);

// Empty state when filters return nothing
const EmptyState = ({ filters }) => {
  const active = Object.entries(filters).filter(([k, v]) => v !== "All" && k !== "timeframe").map(([k, v]) => `${v} ${k}`);
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
        <SearchX size={24} className="text-slate-600" />
      </div>
      <p className="text-sm font-medium text-slate-400 mb-1">No matching records</p>
      <p className="text-xs text-slate-600 max-w-[260px]">
        {active.length > 0 ? `No data for ${active.join(" + ")} in this timeframe.` : "Try adjusting your filters."}
      </p>
    </div>
  );
};

const INSIGHTS = [
  { icon: AlertTriangle, title: "Promo ROI Alert", text: "Q3 BOGO promotions returned $0.82 per $1.00 invested — below the $1.15 threshold. Recommend shifting 12% of trade budget to everyday low price.", accent: "border-t-rose-500", iconColor: "text-rose-400", iconBg: "bg-rose-500/10" },
  { icon: Leaf, title: "Nicotine Pouch Growth", text: "Pouch segment +34% YoY, now 28% of portfolio revenue. ZYN 6mg Cool Mint is the #1 velocity SKU in convenience.", accent: "border-t-emerald-500", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  { icon: Tag, title: "Pricing Opportunity", text: "Elasticity modeling shows 3.2% price increase headroom on Premium moist snuff in Southeast without volume risk above -1.5%.", accent: "border-t-amber-500", iconColor: "text-amber-400", iconBg: "bg-amber-500/10" },
];

// ============ MAIN DASHBOARD ============

export default function Dashboard({ onBack }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [isLoading, setIsLoading] = useState(false);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: prev[key] === value ? "All" : value };
      // If toggling back to same value = clear it
      if (key !== "timeframe" && prev[key] === value) next[key] = "All";
      return next;
    });
    setIsLoading(true);
  }, []);

  const setTimeframe = useCallback((t) => {
    setFilters((prev) => ({ ...prev, timeframe: t }));
    setIsLoading(true);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setIsLoading(true);
  }, []);

  // Skeleton timer
  useEffect(() => {
    if (isLoading) {
      const t = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  const hasActiveFilters = filters.nicotineStrength !== "All" || filters.channel !== "All" || filters.category !== "All" || filters.flavor !== "All" || filters.region !== "All";
  const activePills = Object.entries(filters).filter(([k, v]) => v !== "All" && k !== "timeframe").map(([k, v]) => ({ key: k, value: v }));

  const { isEmpty, kpis, categoryTrend, flavorData, regionalData, skuData, waterfallData } = useDashboardData(filters);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-y-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors" title="Back to Hub">
                <ArrowLeft size={16} className="text-slate-400" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center"><Flame size={18} className="text-amber-400" /></div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Revenue Command Center</span>
              <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">Smokeless Division</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full"><Pulse /><span className="font-medium">Live</span></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-amber-500/20">VP</div>
          </div>
        </div>
      </nav>

      {/* FILTER BAR */}
      <div className="sticky top-[57px] z-40 bg-slate-900/50 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-end gap-6 flex-wrap">
          {/* Timeframe pills */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 font-medium">Timeframe</div>
            <div className="flex gap-1.5">
              {TIMEFRAMES.map((t) => (
                <button key={t} onClick={() => setTimeframe(t)} className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${filters.timeframe === t ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10" : "bg-white/[0.05] text-white/40 hover:text-white/60 hover:bg-white/[0.08]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <FilterDropdown label="Nicotine Strength" options={STRENGTHS} value={filters.nicotineStrength} onChange={(v) => updateFilter("nicotineStrength", v)} />
          <FilterDropdown label="Channel" options={CHANNELS} value={filters.channel} onChange={(v) => updateFilter("channel", v)} />

          {/* Active cross-filter pills */}
          <AnimatePresence>
            {activePills.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2 pb-0.5">
                {activePills.map((p) => (
                  <button key={p.key} onClick={() => updateFilter(p.key, "All")} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">
                    {p.value} <X size={10} />
                  </button>
                ))}
                <button onClick={clearFilters} className="text-[11px] text-slate-500 hover:text-white transition-colors ml-1 underline underline-offset-2">
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONTENT */}
      <motion.div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto relative" variants={containerVariants} initial="hidden" animate="visible">

        {/* KPI HERO STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(isLoading ? Array.from({ length: 4 }) : kpis).map((kpi, idx) => (
            <motion.div key={idx} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <GlassCard className="relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/60 via-amber-500/20 to-transparent" />
                {isLoading || !kpi ? (
                  <Skeleton height={100} />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                          <kpi.icon size={18} className="text-amber-400" />
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400 font-medium">{kpi.label}</div>
                          {kpi.live && <div className="flex items-center gap-1.5 mt-0.5"><Pulse /><span className="text-[9px] text-emerald-400/70 font-medium uppercase tracking-wider">Live</span></div>}
                        </div>
                      </div>
                      <Sparkline data={kpi.spark} color={kpi.up ? COLORS.emerald : COLORS.rose} />
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-white">{kpi.value}</div>
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 ${kpi.up ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {kpi.up ? "▲" : "▼"} {kpi.delta}
                    </div>
                  </>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* CATEGORY TRANSITION + FLAVOR VELOCITY */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <GlassCard>
              <SectionTitle subtitle="12-month trend — click a legend item to filter by category">Category Transition</SectionTitle>
              {isLoading ? <Skeleton height={340} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={categoryTrend}>
                      <defs>
                        <linearGradient id="gDip" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.25} /><stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gPouch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.3} /><stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gSnus" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.2} /><stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gChew" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.rose} stopOpacity={0.15} /><stop offset="100%" stopColor={COLORS.rose} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(0)}M`} />
                      <Tooltip content={<ChartTooltip />} />
                      {["Dip", "Snus", "Pouch", "Chewing"].map((cat) => {
                        const colorMap = { Dip: COLORS.amber, Snus: COLORS.cyan, Pouch: COLORS.blue, Chewing: COLORS.rose };
                        const gradMap = { Dip: "url(#gDip)", Snus: "url(#gSnus)", Pouch: "url(#gPouch)", Chewing: "url(#gChew)" };
                        const dimmed = filters.category !== "All" && filters.category !== cat;
                        return <Area key={cat} type="monotone" dataKey={cat} name={cat} stackId="1" stroke={colorMap[cat]} strokeWidth={dimmed ? 1 : 2} strokeOpacity={dimmed ? 0.2 : 1} fill={gradMap[cat]} fillOpacity={dimmed ? 0.05 : 1} animationDuration={600} />;
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-3 ml-1">
                    {[{ l: "Dip", c: COLORS.amber }, { l: "Snus", c: COLORS.cyan }, { l: "Pouch", c: COLORS.blue }, { l: "Chewing", c: COLORS.rose }].map((item) => (
                      <button key={item.l} onClick={() => updateFilter("category", item.l)} className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${filters.category === item.l ? "bg-white/[0.06] ring-1 ring-white/10" : "hover:bg-white/[0.03]"}`}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.c, opacity: filters.category !== "All" && filters.category !== item.l ? 0.3 : 1 }} />
                        <span className={`text-xs ${filters.category !== "All" && filters.category !== item.l ? "text-slate-600" : "text-slate-400"}`}>{item.l}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>

          {/* Flavor Velocity */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <GlassCard>
              <SectionTitle subtitle="Revenue by flavor — click a bar to cross-filter">Flavor Velocity Matrix</SectionTitle>
              {isLoading ? <Skeleton height={340} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <ResponsiveContainer width="100%" height={Math.max(320, flavorData.length * 52)}>
                  <BarChart data={flavorData} layout="vertical" barSize={22}>
                    <defs>
                      {flavorData.map((f) => (
                        <linearGradient key={f.flavor} id={`gf-${f.flavor.replace(/[^a-zA-Z]/g, "")}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={f.color} stopOpacity={0.9} /><stop offset="100%" stopColor={f.color} stopOpacity={0.4} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
                    <YAxis type="category" dataKey="flavor" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }} width={110} />
                    <Tooltip content={<ChartTooltip />} cursor={false} />
                    <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]} onClick={(d) => updateFilter("flavor", d.flavor)} style={{ cursor: "pointer" }} animationDuration={600}>
                      {flavorData.map((f) => {
                        const dimmed = filters.flavor !== "All" && filters.flavor !== f.flavor;
                        return <Cell key={f.flavor} fill={`url(#gf-${f.flavor.replace(/[^a-zA-Z]/g, "")})`} fillOpacity={dimmed ? 0.2 : 1} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* REGIONAL HEATMAP + SKU LEADERBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={fadeUp}>
            <GlassCard>
              <SectionTitle subtitle="Click a region to cross-filter all charts">Regional Heatmap</SectionTitle>
              {isLoading ? <Skeleton height={280} rows={6} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {regionalData.map((r) => {
                    const dimmed = filters.region !== "All" && filters.region !== r.region;
                    return (
                      <button key={r.region} onClick={() => updateFilter("region", r.region)} className={`relative rounded-xl p-4 border overflow-hidden text-left transition-all duration-300 ${filters.region === r.region ? "border-amber-500/40 ring-1 ring-amber-500/20" : dimmed ? "border-white/[0.03] opacity-40" : "border-white/[0.06] hover:border-amber-500/20"}`}>
                        <div className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(135deg, rgba(245,158,11,${r.intensity * 0.15}) 0%, rgba(245,158,11,${r.intensity * 0.04}) 100%)` }} />
                        <div className="relative">
                          <div className="text-xs text-slate-400 font-medium mb-1">{r.region}</div>
                          <div className="text-xl font-bold text-white">${r.revenue}M</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold ${r.vsPY >= 5 ? "text-emerald-400" : r.vsPY >= 0 ? "text-amber-400" : "text-rose-400"}`}>
                              {r.vsPY >= 0 ? "+" : ""}{r.vsPY}%
                            </span>
                            <span className="text-[10px] text-slate-500">{r.share}%</span>
                          </div>
                          <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.intensity * 100}%`, background: `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.amber}88)` }} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp}>
            <GlassCard>
              <SectionTitle subtitle="Top 5 SKUs by velocity score">SKU Leaderboard</SectionTitle>
              {isLoading ? <Skeleton height={280} rows={5} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <div className="space-y-3">
                  {skuData.map((s) => (
                    <div key={s.rank} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${s.rank <= 3 ? "bg-amber-500/15 text-amber-400" : "bg-white/[0.06] text-slate-400"}`}>{s.rank}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate group-hover:text-amber-50 transition-colors">{s.sku}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryPill cat={s.cat} />
                          <span className="text-xs text-slate-500">${s.revenue.toFixed(1)}M</span>
                        </div>
                      </div>
                      <div className="w-20 flex-shrink-0">
                        <div className="text-[10px] text-slate-500 text-right mb-1">Velocity</div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.velocity}%`, background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.blue})` }} />
                        </div>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${s.yoy >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {s.yoy >= 0 ? "+" : ""}{s.yoy.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* REVENUE BRIDGE */}
        <motion.div variants={fadeUp}>
          <GlassCard>
            <SectionTitle subtitle="Year-over-year revenue change decomposition ($M)">Revenue Bridge: PY → CY</SectionTitle>
            {isLoading ? <Skeleton height={320} /> : isEmpty ? <EmptyState filters={filters} /> : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={waterfallData} barSize={52}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(0)}M`} />
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (<div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl"><p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{d.name}</p><p className="text-sm font-bold text-white">{d.label}</p></div>);
                    }} cursor={false} />
                    <Bar dataKey="offset" stackId="w" fill="transparent" />
                    <Bar dataKey="height" stackId="w" radius={[6, 6, 0, 0]} animationDuration={600}>
                      {waterfallData.map((e, i) => (<Cell key={i} fill={e.type === "total" ? COLORS.cyan : e.type === "negative" ? COLORS.rose : COLORS.amber} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-around mt-1">
                  {waterfallData.map((d, i) => (<span key={i} className="text-[11px] font-semibold" style={{ color: d.type === "negative" ? COLORS.rose : d.type === "total" ? COLORS.cyan : COLORS.amber }}>{d.label}</span>))}
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* INSIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INSIGHTS.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <GlassCard className={`border-t-2 ${ins.accent} hover:border-white/15 transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${ins.iconBg} flex items-center justify-center`}><Icon size={18} className={ins.iconColor} /></div>
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
