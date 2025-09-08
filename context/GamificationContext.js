"use client";
import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const GamificationContext = createContext();

// Define experience points needed per level - progressive scaling
const XP_PER_LEVEL = [
  0, // Level 0 (not used)
  100, // Level 1
  250, // Level 2
  450, // Level 3
  700, // Level 4
  1000, // Level 5
  1500, // Level 6
  2200, // Level 7
  3000, // Level 8
  4000, // Level 9
  5500, // Level 10
  7500, // Level 11
  10000, // Level 12
  13000, // Level 13
  17000, // Level 14
  22000, // Level 15
];

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: "first_game",
    name: "First Steps",
    description: "Complete your first homework question",
    icon: "🎮",
    xp: 50,
    condition: (stats) => stats.questionsCompleted >= 1,
  },
  {
    id: "streak_3",
    name: "On Fire!",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    xp: 100,
    condition: (stats, streak) => streak >= 3,
  },
  {
    id: "five_questions",
    name: "High Five",
    description: "Solve 5 homework questions",
    icon: "✋",
    xp: 150,
    condition: (stats) => stats.questionsCompleted >= 5,
  },
  {
    id: "first_objective",
    name: "Topic Master",
    description: "Complete your first learning objective",
    icon: "📚",
    xp: 200,
    condition: (stats) => stats.objectivesMastered >= 1,
  },
  {
    id: "perfect_challenge",
    name: "Perfect Score",
    description: "Get a perfect score on a challenge set",
    icon: "🏆",
    xp: 200,
    condition: (stats) => stats.perfectScores >= 1,
  },
  {
    id: "daily_streak_7",
    name: "Weekly Warrior",
    description: "Maintain a 7-day streak",
    icon: "📅",
    xp: 300,
    condition: (stats, streak) => streak >= 7,
  },
  {
    id: "ten_questions",
    name: "Double Digits",
    description: "Solve 10 homework questions",
    icon: "🔟",
    xp: 250,
    condition: (stats) => stats.questionsCompleted >= 10,
  },
  {
    id: "three_objectives",
    name: "Study Champion",
    description: "Master 3 different learning objectives",
    icon: "🏅",
    xp: 350,
    condition: (stats) => stats.objectivesMastered >= 3,
  },
  {
    id: "daily_streak_14",
    name: "Fortnight Force",
    description: "Maintain a 14-day streak",
    icon: "🌟",
    xp: 500,
    condition: (stats, streak) => streak >= 14,
  },
  {
    id: "twenty_five_questions",
    name: "Quarter Century",
    description: "Solve 25 homework questions",
    icon: "💯",
    xp: 500,
    condition: (stats) => stats.questionsCompleted >= 25,
  },
];

export function GamificationProvider({ children }) {
  // --- STATE MANAGEMENT ---
  // Main player stats
  const [goatPoints, setGoatPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0); // Progress to next level (0-100)

  // Streak tracking
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState(null);

  // Achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievements, setNewAchievements] = useState([]);

  // Game stats
  const [stats, setStats] = useState({
    questionsCompleted: 0,
    objectivesMastered: 0,
    perfectScores: 0,
    potdCompleted: 0,
  });

  // Animations and celebrations
  const [pointsAnimation, setPointsAnimation] = useState({
    key: 0,
    amount: 0,
    reason: "",
  });
  const [celebrationActive, setCelebrationActive] = useState(false);

  // --- DATA PERSISTENCE ---
  // Load saved data on initial render
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Load game stats
        const savedPoints = localStorage.getItem("fundi-points");
        if (savedPoints) setGoatPoints(parseInt(savedPoints, 10));

        const savedStats = localStorage.getItem("fundi-stats");
        if (savedStats) setStats(JSON.parse(savedStats));

        const savedAchievements = localStorage.getItem("fundi-achievements");
        if (savedAchievements)
          setUnlockedAchievements(JSON.parse(savedAchievements));

        // Calculate level based on XP
        updateLevel(savedPoints ? parseInt(savedPoints, 10) : 0);

        // Handle streak logic
        const today = new Date().toDateString();
        const savedLastLogin = localStorage.getItem("fundi-last-login");
        const savedStreak = localStorage.getItem("fundi-streak");

        if (savedStreak) setCurrentStreak(parseInt(savedStreak, 10));

        if (savedLastLogin) {
          setLastLoginDate(savedLastLogin);

          const lastLogin = new Date(savedLastLogin).toDateString();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();

          if (lastLogin === today) {
            // Already logged in today, do nothing
          } else if (lastLogin === yesterdayString) {
            // Logged in yesterday, streak continues
            updateStreak(parseInt(savedStreak || "0", 10));
          } else {
            // Streak broken
            updateStreak(0);
          }
        }

        // Update last login to today
        localStorage.setItem("fundi-last-login", today);
        setLastLoginDate(today);
      } catch (err) {
        console.error("Error loading gamification data:", err);
      }
    };

    loadSavedData();
  }, []);

  // --- XP AND LEVELING ---
  // Calculate what level the user should be at based on XP
  const updateLevel = (points) => {
    // Find the highest level that the user has enough XP for
    let newLevel = 1;
    for (let i = 1; i < XP_PER_LEVEL.length; i++) {
      if (points >= XP_PER_LEVEL[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }

    // Calculate progress to next level (0-100%)
    const currentLevelXP = XP_PER_LEVEL[newLevel - 1] || 0;
    const nextLevelXP =
      XP_PER_LEVEL[newLevel] || XP_PER_LEVEL[newLevel - 1] * 1.5;
    const xpInCurrentLevel = points - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const newProgress = Math.floor(
      (xpInCurrentLevel / xpNeededForNextLevel) * 100
    );

    setLevel(newLevel);
    setProgress(newProgress);
  };

  // Add XP points with optional reason
  const addXP = (amount, reason = "") => {
    if (!amount || amount <= 0) return;

    // Save the previous level for comparison
    const prevLevel = level;

    // Update XP and save to localStorage
    const newTotal = goatPoints + amount;
    setGoatPoints(newTotal);
    localStorage.setItem("fundi-points", newTotal.toString());

    // Update level based on new XP
    updateLevel(newTotal);

    // Show animation for the points
    setPointsAnimation({
      key: Date.now(),
      amount,
      reason,
    });

    // If user leveled up, trigger a celebration
    if (level > prevLevel) {
      triggerCelebration();
    }

    // Check for newly unlocked achievements
    checkAchievements();
  };

  // --- STREAK MANAGEMENT ---
  const updateStreak = (newStreak) => {
    setCurrentStreak(newStreak);
    localStorage.setItem("fundi-streak", newStreak.toString());

    // Track streak update in analytics
    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "streak_updated",
        properties: {
          previous_streak: currentStreak,
          current_streak: newStreak,
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch(console.error);
  };

  // --- STATS MANAGEMENT ---
  const updateStats = (updater) => {
    setStats((prevStats) => {
      const newStats = {};

      // Apply the updater function to each stat
      Object.keys(prevStats).forEach((key) => {
        if (typeof updater[key] === "function") {
          newStats[key] = updater[key](prevStats[key]);
        } else if (updater[key] !== undefined) {
          newStats[key] = updater[key];
        } else {
          newStats[key] = prevStats[key];
        }
      });

      // Save the updated stats
      const updatedStats = { ...prevStats, ...newStats };
      localStorage.setItem("fundi-stats", JSON.stringify(updatedStats));

      // Check for achievements after stats update
      setTimeout(checkAchievements, 0);

      return updatedStats;
    });
  };

  // --- ACHIEVEMENTS ---
  const checkAchievements = () => {
    // Filter achievements that aren't unlocked yet
    const lockedAchievements = ACHIEVEMENTS.filter(
      (a) => !unlockedAchievements.some((ua) => ua.id === a.id)
    );

    // Check each locked achievement to see if it should be unlocked
    const newlyUnlocked = lockedAchievements.filter((achievement) => {
      return achievement.condition(stats, currentStreak);
    });

    if (newlyUnlocked.length > 0) {
      // Update unlocked achievements
      const updated = [...unlockedAchievements, ...newlyUnlocked];
      setUnlockedAchievements(updated);
      localStorage.setItem("fundi-achievements", JSON.stringify(updated));

      // Show notifications for new achievements
      setNewAchievements(newlyUnlocked);

      // Award XP for each achievement
      let totalXP = 0;
      newlyUnlocked.forEach((achievement) => {
        totalXP += achievement.xp;
      });

      if (totalXP > 0) {
        // Small delay before adding XP so the notification shows first
        setTimeout(() => {
          addXP(totalXP, "Achievement Unlocked!");
        }, 500);
      }

      // Track achievements in analytics
      newlyUnlocked.forEach((achievement) => {
        fetch("/api/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "achievement_unlocked",
            properties: {
              achievement_id: achievement.id,
              achievement_name: achievement.name,
              xp_awarded: achievement.xp,
              timestamp: new Date().toISOString(),
            },
          }),
        }).catch(console.error);
      });
    }
  };

  const dismissAchievements = () => {
    setNewAchievements([]);
  };

  // --- CELEBRATIONS ---
  const triggerCelebration = () => {
    setCelebrationActive(true);
    setTimeout(() => {
      setCelebrationActive(false);
    }, 3000);
  };

  // --- CONTEXT VALUE ---
  const value = {
    // Stats and progression
    goatPoints,
    level,
    progress,
    currentStreak,
    stats,

    // Achievements
    achievements: unlockedAchievements,
    newAchievements,
    dismissAchievements,

    // Animation states
    pointsAnimation,
    celebrationActive,

    // Actions
    addXP,
    updateStats,
    triggerCelebration,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

// Custom hook to use the gamification context
export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error(
      "useGamification must be used within a GamificationProvider"
    );
  }
  return context;
}
