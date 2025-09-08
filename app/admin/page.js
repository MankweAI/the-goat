"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
let initializationError = null;
try {
  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    throw new Error(
      "Supabase URL is missing or invalid. Please check your environment variables."
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "Supabase Anon Key is missing. Please check your environment variables."
    );
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  initializationError = error.message;
}

// --- UI/UX ENHANCEMENT: Icon & Color Mapping for Metric Cards ---
const METRIC_STYLES = {
  blue: {
    bg: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-200",
    text: "text-blue-800",
  },
  green: {
    bg: "from-green-50 to-green-100",
    iconBg: "bg-green-200",
    text: "text-green-800",
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-200",
    text: "text-purple-800",
  },
  orange: {
    bg: "from-orange-50 to-orange-100",
    iconBg: "bg-orange-200",
    text: "text-orange-800",
  },
  red: {
    bg: "from-red-50 to-red-100",
    iconBg: "bg-red-200",
    text: "text-red-800",
  },
  yellow: {
    bg: "from-yellow-50 to-yellow-100",
    iconBg: "bg-yellow-200",
    text: "text-yellow-800",
  },
  pink: {
    bg: "from-pink-50 to-pink-100",
    iconBg: "bg-pink-200",
    text: "text-pink-800",
  },
  indigo: {
    bg: "from-indigo-50 to-indigo-100",
    iconBg: "bg-indigo-200",
    text: "text-indigo-800",
  },
  cyan: {
    bg: "from-cyan-50 to-cyan-100",
    iconBg: "bg-cyan-200",
    text: "text-cyan-800",
  },
  emerald: {
    bg: "from-emerald-50 to-emerald-100",
    iconBg: "bg-emerald-200",
    text: "text-emerald-800",
  },
  violet: {
    bg: "from-violet-50 to-violet-100",
    iconBg: "bg-violet-200",
    text: "text-violet-800",
  },
  amber: {
    bg: "from-amber-50 to-amber-100",
    iconBg: "bg-amber-200",
    text: "text-amber-800",
  },
};

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(initializationError);
  const [clearing, setClearing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) setError(error.message);
    else setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!initializationError) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, []);

  const handleClearEvents = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL event data? This action cannot be undone."
      )
    ) {
      setClearing(true);
      try {
        const response = await fetch("/api/clear-events", { method: "POST" });
        if (!response.ok) throw new Error("Failed to clear events.");
        await fetchEvents();
      } catch (err) {
        setError(err.message);
      } finally {
        setClearing(false);
      }
    }
  };

  const metrics = useMemo(() => {
    if (events.length === 0) return {};

    const coreActions = events.filter(
      (e) => e.event_name === "core_action_taken"
    );
    const sessionStarts = events.filter(
      (e) => e.event_name === "session_start"
    ).length;
    const gameStarts = coreActions.filter(
      (e) => e.properties.action === "game"
    ).length;
    const gameCompletions = events.filter(
      (e) => e.event_name === "game_complete"
    );
    const playAgainClicks = events.filter(
      (e) => e.event_name === "play_again_clicked"
    ).length;
    const potdCompletions = events.filter(
      (e) => e.event_name === "potd_complete"
    );

    // Gamification metrics
    const streakEvents = events.filter(
      (e) => e.event_name === "streak_updated"
    );
    const achievementUnlocks = events.filter(
      (e) => e.event_name === "achievement_unlocked"
    );

    const topQuestions = gameCompletions.reduce((acc, event) => {
      const id = event.properties?.question_id || "unknown";
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    // Daily engagement analysis
    const today = new Date().toDateString();
    const todayEvents = events.filter(
      (e) => new Date(e.created_at).toDateString() === today
    );

    return {
      // Core metrics
      sessionStarts,
      gameStarts,
      solutionRequests: coreActions.filter(
        (e) => e.properties.action === "solution"
      ).length,
      imageUploads: coreActions.filter(
        (e) => e.properties.input_type === "image"
      ).length,
      textInputs: coreActions.filter((e) => e.properties.input_type === "text")
        .length,
      conversionRate:
        sessionStarts > 0 ? ((gameStarts / sessionStarts) * 100).toFixed(1) : 0,
      packPlays: gameCompletions.filter((e) => e.properties?.pack_id).length,
      playAgainRate:
        gameCompletions.length > 0
          ? ((playAgainClicks / gameCompletions.length) * 100).toFixed(1)
          : 0,

      // Gamification metrics
      potdCompletions: potdCompletions.length,
      potdSuccessRate:
        potdCompletions.length > 0
          ? (
              (potdCompletions.filter((e) => e.properties.is_correct).length /
                potdCompletions.length) *
              100
            ).toFixed(1)
          : 0,
      achievementUnlocks: achievementUnlocks.length,
      activeStreaks: streakEvents.filter(
        (e) => e.properties?.current_streak > 0
      ).length,

      // Engagement metrics
      todayActive: todayEvents.length,
      avgSessionLength:
        sessionStarts > 0 ? (events.length / sessionStarts).toFixed(1) : 0,

      topPlayedQuestions: Object.entries(topQuestions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [events]);

  // --- UI/UX ENHANCEMENT: Revamped Metric Card ---
  const MetricCard = ({ title, value, subtitle, icon, color = "blue" }) => {
    const style = METRIC_STYLES[color] || METRIC_STYLES.blue;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${style.bg} p-6 rounded-2xl shadow-lg border border-gray-200/50 flex items-start`}
      >
        <div
          className={`w-12 h-12 rounded-full ${style.iconBg} ${style.text} flex-shrink-0 flex items-center justify-center text-2xl mr-4`}
        >
          {icon}
        </div>
        <div className="flex-grow">
          <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
          <motion.p
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-1 text-4xl font-bold text-gray-900"
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </motion.div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8 font-sans flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Configuration Error
          </h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please check your environment variables and ensure Supabase is
            properly configured.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-8"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700">
                The GOAT AI
              </span>{" "}
              Admin
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time analytics and gamification metrics
            </p>
          </div>
          <div className="group relative">
            <button
              onClick={handleClearEvents}
              disabled={clearing}
              className="bg-red-100 text-red-700 h-12 w-12 flex items-center justify-center rounded-full disabled:opacity-50 transition-colors hover:bg-red-200"
            >
              {clearing ? (
                <div className="w-5 h-5 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              )}
            </button>
            <div className="absolute top-full right-0 mt-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Clear All Events
            </div>
          </div>
        </motion.div>

        {/* Metric Sections */}
        <div className="space-y-10">
          <MetricSection title="Core Metrics">
            <MetricCard
              title="Total Sessions"
              value={metrics.sessionStarts || 0}
              icon="👥"
              color="blue"
            />
            <MetricCard
              title="Game Starts"
              value={metrics.gameStarts || 0}
              icon="🎮"
              color="green"
            />
            <MetricCard
              title="Solution Requests"
              value={metrics.solutionRequests || 0}
              icon="📚"
              color="purple"
            />
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversionRate || 0}%`}
              icon="📈"
              color="orange"
            />
          </MetricSection>

          <MetricSection title="Gamification Impact">
            <MetricCard
              title="Daily Challenges"
              value={metrics.potdCompletions || 0}
              subtitle={`${metrics.potdSuccessRate}% success`}
              icon="🔥"
              color="red"
            />
            <MetricCard
              title="Achievements Unlocked"
              value={metrics.achievementUnlocks || 0}
              icon="🏆"
              color="yellow"
            />
            <MetricCard
              title="Active Streaks"
              value={metrics.activeStreaks || 0}
              icon="⚡"
              color="pink"
            />
            <MetricCard
              title="Play Again Rate"
              value={`${metrics.playAgainRate || 0}%`}
              icon="🔄"
              color="indigo"
            />
          </MetricSection>

          <MetricSection title="User Engagement">
            <MetricCard
              title="Today's Activity"
              value={metrics.todayActive || 0}
              icon="📅"
              color="cyan"
            />
            <MetricCard
              title="Image vs Text"
              value={`${metrics.imageUploads || 0} / ${
                metrics.textInputs || 0
              }`}
              icon="📸"
              color="emerald"
            />
            <MetricCard
              title="Pack Plays"
              value={metrics.packPlays || 0}
              icon="📦"
              color="violet"
            />
            <MetricCard
              title="Avg Session Actions"
              value={metrics.avgSessionLength || 0}
              icon="⏱️"
              color="amber"
            />
          </MetricSection>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Recent Events Log
            </h2>
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="overflow-x-auto max-h-[450px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Properties
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.slice(0, 50).map((event, index) => (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {event.event_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto">
                            <code>
                              {JSON.stringify(event.properties || {}, null, 2)}
                            </code>
                          </pre>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.created_at).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Top Played Questions
            </h2>
            <div className="bg-white shadow-xl rounded-2xl p-6 space-y-4">
              {metrics.topPlayedQuestions &&
              metrics.topPlayedQuestions.length > 0 ? (
                metrics.topPlayedQuestions.map(([id, count], index) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <p
                        className="font-medium text-gray-800 truncate pr-4"
                        title={id}
                      >
                        {id}
                      </p>
                      <span className="font-bold text-blue-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (count /
                              (metrics.topPlayedQuestions[0]?.[1] || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No question data yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UI/UX ENHANCEMENT: Section Component ---
const MetricSection = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-700 mb-6">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {children}
    </div>
  </div>
);
