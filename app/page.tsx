"use client";

import { useState } from "react";
import UnifiedImageTool from "@/components/tools/UnifiedImageTool";
import { LandingPage } from "@/components/landing/LandingPage";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [showApp, setShowApp] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 relative">
      <AnimatePresence mode="wait">
        {!showApp ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onLaunch={() => setShowApp(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-screen overflow-hidden"
          >
            <Navbar />
            <div className="flex-1 overflow-hidden relative">
              <UnifiedImageTool />
            </div>
            <div className="md:hidden">
              <MobileNav />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
