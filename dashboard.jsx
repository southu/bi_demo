import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, Cell, ComposedChart, Line,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Truck, ShoppingCart, AlertTriangle, Activity, Flame,
  ChevronDown, X, SearchX, Leaf, Tag, Package, Shield,
} from "lucide-react";

// ============ CONSTANTS ============

const COLORS = {
  amber: "#F59E0B", cyan: "#06B6D4", blue: "#3B82F6",
  emerald: "#10B981", rose: "#F43F5E", slate: "#64748B", violet: "#8B5CF6",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REGIONS = ["North", "South", "East", "West"];
const FLAVORS = ["All", "Mint", "Wintergreen", "Citrus", "Coffee", "Cinnamon", "Natural"];
const STRENGTHS_OPTS = ["All", "3mg", "6mg", "9mg", "12mg"];
const CATEGORIES = ["All", "Pouch", "Snus", "Dip"];
const TIMEFRAMES = ["7D", "30D", "90D", "All"];

const FLAVOR_COLORS = { Mint: COLORS.cyan, Wintergreen: COLORS.emerald, Citrus: COLORS.blue, Coffee: COLORS.violet, Cinnamon: COLORS.rose, Natural: COLORS.amber };
const CAT_COLORS = { Pouch: COLORS.blue, Snus: COLORS.cyan, Dip: COLORS.amber };

// Metadata dates
const TODAY_STR = "3/24/2026";
const LAST_MONDAY = "3/23/2026";
const LAST_WEDNESDAY = "3/18/2026";

// ============ SEEDED PRNG ============

const mulberry32 = (a) => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

// ============ DATA GENERATOR ============

const generateOpsData = () => {
  const rand = mulberry32(42);
  const records = [];
  const flavors = ["Mint", "Wintergreen", "Citrus", "Coffee", "Cinnamon", "Natural"];
  const flavorW = [0.3, 0.3, 0.1, 0.1, 0.1, 0.1];
  const cats = ["Pouch", "Snus", "Dip"];
  const catW = [0.7, 0.2, 0.1];
  const strengths = ["3mg", "6mg", "9mg", "12mg"];
  const regionAdj = { North: 0.20, South: -0.10, East: 0.30, West: 0.10 };

  const pick = (arr, weights) => {
    const r = rand();
    let cum = 0;
    for (let i = 0; i < arr.length; i++) { cum += weights[i]; if (r < cum) return arr[i]; }
    return arr[arr.length - 1];
  };

  for (let i = 0; i < 1200; i++) {
    const dayOffset = Math.floor(rand() * 90);
    const date = new Date(2026, 0, 1 + dayOffset);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const region = REGIONS[Math.floor(rand() * 4)];
    const flavor = pick(flavors, flavorW);
    const strength = strengths[Math.floor(rand() * 4)];
    const category = pick(cats, catW);

    const baseShipments = 500 + Math.floor(rand() * 1000);
    const dailyShipments = (isWeekend && rand() > 0.2) ? 0 : baseShipments;
    const offtakeNoise = 0.85 + rand() * 0.30;
    const retailOfftake = Math.round(baseShipments * offtakeNoise);

    const otifScore = rand() < 0.9 ? 94 + rand() * 5 : 85 + rand() * 5;
    let oosRate = 1.5 + rand() * 1.5;
    if (retailOfftake > dailyShipments * 1.2 && dailyShipments > 0) oosRate = 8 + rand() * 7;
    if (dailyShipments === 0) oosRate = 5 + rand() * 10;

    let price = category === "Pouch" ? (["3mg", "6mg"].includes(strength) ? 4.99 : 5.49)
      : category === "Snus" ? 5.99
      : (["3mg", "6mg"].includes(strength) ? 3.99 : 4.49);
    price += regionAdj[region] + (rand() - 0.5) * 0.4;
    if (rand() > 0.85) price -= 1.0;

    const m = date.getMonth();
    const d = date.getDate();
    records.push({
      date: `2026-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      month: m, day: d, dayOfWeek: date.getDay(),
      region, category, flavor, nicotineStrength: strength,
      dailyShipments, retailOfftake,
      wholesalerInventory: Math.round(retailOfftake * (2 + rand() * 3)),
      oosRate: +oosRate.toFixed(2), otifScore: +otifScore.toFixed(2),
      pricePoint: +Math.max(price, 2.49).toFixed(2),
    });
  }
  return records.sort((a, b) => a.date.localeCompare(b.date));
};

const OPS_RECORDS = generateOpsData();

// ============ UTILITY FUNCTIONS ============

const calculateInventoryHealth = (shipments, offtake) => {
  if (offtake === 0) return 0;
  return ((shipments - offtake) / offtake) * 100;
};

const getHealthColor = (gap) => {
  if (gap < -10) return "rose";
  if (gap > 20) return "amber";
  return "emerald";
};

const formatK = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
};

const groupByKey = (data, key, valField) => {
  const m = {};
  data.forEach((r) => {
    const k = r[key];
    if (!m[k]) m[k] = { key: k, value: 0, count: 0 };
    m[k].value += r[valField] || 0;
    m[k].count += 1;
  });
  return Object.values(m);
};

// ============ useOpsData HOOK ============

const DEFAULT_FILTERS = { timeframe: "30D", nicotineStrength: "All", flavor: "All", region: "All", category: "All" };

const useOpsData = (filters) => {
  const filtered = useMemo(() => {
    let d = OPS_RECORDS;
    if (filters.timeframe !== "All") {
      const cutoff = { "7D": 7, "30D": 30, "90D": 90 }[filters.timeframe] || 90;
      const dates = [...new Set(d.map((r) => r.date))].sort();
      const recentDates = new Set(dates.slice(-cutoff));
      d = d.filter((r) => recentDates.has(r.date));
    }
    if (filters.nicotineStrength !== "All") d = d.filter((r) => r.nicotineStrength === filters.nicotineStrength);
    if (filters.flavor !== "All") d = d.filter((r) => r.flavor === filters.flavor);
    if (filters.region !== "All") d = d.filter((r) => r.region === filters.region);
    if (filters.category !== "All") d = d.filter((r) => r.category === filters.category);
    return d;
  }, [filters]);

  const isEmpty = filtered.length === 0;

  // KPIs
  const kpis = useMemo(() => {
    if (isEmpty) return null;
    const totalShip = filtered.reduce((s, r) => s + r.dailyShipments, 0);
    const totalOff = filtered.reduce((s, r) => s + r.retailOfftake, 0);
    const avgOos = filtered.reduce((s, r) => s + r.oosRate, 0) / filtered.length;
    const avgOtif = filtered.reduce((s, r) => s + r.otifScore, 0) / filtered.length;
    const gap = calculateInventoryHealth(totalShip, totalOff);
    const dates = [...new Set(filtered.map((r) => r.date))].sort().slice(-7);
    const sparkShip = dates.map((dt) => filtered.filter((r) => r.date === dt).reduce((s, r) => s + r.dailyShipments, 0));
    const sparkOff = dates.map((dt) => filtered.filter((r) => r.date === dt).reduce((s, r) => s + r.retailOfftake, 0));
    const sparkOos = dates.map((dt) => { const recs = filtered.filter((r) => r.date === dt); return recs.length ? recs.reduce((s, r) => s + r.oosRate, 0) / recs.length : 0; });
    const sparkOtif = dates.map((dt) => { const recs = filtered.filter((r) => r.date === dt); return recs.length ? recs.reduce((s, r) => s + r.otifScore, 0) / recs.length : 0; });
    return { totalShip, totalOff, avgOos, avgOtif, gap, sparkShip, sparkOff, sparkOos, sparkOtif };
  }, [filtered, isEmpty]);

  // Pipeline (daily, last 30 unique dates)
  const pipelineData = useMemo(() => {
    const dates = [...new Set(filtered.map((r) => r.date))].sort().slice(-30);
    return dates.map((dt) => {
      const recs = filtered.filter((r) => r.date === dt);
      return { date: dt.slice(5), shipments: recs.reduce((s, r) => s + r.dailyShipments, 0), offtake: recs.reduce((s, r) => s + r.retailOfftake, 0) };
    });
  }, [filtered]);

  // Category trend (monthly)
  const categoryTrend = useMemo(() => {
    const months = [...new Set(filtered.map((r) => r.month))].sort((a, b) => a - b);
    return months.map((m) => {
      const mr = filtered.filter((r) => r.month === m);
      return { month: MONTH_LABELS[m], Pouch: mr.filter((r) => r.category === "Pouch").reduce((s, r) => s + r.retailOfftake, 0), Snus: mr.filter((r) => r.category === "Snus").reduce((s, r) => s + r.retailOfftake, 0), Dip: mr.filter((r) => r.category === "Dip").reduce((s, r) => s + r.retailOfftake, 0) };
    });
  }, [filtered]);

  // Flavor velocity
  const flavorData = useMemo(() => groupByKey(filtered, "flavor", "retailOfftake").sort((a, b) => b.value - a.value), [filtered]);

  // RGM scatter
  const scatterData = useMemo(() => {
    const groups = {};
    const total = filtered.reduce((s, r) => s + r.retailOfftake, 0) || 1;
    filtered.forEach((r) => {
      const k = `${r.flavor} ${r.nicotineStrength}`;
      if (!groups[k]) groups[k] = { name: k, flavor: r.flavor, str: r.nicotineStrength, cat: r.category, off: 0, price: 0, cnt: 0, oos: 0 };
      groups[k].off += r.retailOfftake; groups[k].price += r.pricePoint; groups[k].cnt++; groups[k].oos += r.oosRate;
    });
    return Object.values(groups).map((g) => ({
      name: g.name, flavor: g.flavor,
      price: +(g.price / g.cnt).toFixed(2),
      volumeShare: +((g.off / total) * 100).toFixed(1),
      volume: g.off,
      avgOos: +(g.oos / g.cnt).toFixed(1),
      sensitive: (g.price / g.cnt > 5.2) && (g.off / total) * 100 < 4,
    }));
  }, [filtered]);

  // Regional inventory
  const regionalData = useMemo(() => {
    const groups = {};
    filtered.forEach((r) => {
      if (!groups[r.region]) groups[r.region] = { region: r.region, inv: 0, ship: 0, off: 0, oosSum: 0, cnt: 0 };
      groups[r.region].inv += r.wholesalerInventory; groups[r.region].ship += r.dailyShipments;
      groups[r.region].off += r.retailOfftake; groups[r.region].oosSum += r.oosRate; groups[r.region].cnt++;
    });
    const data = Object.values(groups).sort((a, b) => b.inv - a.inv);
    const maxInv = Math.max(...data.map((d) => d.inv), 1);
    return data.map((d) => ({
      region: d.region, inventory: d.inv, daysOnHand: d.off > 0 ? +((d.inv / d.off) * 7).toFixed(1) : 0,
      gap: calculateInventoryHealth(d.ship, d.off), intensity: d.inv / maxInv, avgOos: d.cnt > 0 ? +(d.oosSum / d.cnt).toFixed(1) : 0,
    }));
  }, [filtered]);

  // Status summary
  const statusSummary = useMemo(() => {
    if (isEmpty || !kpis) return { level: "neutral", message: "No data for current filters." };
    const worstRegion = regionalData.reduce((w, r) => (r.gap < w.gap ? r : w), { region: "—", gap: 0 });
    const worstOosFlav = scatterData.reduce((w, s) => (s.avgOos > w.avgOos ? s : w), { name: "—", avgOos: 0 });
    if (kpis.avgOos > 7) return { level: "critical", message: `Critical: Average OOS at ${kpis.avgOos.toFixed(1)}%. Highest risk: ${worstOosFlav.name} (${worstOosFlav.avgOos.toFixed(1)}%). ${worstRegion.gap < -10 ? `${worstRegion.region} demand outpacing supply by ${Math.abs(worstRegion.gap).toFixed(0)}%.` : ""}` };
    if (kpis.avgOos > 5 || Math.abs(kpis.gap) > 15) return { level: "caution", message: `Caution: Retail Offtake ${kpis.gap < 0 ? "outpacing" : "trailing"} Shipments (${kpis.gap > 0 ? "+" : ""}${kpis.gap.toFixed(1)}% gap).${kpis.avgOos > 5 ? ` OOS elevated at ${kpis.avgOos.toFixed(1)}%.` : ""} ${worstOosFlav.avgOos > 7 ? `Watch: ${worstOosFlav.name}.` : ""}` };
    return { level: "healthy", message: "All systems nominal. Supply chain metrics within acceptable ranges across all regions." };
  }, [isEmpty, kpis, regionalData, scatterData]);

  return { isEmpty, kpis, pipelineData, categoryTrend, flavorData, scatterData, regionalData, statusSummary };
};

// ============ ANIMATION ============

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

// ============ SUB-COMPONENTS ============

const Sparkline = ({ data, color = COLORS.amber }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 76 + 2},${28 - ((v - min) / range) * 24 - 2}`).join(" ");
  return (<svg width="80" height="28" className="flex-shrink-0"><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
};

const Pulse = ({ color = "bg-emerald-500" }) => (
  <span className="relative flex h-2 w-2">
    <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />
    <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
  </span>
);

const DarkTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 shadow-2xl">
      <p className="text-xs uppercase tracking-wider text-white/50 mb-2">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: e.color || e.stroke }}>
          {e.name}: {formatter ? formatter(e.value, e.name) : e.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-[rgba(30,41,59,0.7)] backdrop-blur-md border border-white/10 rounded-lg p-6 ${className}`}>{children}</div>
);

const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-4"><h2 className="text-xl font-semibold text-white">{children}</h2>{subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}</div>
);

const ChartMeta = ({ source, refreshed }) => (
  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-700/40">
    <span className="text-xs text-slate-400">Source: {source}</span>
    <span className="text-xs text-slate-600">|</span>
    <span className="text-xs text-slate-400">Last Refreshed: <span className="text-amber-400/80">{refreshed}</span></span>
  </div>
);

const FilterDropdown = ({ label, options, value, onChange }) => (
  <div>
    <div className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-medium">{label}</div>
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/[0.05] border border-white/[0.08] rounded-md text-sm text-slate-300 pl-3 pr-8 py-2 appearance-none cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/30">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  </div>
);

const Skeleton = ({ height = 300, rows = 0 }) => (
  <div className="animate-pulse space-y-3" style={{ minHeight: height }}>
    <div className="h-4 w-1/3 bg-white/[0.06] rounded" /><div className="h-3 w-1/5 bg-white/[0.04] rounded" />
    {rows > 0 ? <div className="space-y-2 pt-2">{Array.from({ length: rows }, (_, i) => <div key={i} className="h-10 bg-white/[0.03] rounded-lg" style={{ opacity: 1 - i * 0.12 }} />)}</div> : <div className="flex-1 bg-white/[0.03] rounded-xl" style={{ height: height - 40 }} />}
  </div>
);

const EmptyState = ({ filters }) => {
  const active = Object.entries(filters).filter(([k, v]) => v !== "All" && k !== "timeframe").map(([, v]) => v);
  return (<div className="flex flex-col items-center justify-center py-16 text-center"><div className="w-14 h-14 rounded-lg bg-slate-800/50 flex items-center justify-center mb-4"><SearchX size={24} className="text-slate-600" /></div><p className="text-sm font-medium text-slate-400 mb-1">No matching records</p><p className="text-xs text-slate-600 max-w-[260px]">{active.length > 0 ? `No data for ${active.join(" + ")}.` : "Adjust your filters."}</p></div>);
};

const INSIGHTS = [
  { icon: AlertTriangle, title: "OOS Alert", text: "Mint 6mg Pouch OOS rate spiking to 12.3% in North region. Recommend emergency shipment allocation to top 15 high-velocity doors.", accent: "border-t-rose-500", iconColor: "text-rose-400", iconBg: "bg-rose-500/10" },
  { icon: Shield, title: "Pipeline Efficiency", text: "Warehouse-to-shelf velocity improved 8% this quarter. OTIF scores trending above 96% in South and East regions.", accent: "border-t-emerald-500", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  { icon: Tag, title: "RGM Opportunity", text: "Price elasticity data shows headroom for $0.30 increase on Premium Pouch SKUs in East region without material volume decline.", accent: "border-t-amber-500", iconColor: "text-amber-400", iconBg: "bg-amber-500/10" },
];

// ============ MAIN DASHBOARD ============

export default function Dashboard() {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [isLoading, setIsLoading] = useState(false);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value && key !== "timeframe" ? "All" : value }));
    setIsLoading(true);
  }, []);

  const clearFilters = useCallback(() => { setFilters({ ...DEFAULT_FILTERS }); setIsLoading(true); }, []);

  useEffect(() => { if (isLoading) { const t = setTimeout(() => setIsLoading(false), 500); return () => clearTimeout(t); } }, [isLoading]);

  const activePills = Object.entries(filters).filter(([k, v]) => v !== "All" && k !== "timeframe").map(([k, v]) => ({ key: k, value: v }));
  const { isEmpty, kpis, pipelineData, categoryTrend, flavorData, scatterData, regionalData, statusSummary } = useOpsData(filters);

  const statusColors = { healthy: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500" }, caution: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-500" }, critical: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", dot: "bg-rose-500" }, neutral: { bg: "bg-slate-500/10", border: "border-slate-500/20", text: "text-slate-400", dot: "bg-slate-500" } };
  const sc = statusColors[statusSummary.level];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-y-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center"><Flame size={18} className="text-amber-400" /></div>
            <span className="text-base font-bold text-white tracking-tight">Revenue Command Center</span>
            <span className="text-xs text-slate-500 ml-2 hidden sm:inline">Smokeless Division</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-amber-500/20">VP</div>
        </div>
      </nav>

      {/* FILTER BAR */}
      <div className="sticky top-[57px] z-40 bg-slate-900/50 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-end gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-medium">Timeframe</div>
            <div className="flex gap-2">{TIMEFRAMES.map((t) => (
              <button key={t} onClick={() => updateFilter("timeframe", t)} className={`px-4 py-2 text-xs rounded-md transition-all duration-300 ${filters.timeframe === t ? "bg-cyan-500/15 text-cyan-400 font-semibold ring-1 ring-cyan-500/30" : "bg-white/[0.05] text-white/40 font-medium hover:text-white/60 hover:bg-white/[0.08]"}`}>{t}</button>
            ))}</div>
          </div>
          <FilterDropdown label="Strength" options={STRENGTHS_OPTS} value={filters.nicotineStrength} onChange={(v) => updateFilter("nicotineStrength", v)} />
          <FilterDropdown label="Flavor" options={FLAVORS} value={filters.flavor} onChange={(v) => updateFilter("flavor", v)} />
          <FilterDropdown label="Region" options={["All", ...REGIONS]} value={filters.region} onChange={(v) => updateFilter("region", v)} />
          <FilterDropdown label="Category" options={CATEGORIES} value={filters.category} onChange={(v) => updateFilter("category", v)} />
          <AnimatePresence>{activePills.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2 pb-0.5">
              {activePills.map((p) => (<button key={p.key} onClick={() => updateFilter(p.key, "All")} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">{p.value} <X size={10} /></button>))}
              <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-white transition-colors ml-2 underline underline-offset-2">Clear all</button>
            </motion.div>
          )}</AnimatePresence>
        </div>
      </div>

      {/* CONTENT */}
      <motion.div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto relative" variants={containerVariants} initial="hidden" animate="visible">

        {/* STATUS BANNER */}
        <motion.div variants={fadeUp}>
          <div className={`${sc.bg} ${sc.border} border rounded-lg px-4 py-3 flex items-center gap-3`}>
            <Pulse color={sc.dot} />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Overall Status: {statusSummary.level}</span>
            <span className="text-sm text-slate-300 ml-2">{statusSummary.message}</span>
          </div>
        </motion.div>

        {/* KPI ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading || !kpis ? Array.from({ length: 4 }, (_, i) => <motion.div key={i} variants={fadeUp}><GlassCard><Skeleton height={100} /></GlassCard></motion.div>) : [
            { label: "Shipment Volume", value: formatK(kpis.totalShip), spark: kpis.sparkShip, icon: Truck, color: COLORS.amber, badge: null, alert: false },
            { label: "Retail Offtake", value: formatK(kpis.totalOff), spark: kpis.sparkOff, icon: ShoppingCart, color: COLORS.cyan, badge: { text: `${kpis.gap > 0 ? "+" : ""}${kpis.gap.toFixed(1)}% vs Ship`, color: getHealthColor(kpis.gap) }, alert: false },
            { label: "OOS Rate", value: `${kpis.avgOos.toFixed(1)}%`, spark: kpis.sparkOos, icon: AlertTriangle, color: kpis.avgOos > 5 ? COLORS.rose : COLORS.emerald, badge: null, alert: kpis.avgOos > 5 },
            { label: "OTIF Score", value: `${kpis.avgOtif.toFixed(1)}%`, spark: kpis.sparkOtif, icon: Activity, color: kpis.avgOtif >= 95 ? COLORS.emerald : kpis.avgOtif >= 92 ? COLORS.amber : COLORS.rose, badge: kpis.avgOtif < 92 ? { text: "Supply Chain Delay", color: "rose" } : null, alert: false },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            const alertStyle = kpi.alert ? "bg-red-950/30 border-rose-500/30" : "";
            return (
              <motion.div key={idx} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <GlassCard className={`relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300 ${alertStyle}`}>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${kpi.color}99, ${kpi.color}33, transparent)` }} />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}18` }}>
                        <Icon size={18} style={{ color: kpi.color }} />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">{kpi.label}</div>
                        {kpi.alert && <div className="flex items-center gap-2 mt-0.5"><Pulse color="bg-rose-500" /><span className="text-xs text-rose-400 font-medium uppercase tracking-wider">High</span></div>}
                      </div>
                    </div>
                    <Sparkline data={kpi.spark} color={kpi.color} />
                  </div>
                  <div className="text-3xl font-bold tracking-tight" style={kpi.alert ? { color: COLORS.rose } : {}}>{kpi.value}</div>
                  {kpi.badge && (
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-0.5 rounded-full mt-2 ${kpi.badge.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : kpi.badge.color === "amber" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {kpi.badge.text}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* PIPELINE + CATEGORY TRANSITION */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <GlassCard>
              <SectionTitle subtitle="Shipments (bars) vs Retail Offtake (line) — gap reveals inventory risk">Supply vs. Demand Pipeline</SectionTitle>
              {isLoading ? <Skeleton height={320} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={pipelineData}>
                    <defs>
                      <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.6} /><stop offset="100%" stopColor={COLORS.amber} stopOpacity={0.1} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} interval={Math.max(0, Math.floor(pipelineData.length / 8))} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => formatK(v)} />
                    <Tooltip content={<DarkTooltip formatter={(v) => formatK(v)} />} />
                    <Bar dataKey="shipments" name="Shipments" fill="url(#gShip)" radius={[3, 3, 0, 0]} barSize={12} animationDuration={600} />
                    <Line type="monotone" dataKey="offtake" name="Offtake" stroke={COLORS.cyan} strokeWidth={2.5} dot={false} animationDuration={600} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              <ChartMeta source="DPaaS - Dynfo" refreshed={`${TODAY_STR} at 6:00 AM`} />
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-2">
            <GlassCard>
              <SectionTitle subtitle="Monthly offtake by product category">Category Transition</SectionTitle>
              {isLoading ? <Skeleton height={320} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <>
                  <ResponsiveContainer width="100%" height={290}>
                    <AreaChart data={categoryTrend}>
                      <defs>
                        {Object.entries(CAT_COLORS).map(([cat, color]) => (
                          <linearGradient key={cat} id={`gc-${cat}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.25} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => formatK(v)} />
                      <Tooltip content={<DarkTooltip formatter={(v) => formatK(v)} />} />
                      {["Dip", "Snus", "Pouch"].map((cat) => {
                        const dimmed = filters.category !== "All" && filters.category !== cat;
                        return <Area key={cat} type="monotone" dataKey={cat} stackId="1" stroke={CAT_COLORS[cat]} strokeWidth={dimmed ? 1 : 2} strokeOpacity={dimmed ? 0.2 : 1} fill={`url(#gc-${cat})`} fillOpacity={dimmed ? 0.05 : 1} animationDuration={600} />;
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 ml-1">{Object.entries(CAT_COLORS).map(([cat, color]) => (
                    <button key={cat} onClick={() => updateFilter("category", cat)} className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${filters.category === cat ? "bg-white/[0.06] ring-1 ring-white/10" : "hover:bg-white/[0.03]"}`}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, opacity: filters.category !== "All" && filters.category !== cat ? 0.3 : 1 }} />
                      <span className={`text-xs ${filters.category !== "All" && filters.category !== cat ? "text-slate-600" : "text-slate-400"}`}>{cat}</span>
                    </button>
                  ))}</div>
                </>
              )}
              <ChartMeta source="DPaaS - Nielsen" refreshed={LAST_MONDAY} />
            </GlassCard>
          </motion.div>
        </div>

        {/* FLAVOR VELOCITY + RGM SCATTER */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <GlassCard>
              <SectionTitle subtitle="Consumer offtake by flavor — click to cross-filter">Flavor Mix</SectionTitle>
              {isLoading ? <Skeleton height={320} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <ResponsiveContainer width="100%" height={Math.max(280, flavorData.length * 50)}>
                  <BarChart data={flavorData} layout="vertical" barSize={20}>
                    <defs>{flavorData.map((f) => (
                      <linearGradient key={f.key} id={`gfl-${f.key}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={FLAVOR_COLORS[f.key] || COLORS.slate} stopOpacity={0.9} /><stop offset="100%" stopColor={FLAVOR_COLORS[f.key] || COLORS.slate} stopOpacity={0.35} /></linearGradient>
                    ))}</defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => formatK(v)} />
                    <YAxis type="category" dataKey="key" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }} width={100} />
                    <Tooltip content={<DarkTooltip formatter={(v) => formatK(v)} />} cursor={false} />
                    <Bar dataKey="value" name="Offtake" radius={[0, 8, 8, 0]} onClick={(d) => updateFilter("flavor", d.key)} style={{ cursor: "pointer" }} animationDuration={600}>
                      {flavorData.map((f) => {
                        const dimmed = filters.flavor !== "All" && filters.flavor !== f.key;
                        return <Cell key={f.key} fill={`url(#gfl-${f.key})`} fillOpacity={dimmed ? 0.2 : 1} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <ChartMeta source="DPaaS - Nielsen" refreshed={LAST_MONDAY} />
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-3">
            <GlassCard>
              <SectionTitle subtitle="Each dot = flavor × strength combo. Size = volume. Red border = price sensitive">RGM Price Ladder</SectionTitle>
              {isLoading ? <Skeleton height={320} /> : isEmpty ? <EmptyState filters={filters} /> : (
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" dataKey="price" name="Avg Price" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(2)}`} domain={["auto", "auto"]} />
                    <YAxis type="number" dataKey="volumeShare" name="Vol Share" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <ZAxis type="number" dataKey="volume" range={[40, 500]} />
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 shadow-2xl">
                          <p className="text-sm font-bold text-white mb-1">{d.name}</p>
                          <p className="text-xs text-slate-400">Avg Price: <span className="text-white">${d.price}</span></p>
                          <p className="text-xs text-slate-400">Volume Share: <span className="text-white">{d.volumeShare}%</span></p>
                          <p className="text-xs text-slate-400">Avg OOS: <span className={d.avgOos > 7 ? "text-rose-400" : "text-white"}>{d.avgOos}%</span></p>
                          {d.sensitive && <p className="text-xs text-amber-400 font-semibold mt-1">⚠ Price Sensitive</p>}
                        </div>
                      );
                    }} />
                    <Scatter data={scatterData} animationDuration={600}>
                      {scatterData.map((d, i) => (
                        <Cell key={i} fill={FLAVOR_COLORS[d.flavor] || COLORS.slate} fillOpacity={0.75} stroke={d.sensitive ? COLORS.rose : "transparent"} strokeWidth={d.sensitive ? 2 : 0} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
              <ChartMeta source="DPaaS - Nielsen" refreshed={LAST_MONDAY} />
            </GlassCard>
          </motion.div>
        </div>

        {/* REGIONAL INVENTORY */}
        <motion.div variants={fadeUp}>
          <GlassCard>
            <SectionTitle subtitle="Warehouse inventory by region — amber = low days-on-hand">Regional Inventory Levels</SectionTitle>
            {isLoading ? <Skeleton height={220} rows={4} /> : isEmpty ? <EmptyState filters={filters} /> : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {regionalData.map((r) => {
                  const gapColor = getHealthColor(r.gap);
                  const lowStock = r.daysOnHand < 10;
                  return (
                    <button key={r.region} onClick={() => updateFilter("region", r.region)} className={`relative text-left rounded-lg p-4 border overflow-hidden transition-all duration-300 ${filters.region === r.region ? "border-amber-500/40 ring-1 ring-amber-500/20" : lowStock ? "border-amber-500/25" : "border-white/[0.06] hover:border-white/15"}`}>
                      <div className="absolute inset-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${lowStock ? "rgba(245,158,11,0.08)" : "rgba(6,182,212,0.04)"} 0%, transparent 100%)` }} />
                      <div className="relative">
                        <div className="text-xs text-slate-400 font-medium mb-1">{r.region}</div>
                        <div className="text-xl font-bold text-white">{formatK(r.inventory)}</div>
                        <div className="text-xs text-slate-500 mt-1">{r.daysOnHand} days on hand</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`text-xs font-semibold px-2 py-0.5 rounded-md ${gapColor === "emerald" ? "bg-emerald-500/10 text-emerald-400" : gapColor === "amber" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                            Gap: {r.gap > 0 ? "+" : ""}{r.gap.toFixed(1)}%
                          </div>
                          {r.avgOos > 7 && <span className="text-xs text-rose-400 font-semibold flex items-center gap-1"><Pulse color="bg-rose-500" /> OOS</span>}
                          {lowStock && <span className="text-xs text-amber-400 font-semibold">Low Stock</span>}
                        </div>
                        <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.intensity * 100}%`, background: lowStock ? `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.amber}66)` : `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.blue}88)` }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <ChartMeta source="Dynfo" refreshed={`${TODAY_STR} at 6:00 AM`} />
          </GlassCard>
        </motion.div>

        {/* INSIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INSIGHTS.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <GlassCard className={`border-t-2 ${ins.accent} hover:border-white/15 transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 rounded-xl ${ins.iconBg} flex items-center justify-center`}><Icon size={18} className={ins.iconColor} /></div><h3 className="text-sm font-bold text-white">{ins.title}</h3></div>
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
