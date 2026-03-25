import React from "react";
import { motion } from "framer-motion";
import {
  Truck, Store, ShoppingCart, Users, Target, Factory,
  Flame, ChevronRight, Lock, Clock, Database, RefreshCw,
} from "lucide-react";

// ============ HUB DATA ============

const MODULES = [
  {
    id: "daily-shipments",
    title: "Daily Shipments",
    icon: Truck,
    route: "dashboard",
    subreports: ["Daily Shipments Report"],
    source: "DPaaS - Dynfo",
    updates: "Daily (Tuesday – Saturday)",
    lastRefreshed: "3/24/2026",
    refreshHighlight: true,
  },
  {
    id: "wholesaler-shipments",
    title: "Wholesaler Shipments",
    icon: Store,
    route: "dashboard",
    subreports: ["Wholesaler Shipments to Retailer", "Wholesaler Inventory"],
    source: "DPaaS - MSA",
    updates: "Every Wednesday",
    lastRefreshed: "3/18/2026",
  },
  {
    id: "retail-offtake",
    title: "Retail Offtake",
    icon: ShoppingCart,
    route: "dashboard",
    subreports: [
      { text: "Volume & Share" },
      { text: "OOS", highlight: "text-rose-400" },
    ],
    source: "DPaaS - Nielsen",
    updates: "Every Monday",
    lastRefreshed: "3/23/2026",
  },
  {
    id: "consumer-insights",
    title: "Consumer Insights",
    titleSuffix: "Coming Soon",
    icon: Users,
    locked: true,
    subreports: ["New, Lapsed, & Retained", "Brand Funnel"],
    source: "PMI - IPSOS LANU Panel",
    updates: "TBD",
    lastRefreshed: "N/A",
  },
  {
    id: "rgm",
    title: "RGM",
    icon: Target,
    route: "dashboard",
    subreports: ["Pricing & Promotion", "Brand Board / Price Ladder"],
    source: "DPaaS - Nielsen",
    updates: "Every Monday",
    lastRefreshed: "3/23/2026",
  },
  {
    id: "operational-efficiency",
    title: "Operational Efficiency",
    icon: Factory,
    route: "dashboard",
    subreports: [
      { text: "Warehouse Inventory" },
      { text: "Production Performance" },
      { text: "OTIF", highlight: "text-rose-400" },
    ],
    source: "Dynfo",
    updates: "Biweekly on Thursday",
    lastRefreshed: "3/12/2026",
  },
];

// ============ ANIMATION ============

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

// ============ HUB CARD ============

const HubCard = ({ module, onNavigate }) => {
  const Icon = module.icon;
  const isLocked = module.locked;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={isLocked ? {} : { y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      onClick={isLocked ? undefined : () => onNavigate(module.route)}
      className={`relative group rounded-2xl border backdrop-blur-md transition-all duration-300 ${
        isLocked
          ? "bg-slate-800/30 border-slate-700/40 opacity-60 cursor-default"
          : "bg-slate-800/50 border-slate-700 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/[0.05]"
      }`}
    >
      {/* Top accent line */}
      {!isLocked && (
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-blue-500/50 via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className="p-6">
        {/* Header row: icon + title */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isLocked ? "bg-slate-700/40" : "bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors"
            }`}>
              {isLocked ? (
                <Lock size={22} className="text-slate-500" />
              ) : (
                <Icon size={22} className="text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {module.title}
              </h3>
              {module.titleSuffix && (
                <span className="text-xs font-medium text-amber-500/80 mt-0.5 block">
                  {module.titleSuffix}
                </span>
              )}
            </div>
          </div>
          {!isLocked && (
            <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
          )}
        </div>

        {/* Sub-reports list */}
        <div className="space-y-1.5 mb-5 min-h-[60px]">
          {module.subreports.map((report, i) => {
            const text = typeof report === "string" ? report : report.text;
            const highlight = typeof report === "object" ? report.highlight : null;
            return (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-slate-600 text-xs">–</span>
                <span className={`text-sm ${highlight || "text-slate-300"}`}>{text}</span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/60 pt-3">
          {/* Metadata footer */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Database size={11} className="text-slate-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-500">
                <span className="text-slate-600">Source:</span> {module.source}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={11} className="text-slate-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-500">
                <span className="text-slate-600">Updates:</span> {module.updates}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw size={11} className="text-slate-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-500">
                <span className="text-slate-600">Last Refreshed:</span>{" "}
                <span className={module.refreshHighlight ? "text-amber-500/80" : "text-slate-500"}>
                  {module.lastRefreshed}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============ HUB PAGE ============

export default function CommandCenterHub({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Flame size={18} className="text-amber-400" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Command Center</span>
              <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">Smokeless Division</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-amber-500/20">
            VP
          </div>
        </div>
      </nav>

      {/* Hero header */}
      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Revenue Management Hub
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Your single entry point into all smokeless division data modules. Select a report suite to dive into the details.
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <motion.div
        className="max-w-[1400px] mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((mod) => (
            <HubCard key={mod.id} module={mod} onNavigate={onNavigate} />
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="max-w-[1400px] mx-auto px-6 pb-10">
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-600">
            Data refreshes automated via DPaaS pipeline
          </span>
          <span className="text-[11px] text-slate-600">
            v2.0 — Command Center
          </span>
        </div>
      </div>
    </div>
  );
}
