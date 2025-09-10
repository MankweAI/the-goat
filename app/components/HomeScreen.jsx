// FILE: app/components/HomeScreen.jsx
// -------------------------------------------------
// BUG FIX & ENHANCEMENT - The time-of-day logic is now more accurate.
// The greeting emoji is now also dynamic and changes with the time.
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ComingSoonModal from "./ComingSoonModal";

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
    bg: "from-purple-50 to-pink-100",
    iconBg: "bg-purple-200",
    text: "text-purple-800",
  },
};

// Helper function with corrected time-of-day logic
const getGreeting = () => {
  const hour = new Date().getHours();

  // Morning: From 5 AM up to 12 PM (noon)
  if (hour >= 5 && hour < 12) {
    return { text: "Good morning!", emoji: "☀️" };
  }
  // Afternoon: From 12 PM (noon) up to 6 PM (18:00)
  if (hour >= 12 && hour < 18) {
    return { text: "Hey there!", emoji: "👋" };
  }
  // Evening: From 6 PM (18:00) onwards
  return { text: "Good evening!", emoji: "🌙" };
};

export default function HomeScreen({ onStartTopicMastery, onStartHomework }) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [greeting, setGreeting] = useState({ text: "Welcome!", emoji: "👋" });

  // Set the greeting on the client-side to ensure it uses the user's local time
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const FEATURES = [
    {
      id: "homework",
      title: "Homeworks & Questions",
      subtitle: "Get clear step-by-step solutions",
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
      id: "papers",
      title: "Past Question Papers",
      subtitle: "Chat with or download official exam papers",
      icon: "📄",
      action: () => setShowComingSoon(true),
    },
  ];

  const SimpleHeader = () => (
    <div className="w-full text-center p-8 bg-white border-b">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-gray-800"
      >
        {greeting.text} {greeting.emoji}
      </motion.h1>
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-2 text-gray-500"
      >
        What would you like to work on today?
      </motion.p>
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
          delay: index * 0.1 + 0.2,
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
        className={`w-full text-left bg-gradient-to-br ${style.bg} p-5 rounded-2xl shadow-md border border-gray-200/50 flex items-center space-x-4`}
      >
        <div
          className={`w-14 h-14 rounded-full ${style.iconBg} ${style.text} flex items-center justify-center text-3xl flex-shrink-0`}
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
    <div className="px-4 py-6 space-y-4">
      {FEATURES.map((f, i) => (
        <FeatureCard key={f.id} feature={f} index={i} />
      ))}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-gray-50 rounded-2xl shadow-xl overflow-hidden">
        <SimpleHeader />
        <FeatureList />
      </div>

      <AnimatePresence>
        {showComingSoon && (
          <ComingSoonModal onClose={() => setShowComingSoon(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
