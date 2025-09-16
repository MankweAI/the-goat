// FILE: app/page.js
// -------------------------------------------------
// FIXED - Corrected function names and improved error handling
// Now properly handles TikTok script generation with better UX
// -------------------------------------------------
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HomeScreen from "./components/HomeScreen";
import LoadingSpinner from "./components/LoadingSpinner";

function AppContent() {
  const [screen, setScreen] = useState("home"); // "home", "loading", "preview"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedScript, setGeneratedScript] = useState(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentContentType, setCurrentContentType] = useState("");

  const handleGoHome = () => {
    setScreen("home");
    setError(null);
    setIsLoading(false);
    setGeneratedScript(null);
    setCurrentTopic("");
    setCurrentContentType("");
  };

  // FIXED: Renamed from handleGenerateScript to handleGenerateVideo to match the call
  const handleGenerateVideo = async (topic, contentType) => {
    setIsLoading(true);
    setError(null);
    setScreen("loading");
    setCurrentTopic(topic);
    setCurrentContentType(contentType);

    try {
      console.log("🚀 Starting TikTok script generation...", {
        topic,
        contentType,
      });

      // Track script generation start
      try {
        await fetch("/api/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "script_generation_started",
            properties: {
              topic,
              content_type: contentType,
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (trackingError) {
        console.warn("Failed to track script generation start:", trackingError);
      }

      // Step 1: Generate the video script
      const response = await fetch("/api/generate-tiktok-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, contentType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.error || `Failed to generate script (${response.status})`
        );
      }

      const { script } = await response.json();
      console.log("✅ Script generated successfully:", script);

      // Track successful script generation
      try {
        await fetch("/api/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "script_generated",
            properties: {
              topic,
              content_type: contentType,
              script_type: typeof script,
              success: true,
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (trackingError) {
        console.warn("Failed to track script generation:", trackingError);
      }

      setGeneratedScript(script);

      // Show preview of the generated script
      setTimeout(() => {
        const scriptPreview = formatScriptForDisplay(script, contentType);
        alert(
          `✅ TikTok Script Generated Successfully!\n\n` +
            `📖 Topic: ${topic}\n` +
            `🎬 Type: ${formatContentType(contentType)}\n\n` +
            `Script Preview:\n${scriptPreview}\n\n` +
            `Ready to create your TikTok video!`
        );
        handleGoHome();
      }, 1000);
    } catch (err) {
      console.error("❌ Script generation error:", err);

      // Track failed script generation
      try {
        await fetch("/api/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "script_generation_failed",
            properties: {
              topic,
              content_type: contentType,
              error: err.message,
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (trackingError) {
        console.warn(
          "Failed to track script generation failure:",
          trackingError
        );
      }

      setError(err.message);
      setScreen("home");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format content type for display
  const formatContentType = (type) => {
    switch (type) {
      case "topic_teaser":
        return "Topic Teaser (15s)";
      case "quick_quiz":
        return "Quick Quiz";
      case "exam_hack":
        return "Exam Hack";
      default:
        return type;
    }
  };

  // Helper function to format script for preview
  const formatScriptForDisplay = (script, contentType) => {
    if (contentType === "topic_teaser" && script.scenes) {
      return script.scenes
        .map(
          (scene, i) => `Scene ${i + 1} (${scene.duration}s): "${scene.text}"`
        )
        .join("\n");
    } else if (contentType === "quick_quiz" && script.question) {
      return `Q: ${script.question}\nA: ${script.correctAnswer}`;
    } else if (contentType === "exam_hack" && script.hook) {
      return `Hook: ${script.hook}\nHack: ${script.hack}`;
    } else {
      return JSON.stringify(script, null, 2).substring(0, 200) + "...";
    }
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-gray-600">
            Creating your TikTok script...
          </p>
        </div>
      );
    }

    return (
      <HomeScreen
        onGenerate={handleGenerateVideo} // FIXED: This now matches the function name
        isLoading={isLoading}
        error={error}
      />
    );
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="w-full max-w-sm mx-auto">
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
      </div>
    </main>
  );
}

export default function Page() {
  return <AppContent />;
}
