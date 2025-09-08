"use client";
import { useGamification } from "@/context/GamificationContext";
import { motion, AnimatePresence } from "framer-motion";

export default function GamificationUI() {
  const {
    pointsAnimation,
    newAchievements,
    dismissAchievements,
    celebrationActive,
  } = useGamification();

  return (
    <>
      {/* Only show point animation - stats are handled by HomeScreen */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <AnimatePresence>
          {pointsAnimation.amount > 0 && (
            <motion.div
              key={pointsAnimation.key}
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.3 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-4 py-2 rounded-full shadow-lg"
            >
              +{pointsAnimation.amount} XP
              {pointsAnimation.reason && (
                <div className="text-xs opacity-80">
                  {pointsAnimation.reason}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievement notifications */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-2xl max-w-sm"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
              {newAchievements.map((achievement) => (
                <div key={achievement.id} className="mt-2">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="font-semibold">{achievement.name}</div>
                  <div className="text-sm opacity-90">
                    {achievement.description}
                  </div>
                  <div className="text-sm font-bold">+{achievement.xp} XP</div>
                </div>
              ))}
              <button
                onClick={dismissAchievements}
                className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Awesome! 🎉
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration confetti overlay */}
      <AnimatePresence>
        {celebrationActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40"
          >
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                  }}
                  animate={{
                    y: window.innerHeight + 20,
                    rotate: 360,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    delay: Math.random() * 0.5,
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: [
                      "#FFD700",
                      "#FF6B6B",
                      "#4ECDC4",
                      "#45B7D1",
                      "#96CEB4",
                    ][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
