// FILE: app/components/ComingSoonModal.jsx
// -------------------------------------------------
// NEW - A simple modal to inform users about a feature that is coming soon.
// -------------------------------------------------
"use client";
import { motion } from "framer-motion";

export default function ComingSoonModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl"
      >
        <div className="text-5xl mb-4">🗓️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h2>
        <p className="text-gray-600 mb-6">
          Smart Past Question Papers will be available very soon. Get
          ready!
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Okay, got it!
        </button>
      </motion.div>
    </motion.div>
  );
}

