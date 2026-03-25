import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CommandCenterHub from "../hub.jsx";
import Dashboard from "../dashboard.jsx";

export default function App() {
  const [view, setView] = useState("hub");

  return (
    <AnimatePresence mode="wait">
      {view === "hub" ? (
        <motion.div
          key="hub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <CommandCenterHub onNavigate={(route) => setView(route)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Dashboard onBack={() => setView("hub")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
