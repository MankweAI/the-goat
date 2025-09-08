"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// These would come from a database in a real app
const BADGES = [
  {
    id: "math_novice",
    name: "Math Novice",
    icon: "🧮",
    description: "Completed 5 math problems",
    category: "math",
    level: 1,
    earned: true,
    earnedDate: "2023-09-01T12:00:00Z",
  },
  {
    id: "math_apprentice",
    name: "Math Apprentice",
    icon: "📊",
    description: "Completed 25 math problems",
    category: "math",
    level: 2,
    earned: false,
  },
  {
    id: "math_master",
    name: "Math Master",
    icon: "📐",
    description: "Completed 100 math problems",
    category: "math",
    level: 3,
    earned: false,
  },
  {
    id: "science_novice",
    name: "Science Novice",
    icon: "🧪",
    description: "Completed 5 science problems",
    category: "science",
    level: 1,
    earned: true,
    earnedDate: "2023-08-15T14:30:00Z",
  },
  {
    id: "science_apprentice",
    name: "Science Apprentice",
    icon: "🔬",
    description: "Completed 25 science problems",
    category: "science",
    level: 2,
    earned: false,
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    icon: "🏆",
    description: "Achieved perfect score in 10 quizzes",
    category: "achievement",
    level: 2,
    earned: false,
  },
  {
    id: "streak_week",
    name: "Streak Week",
    icon: "🔥",
    description: "Maintained a 7-day streak",
    category: "streak",
    level: 1,
    earned: true,
    earnedDate: "2023-09-05T18:45:00Z",
  },
  {
    id: "night_owl",
    name: "Night Owl",
    icon: "🦉",
    description: "Studied after 10 PM for 5 days",
    category: "special",
    level: 1,
    earned: true,
    earnedDate: "2023-08-30T23:15:00Z",
  },
  {
    id: "early_bird",
    name: "Early Bird",
    icon: "🐦",
    description: "Studied before 8 AM for 5 days",
    category: "special",
    level: 1,
    earned: false,
  },
];

export default function BadgeCollection({ onClose }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [filter, setFilter] = useState("all");

  const categories = ["all", "earned", "math", "science", "streak", "special"];

  const filteredBadges = BADGES.filter((badge) => {
    if (filter === "all") return true;
    if (filter === "earned") return badge.earned;
    return badge.category === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Badge Collection</h2>
            <p className="text-sm opacity-90">
              {BADGES.filter((b) => b.earned).length} of {BADGES.length} earned
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto border-b px-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-3 font-medium whitespace-nowrap ${
                filter === category
                  ? "text-pink-600 border-b-2 border-pink-500"
                  : "text-gray-500"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Badge Grid */}
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="grid grid-cols-3 gap-3">
            {filteredBadges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedBadge(badge)}
                className={`rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer border ${
                  badge.earned
                    ? "bg-gradient-to-br from-purple-50 to-pink-50 border-pink-200"
                    : "bg-gray-100 border-gray-200 opacity-50"
                }`}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <h3
                  className={`text-xs text-center font-medium ${
                    badge.earned ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {badge.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Badge Detail Modal */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl p-6 w-full max-w-xs"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`text-6xl mb-4 ${
                      !selectedBadge.earned && "grayscale opacity-50"
                    }`}
                  >
                    {selectedBadge.icon}
                  </div>
                  <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
                  <div className="mt-1 mb-3 flex items-center">
                    <div className="flex">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 mx-0.5 rounded-full ${
                            i < selectedBadge.level
                              ? "bg-purple-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      Level {selectedBadge.level}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {selectedBadge.description}
                  </p>

                  {selectedBadge.earned ? (
                    <div className="bg-green-50 text-green-700 text-sm p-2 rounded-lg w-full">
                      Earned on{" "}
                      {new Date(selectedBadge.earnedDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="bg-gray-50 text-gray-600 text-sm p-2 rounded-lg w-full">
                      Keep working to earn this badge!
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
