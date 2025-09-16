// FILE: app/components/TikTokStudioScreen.jsx
// -------------------------------------------------
// NEW - This component is the main screen for the TikTok video generator.
// It allows the user to select a content type to generate.
// -------------------------------------------------
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const CONTENT_TYPES = [
  {
    id: "topic_teaser",
    title: "Topic Teaser",
    subtitle: "A 15s intro to a topic",
    icon: "🚀",
  },
  {
    id: "quick_quiz",
    title: "Quick Quiz",
    subtitle: "A rapid-fire question",
    icon: "🧠",
  },
  {
    id: "exam_hack",
    title: "Exam Hack",
    subtitle: "Reveal a common exam trap",
    icon: "🎓",
  },
];

export default function TikTokStudioScreen({ onGenerate, onBack }) {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateClick = async (contentType) => {
    if (!topic.trim()) {
      setError("Please enter a topic first!");
      return;
    }
    setError(null);
    setIsLoading(true);
    // In a real implementation, 'onGenerate' would call the video rendering API
    console.log(
      `Generating video for topic: "${topic}" of type: "${contentType}"`
    );
    // Simulate API call
    setTimeout(() => {
      alert(
        `Video generation for "${topic}" started! The .mp4 will be downloaded shortly.`
      );
      setIsLoading(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-black"
        >
          &larr; Back
        </button>
        <h2 className="text-xl text-center font-bold">TikTok Studio 🎬</h2>
        <div className="w-16"></div>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="topic-input"
            className="text-sm font-semibold text-gray-700 mb-2 block"
          >
            1. Enter a Topic
          </label>
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis"
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/40 outline-none text-sm"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            2. Choose a Content Type
          </p>
          <div className="space-y-3">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleGenerateClick(type.id)}
                disabled={isLoading}
                className="w-full p-4 rounded-lg text-left transition-all duration-300 border-2 bg-gray-50 border-gray-200 hover:border-rose-400 hover:bg-rose-50 flex items-center disabled:opacity-50"
              >
                <span className="text-2xl mr-4">{type.icon}</span>
                <div>
                  <p className="font-bold text-gray-800">{type.title}</p>
                  <p className="text-sm text-gray-500">{type.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Generating your video... Please wait.</p>
        </div>
      )}
    </motion.div>
  );
}
