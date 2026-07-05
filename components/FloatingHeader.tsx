"use client";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

export default function FloatingHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? "rgba(5,1,15,0.6)" : "rgba(5,1,15,0)",
        borderColor: scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 border-b ${scrolled ? "backdrop-blur-xl" : "backdrop-blur-0"}`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold text-white">staro</span>
        <div className="hidden gap-8 text-sm text-white/80 md:flex">
          <a href="#features">Fonctionnalités</a>
          <a href="#pricing">Tarifs</a>
          <a href="#docs">Docs</a>
        </div>
        <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
          Essayer
        </button>
      </nav>
    </motion.header>
  );
}
