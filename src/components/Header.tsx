// src/components/Header.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 w-full z-30 bg-slate-950/70 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cyan-400">
          Nilesh.dev
        </h1>

        <div className="hidden md:flex gap-8 text-slate-300">
          <a href="#">About</a>
          <a href="#">Projects</a>
          <a href="#">Infrastructure</a>
          <a href="#">Contact</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:block px-5 py-2 rounded-xl bg-emerald-500 text-black font-semibold">
            Resume
          </button>

          <button onClick={onMenuClick} className="md:hidden">
            <Menu className="text-white" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}