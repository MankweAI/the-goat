"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import TopicMasteryHome from "./components/TopicMasteryHome";
import LoadingSpinner from "./components/LoadingSpinner";
import TopicMasteryRunner from "./components/TopicMasteryRunner";

export default function Page() {
  const [screen, setScreen] = useState("home"); // home | loading | runner
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState(null);

  const start = async (t) => {
    setError(null);
    setTopic(t);
    setScreen("loading");
    try {
      const res = await fetch("/api/topic-mastery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      if (!res.ok) {
        let msg = "Generation failed.";
        try {
          const err = await res.json();
          msg = err.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      setScript(data.script);
      setScreen("runner");
    } catch (e) {
      setError(e.message);
      setScreen("home");
    }
  };

  const reset = () => {
    setScreen("home");
    setError(null);
    setTopic("");
    setScript(null);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {screen === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <TopicMasteryHome
                onStart={start}
                isLoading={false}
                error={error}
              />
            </motion.div>
          )}

          {screen === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <LoadingSpinner />
              </div>
            </motion.div>
          )}

          {screen === "runner" && script && (
            <motion.div
              key="runner"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <TopicMasteryRunner
                topic={topic}
                script={script}
                onDone={reset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
