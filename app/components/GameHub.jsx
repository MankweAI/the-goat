"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";
import { useQuests } from "@/context/QuestContext";
import QuestLog from "./QuestLog";
import AchievementsScreen from "./AchievementsScreen";
import Leaderboard from "./Leaderboard";
import BadgeCollection from "./BadgeCollection";
import QuestCreator from "./QuestCreator";

export default function GameHub({ onClose }) {
  const { goatPoints, level, currentStreak, stats } = useGamification();
  const { activeQuests } = useQuests();

  const [activeScreen, setActiveScreen] = useState(null);
  const [showQuestCreator, setShowQuestCreator] = useState(false);

  const features = [
    {
      id: "quests",
      name: "Quest Log",
      icon: "📜",
      color: "from-indigo-500 to-purple-600",
      action: () => setActiveScreen("quests"),
    },
    {
      id: "achievements",
      name: "Achievements",
      icon: "🏆",
      color: "from-yellow-400 to-orange-500",
      action: () => setActiveScreen("achievements"),
    },
    {
      id: "leaderboard",
      name: "Leaderboard",
      icon: "📊",
      color: "from-blue-500 to-indigo-600",
      action: () => setActiveScreen("leaderboard"),
    },
    {
      id: "badges",
      name: "Badge Collection",
      icon: "🔰",
      color: "from-purple-500 to-pink-500",
      action: () => setActiveScreen("badges"),
    },
    {
      id: "custom",
      name: "Create Quest",
      icon: "✨",
      color: "from-emerald-500 to-teal-500",
      action: () => setShowQuestCreator(true),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 m-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="flex items-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {level}
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
              🔥
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">Game Hub</h2>
            <p className="text-gray-600">
              {goatPoints.toLocaleString()} XP • Level {level} • {currentStreak}{" "}
              Day Streak
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Level Progress</span>
            <span>
              {stats.xpToNextLevel} XP to Level {level + 1}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              style={{ width: `${stats.levelProgress}%` }}
            ></div>
          </div>
        </div>

        {activeQuests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Active Quests
            </h3>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              {activeQuests.slice(0, 2).map((quest) => (
                <div
                  key={quest.id}
                  className="flex justify-between items-center mb-2 last:mb-0"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {quest.title}
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5 mt-1">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{
                          width: `${
                            (quest.progress / quest.requirement) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-3 text-xs font-medium text-indigo-600">
                    {quest.progress}/{quest.requirement}
                  </div>
                </div>
              ))}
              {activeQuests.length > 2 && (
                <div className="text-xs text-center text-indigo-600 mt-1">
                  +{activeQuests.length - 2} more quests
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {features.map((feature) => (
            <motion.button
              key={feature.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={feature.action}
              className={`bg-gradient-to-br ${feature.color} text-white rounded-xl p-4 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow`}
            >
              <span className="text-2xl mb-2">{feature.icon}</span>
              <span className="text-sm font-medium">{feature.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {activeScreen === "quests" && (
          <QuestLog onClose={() => setActiveScreen(null)} />
        )}

        {activeScreen === "achievements" && (
          <AchievementsScreen onClose={() => setActiveScreen(null)} />
        )}

        {activeScreen === "leaderboard" && (
          <Leaderboard onClose={() => setActiveScreen(null)} />
        )}

        {activeScreen === "badges" && (
          <BadgeCollection onClose={() => setActiveScreen(null)} />
        )}

        {showQuestCreator && (
          <QuestCreator
            onClose={() => setShowQuestCreator(false)}
            lessonData={{
              title: "Custom Learning Quest",
              description: "Set your own learning objectives",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
