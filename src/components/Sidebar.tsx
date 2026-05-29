// src/components/Sidebar.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  "Home",
  "About",
  "Skills",
  "ML Projects",
  "Data Engineering",
  "Infrastructure",
  "Contact",
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100) onClose();
            }}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            className="fixed top-0 left-0 h-screen w-80 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 z-50 p-6"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-cyan-400">
                ML Portfolio
              </h2>

              <button onClick={onClose}>
                <X className="text-white" />
              </button>
            </div>

            <nav className="space-y-5">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-slate-300 hover:text-cyan-400 transition text-lg"
                  onClick={onClose}
                >
                  {item}
                </a>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
