// FILE: app/components/HomeScreen.jsx
// -------------------------------------------------
// MODIFIED - Replaced "Daily Challenge" with "Past Question Papers"
// and connected it to the new ComingSoonModal.
// -------------------------------------------------
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";
import ComingSoonModal from "./ComingSoonModal"; // Import the new modal

const FEATURE_STYLES = {
  homework: {
    bg: "from-amber-50 to-orange-100",
    iconBg: "bg-amber-200",
    text: "text-amber-800",
  },
  mastery: {
    bg: "from-blue-50 to-indigo-100",
    iconBg: "bg-blue-200",
    text: "text-blue-800",
  },
  papers: {
    // New style for Past Papers
    bg: "from-purple-50 to-pink-100",
    iconBg: "bg-purple-200",
    text: "text-purple-800",
  },
};

export default function HomeScreen({ onStartTopicMastery, onStartHomework }) {
  const [showComingSoon, setShowComingSoon] = useState(false); // New state
  const { currentStreak, stats, goatPoints, level, progress } =
    useGamification();

  const FEATURES = [
    {
      id: "homework",
      title: "Homework Help",
      subtitle: "Bring fun to homeworks again",
      icon: "🧠",
      action: () => onStartHomework(),
    },
    {
      id: "mastery",
      title: "Master a Topic",
      subtitle: "Master any topic in 5 minutes",
      icon: "✍️",
      action: () => onStartTopicMastery(),
    },
    {
      id: "papers", // Changed ID
      title: "Past Question Papers", // Changed Title
      subtitle: "Practice with official exam papers", // Changed Subtitle
      icon: "📄", // Changed Icon
      action: () => setShowComingSoon(true), // Changed Action
    },
  ];

  const ProgressRing = ({ value, size = 70 }) => {
    const stroke = 8;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#levelGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="levelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const ImmersiveHeader = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-purple-800 to-indigo-900 text-white px-5 pt-8 pb-6 w-full">
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-10 w-60 h-60 bg-amber-300/10 rounded-full"
          animate={{ y: [0, 18, 0], x: [0, -18, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.h1
          className="text-4xl font-bold tracking-tight"
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          The GOAT{" "}
          <motion.span
            className="text-amber-300"
            animate={{
              textShadow: [
                "0 0 8px rgba(252,211,77,0.6)",
                "0 0 22px rgba(252,211,77,0.85)",
                "0 0 8px rgba(252,211,77,0.6)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            AI
          </motion.span>
        </motion.h1>
        <motion.p
          className="mt-1 text-blue-100/90 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Your personal learning companion
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.45,
            type: "spring",
            stiffness: 300,
            damping: 28,
          }}
          className="mt-6 w-full max-w-xl bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ProgressRing value={progress} size={60} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-amber-200 tracking-wide">
                  LVL
                </span>
                <span className="text-lg font-extrabold -mt-0.5">{level}</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                {goatPoints.toLocaleString()} XP
              </p>
              <p className="text-[11px] text-blue-100/75 mt-1 tracking-wide">
                Keep pushing
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <motion.span
                  animate={{ scale: currentStreak ? [1, 1.18, 1] : 1 }}
                  transition={{
                    duration: 0.9,
                    repeat: currentStreak ? Infinity : 0,
                    repeatDelay: 3,
                  }}
                  className="text-2xl"
                >
                  🔥
                </motion.span>
                <span className="text-lg font-semibold text-orange-300">
                  {currentStreak}
                </span>
              </div>
              <p className="text-[10px] text-blue-100/70 mt-1 tracking-wide">
                STREAK
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-300 leading-none">
                {stats.questionsCompleted}
              </div>
              <p className="text-[10px] text-blue-100/70 mt-1 tracking-wide">
                SOLVED
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const FeatureCard = ({ feature, index }) => {
    const style = FEATURE_STYLES[feature.id] || FEATURE_STYLES.mastery;
    return (
      <motion.button
        type="button"
        onClick={feature.action}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.08,
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
        className={`w-full text-left bg-gradient-to-br ${style.bg} p-5 rounded-2xl shadow-md border border-gray-200/50 flex items-center space-x-4`}
      >
        <div
          className={`w-14 h-14 rounded-full ${style.iconBg} ${style.text} flex items-center justify-center text-3xl`}
        >
          {feature.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-base">{feature.title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{feature.subtitle}</p>
        </div>
        <div className="text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </motion.button>
    );
  };

  const FeatureList = () => (
    <div className="mt-6 px-4 space-y-4 pb-8">
      {FEATURES.map((f, i) => (
        <FeatureCard key={f.id} feature={f} index={i} />
      ))}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-2xl mx-auto flex flex-col relative bg-gray-50">
        <motion.div
          key="home-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col flex-1"
        >
          <ImmersiveHeader />
          <div className="flex-1">
            <FeatureList />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showComingSoon && (
          <ComingSoonModal onClose={() => setShowComingSoon(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
