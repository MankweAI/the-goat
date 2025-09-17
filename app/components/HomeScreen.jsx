// FILE: app/components/HomeScreen.jsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function HomeScreen({ onGenerate, isLoading, error }) {
  const [topic, setTopic] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleGenerateClick = (contentType) => {
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Here you would implement the OCR logic.
    // For now, we'll just log a message to the console.
    console.log("Image uploaded:", file.name);
    setTopic(`Text extracted from ${file.name}`);
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

      {/* Input Options */}
      <div className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="topic-input"
            className="block text-sm font-semibold text-gray-700 mb-3"
          >
            📝 Enter your text
          </label>
          <motion.textarea
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods..."
            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-sm transition-all duration-300 bg-gray-50 focus:bg-white"
            disabled={isLoading}
            rows="5"
            maxLength={1000}
          />
        </div>
        <div className="text-center text-gray-500 text-sm my-4">OR</div>
        <div>
          <label
            htmlFor="image-upload"
            className="block text-sm font-semibold text-gray-700 mb-3"
          >
            📷 Upload an image
          </label>
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
              disabled={isLoading}
            />
          </motion.div>
        </div>
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
          <p className="text-xs text-gray-400">{topic.length}/1000</p>
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleGenerateClick("topic_teaser")}
        disabled={isLoading || !topic.trim()}
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        Generate Video
      </motion.button>
    </motion.div>
  );
}
