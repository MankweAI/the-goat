"use client";
import { motion } from "framer-motion";

export default function SimTapRipple({ x, y, show }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0.5, scale: 0.9 }}
      animate={{ opacity: 0, scale: 2.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="pointer-events-none absolute rounded-full border border-gray-500/40"
      style={{ width: 48, height: 48, left: x - 24, top: y - 24 }}
    />
  );
}
