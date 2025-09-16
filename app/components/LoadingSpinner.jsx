// FILE: app/components/LoadingSpinner.jsx
// -------------------------------------------------
// ENHANCED - Better loading messages for TikTok script generation
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LOADING_MESSAGES = [
  "🎬 Crafting your viral script...",
  "✍️ Writing the perfect hook...",
  "🎨 Designing video flow...",
  "⚡ Adding TikTok magic...",
  "🚀 Almost ready to go viral!",
  "🔥 Finalizing your content...",
];

export default function LoadingSpinner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center w-full max-w-sm mx-auto">
      {/* Animated TikTok-style icon */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity },
        }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 flex items-center justify-center text-2xl mb-6 shadow-lg"
      >
        🎬
      </motion.div>

      {/* Main Loading Spinner */}
      <div className="relative mb-6">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Dynamic Messages */}
      <div className="text-gray-600 h-6 mb-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="font-medium text-sm"
          >
            {LOADING_MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Creating your TikTok script...
        </p>
      </div>
    </div>
  );
}
