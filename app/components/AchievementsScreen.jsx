"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";

export default function AchievementsScreen({ onClose }) {
  const { achievements, stats } = useGamification();
  const [activeTab, setActiveTab] = useState("all");
  const [categories] = useState([
    "all",
    "math",
    "science",
    "language",
    "special",
  ]);

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    const category = achievement.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  // Calculate overall progress
  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Achievements</h2>
            <p className="text-sm opacity-90">
              {earnedCount} of {totalCount} unlocked (
              {Math.round(progressPercent)}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto border-b px-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-3 font-medium whitespace-nowrap ${
                activeTab === category
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : "text-gray-500"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievement List */}
        <div className="p-4 overflow-y-auto flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {activeTab === "all"
                ? achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))
                : (achievementsByCategory[activeTab] || []).map(
                    (achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                      />
                    )
                  )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function AchievementCard({ achievement }) {
  const isEarned = achievement.earned;

  return (
    <div
      className={`rounded-lg p-4 border flex items-center ${
        isEarned
          ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200"
          : "bg-gray-100 border-gray-200 opacity-70"
      }`}
    >
      <div
        className={`text-3xl mr-3 ${isEarned ? "" : "grayscale opacity-50"}`}
      >
        {achievement.icon}
      </div>
      <div className="flex-1">
        <h3
          className={`font-semibold ${
            isEarned ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {achievement.name}
        </h3>
        <p className="text-xs text-gray-600">{achievement.description}</p>
        {isEarned && (
          <div className="mt-1 text-xs text-amber-600 font-medium">
            +{achievement.xp} XP
          </div>
        )}
      </div>
      {isEarned && <div className="ml-2 text-amber-500">✓</div>}
    </div>
  );
}
