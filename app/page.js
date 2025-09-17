// FILE: app/page.js
// PURPOSE: Main app flow (Home -> Loading -> 9:16 Preview).
// FIX: Replaces missing TopicMastery* imports and invalid /api/topic-mastery call.
// NOW: Uses HomeScreen + /api/generate-tiktok-script + TikTokVideoPreview.

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HomeScreen from "./components/HomeScreen";
import LoadingSpinner from "./components/LoadingSpinner";
import TikTokVideoPreview from "./components/TikTokVideoPreview";

export default function Page() {
  const [screen, setScreen] = useState("home"); // "home" | "loading" | "preview"
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState(null);
  const [contentType, setContentType] = useState("topic_teaser");

  // Generate a script via API (30–45s total; includes SFX/camera hints)
  const onGenerate = async (t, cType = "topic_teaser") => {
    setError(null);
    setTopic(t);
    setContentType(cType);
    setScreen("loading");
    try {
      const res = await fetch("/api/generate-tiktok-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, contentType: cType }),
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
      setScreen("preview");
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
              <HomeScreen
                onGenerate={onGenerate}
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

          {screen === "preview" && script && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <TikTokVideoPreview
                script={script}
                topic={topic}
                contentType={contentType}
                onGoBack={reset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
