"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function TopicMasteryHome({ onStart, isLoading, error }) {
  const [topic, setTopic] = useState("");

  const submit = () => {
    const t = topic.trim();
    if (!t) return;
    onStart(t);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 flex flex-col"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Topic Mastery</h1>
        <p className="text-gray-500 text-sm mt-2">
          2-minute interactive learning
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="topic-input"
          className="block text-sm font-semibold text-gray-700 mb-3"
        >
          Topic
        </label>
        <motion.input
          initial={{ x: -6, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          id="topic-input"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Grade 11 Photosynthesis"
          className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-600 focus:ring-4 focus:ring-gray-200 outline-none text-sm transition-all duration-300 bg-gray-50 focus:bg-white"
          disabled={isLoading}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          maxLength={120}
        />
        {error && (
          <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        disabled={isLoading || !topic.trim()}
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        Start Topic Mastery
      </motion.button>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Minimal UI. All interactions are simulated.
      </p>
    </motion.div>
  );
}
