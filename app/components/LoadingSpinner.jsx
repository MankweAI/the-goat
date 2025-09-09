// FILE: app/components/LoadingSpinner.jsx
// -------------------------------------------------
// ENHANCED - Now displays dynamic, encouraging messages
// instead of a static "Analyzing..." text.
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TIPS = [
  "Analyzing your question...",
  "Breaking down the core concepts...",
  "Building your personalized lesson...",
  "Hang tight, this is where the magic happens!",
  "Just a moment, your personal tutor is getting ready...",
];

export default function LoadingSpinner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % TIPS.length);
    }, 2500); // Change tip every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="mt-4 text-gray-600 h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {TIPS[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
