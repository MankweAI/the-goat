// FILE: app/page.js
// -------------------------------------------------
// REBUILT - This file has been completely simplified to support the new,
// single-purpose application: a TikTok content generator.
// MODIFIED - Now calls the new /api/generate-tiktok-script endpoint.
// -------------------------------------------------
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HomeScreen from "./components/HomeScreen";
import LoadingSpinner from "./components/LoadingSpinner";

function AppContent() {
  const [screen, setScreen] = useState("home");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoHome = () => {
    setScreen("home");
    setError(null);
    setIsLoading(false);
  };

  const handleGenerateVideo = async (topic, contentType) => {
    setIsLoading(true);
    setError(null);
    setScreen("loading");

    try {
      // Step 1: Generate the video script from our new API
      const response = await fetch("/api/generate-tiktok-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, contentType }),
      });

      if (!response.ok) {
        throw new Error(
          (await response.json()).error || "Failed to generate script."
        );
      }

      const { script } = await response.json();
      console.log("Generated Script:", script);

      // Step 2: (Coming next) Send this script to the video renderer
      alert(
        `Script generated successfully! The next step is to render this into an MP4.`
      );

      setScreen("home");
    } catch (err) {
      setError(err.message);
      setScreen("home");
    } finally {
      setIsLoading(false);
    }
  };

  const renderScreen = () => {
    if (isLoading) return <LoadingSpinner />;

    return (
      <HomeScreen
        onGenerate={handleGenerateVideo}
        isLoading={isLoading}
        error={error}
      />
    );
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
export default function Page() {
  return <AppContent />;
}
