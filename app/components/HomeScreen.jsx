// FILE: app/components/HomeScreen.jsx
// -------------------------------------------------
// ENHANCED - Better error handling and improved UX
// -------------------------------------------------
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const CONTENT_TYPES = [
  {
    id: "topic_teaser",
    title: "Topic Teaser",
    subtitle: "15s hook to grab attention",
    icon: "🚀",
    gradient: "from-purple-400 to-pink-400",
  },
  {
    id: "quick_quiz",
    title: "Quick Quiz",
    subtitle: "Interactive question format",
    icon: "🧠",
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    id: "exam_hack",
    title: "Exam Hack",
    subtitle: "Secret tip to ace exams",
    icon: "🎓",
    gradient: "from-green-400 to-emerald-400",
  },
];

export default function HomeScreen({ onGenerate, isLoading, error }) {
  const [topic, setTopic] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleGenerateClick = (contentType) => {
    // Clear any previous errors
    setLocalError(null);

    if (!topic.trim()) {
      setLocalError("Please enter a topic first!");
      setTimeout(() => setLocalError(null), 4000);
      return;
    }

    if (topic.trim().length < 3) {
      setLocalError("Topic must be at least 3 characters long!");
      setTimeout(() => setLocalError(null), 4000);
      return;
    }

    console.log(`🎬 Generating ${contentType} for topic: "${topic}"`);
    onGenerate(topic.trim(), contentType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 flex flex-col"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            TikTok Studio
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Create viral educational content
          </p>
        </motion.div>
        <div className="flex justify-center mt-4">
          <div className="w-16 h-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"></div>
        </div>
      </div>

      {/* Topic Input */}
      <div className="mb-6">
        <label
          htmlFor="topic-input"
          className="block text-sm font-semibold text-gray-700 mb-3"
        >
          📝 What's your topic?
        </label>
        <motion.input
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          id="topic-input"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Photosynthesis, Quadratic Equations, World War 2..."
          className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-sm transition-all duration-300 bg-gray-50 focus:bg-white"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && topic.trim() && !isLoading) {
              handleGenerateClick("topic_teaser");
            }
          }}
          maxLength={100}
        />
        <div className="flex justify-between mt-1">
          <div>
            {(localError || error) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-medium text-red-500"
              >
                ⚠️ {localError || error}
              </motion.p>
            )}
          </div>
          <p className="text-xs text-gray-400">{topic.length}/100</p>
        </div>
      </div>

      {/* Content Type Selection */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-4">
          🎬 Choose your video style
        </p>
        <div className="space-y-3">
          {CONTENT_TYPES.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => handleGenerateClick(type.id)}
              disabled={isLoading || !topic.trim()}
              whileHover={
                !isLoading && topic.trim() ? { scale: 1.02, y: -2 } : {}
              }
              whileTap={!isLoading && topic.trim() ? { scale: 0.98 } : {}}
              className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 flex items-center group ${
                isLoading || !topic.trim()
                  ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200 hover:border-transparent hover:shadow-lg"
              }`}
              style={
                !isLoading && topic.trim()
                  ? {
                      background: `linear-gradient(135deg, white, white), linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                      backgroundOrigin: "border-box",
                      backgroundClip: "padding-box, border-box",
                    }
                  : {}
              }
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  type.gradient
                } flex items-center justify-center text-xl mr-4 shadow-md transition-shadow ${
                  isLoading || !topic.trim()
                    ? "opacity-50"
                    : "group-hover:shadow-lg"
                }`}
              >
                {type.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{type.title}</p>
                <p className="text-xs text-gray-500 mt-1">{type.subtitle}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                {isLoading ? (
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          ✨ Your script will be previewed before creating the video
        </p>
      </div>
    </motion.div>
  );
}
