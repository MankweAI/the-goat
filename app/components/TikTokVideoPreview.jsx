// FILE: app/components/TikTokVideoPreview.jsx
// -------------------------------------------------
// NEW - Interactive TikTok video simulator that plays through scenes
// This shows exactly how the final video will look and feel
// -------------------------------------------------
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TikTokVideoPreview({
  script,
  topic,
  contentType,
  onCreateVideo,
  onGoBack,
  error,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Calculate total duration
  const totalDuration =
    script.scenes?.reduce((sum, scene) => sum + scene.duration, 0) || 15;

  // Start/Stop video preview
  const togglePlayback = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const playVideo = () => {
    if (currentScene >= (script.scenes?.length || 0)) {
      resetVideo();
    }
    setIsPlaying(true);
    playCurrentScene();
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const resetVideo = () => {
    pauseVideo();
    setCurrentScene(0);
    setProgress(0);
    setTimeRemaining(totalDuration);
  };

  const playCurrentScene = () => {
    if (!script.scenes || currentScene >= script.scenes.length) {
      // Video finished
      setIsPlaying(false);
      return;
    }

    const scene = script.scenes[currentScene];
    const sceneDuration = scene.duration * 1000; // Convert to milliseconds

    // Update progress bar
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const sceneProgress = Math.min(elapsed / sceneDuration, 1);

      // Calculate total progress
      const previousScenesTime = script.scenes
        .slice(0, currentScene)
        .reduce((sum, s) => sum + s.duration, 0);
      const totalProgress =
        (previousScenesTime + sceneProgress * scene.duration) / totalDuration;

      setProgress(totalProgress * 100);
      setTimeRemaining(
        totalDuration - (previousScenesTime + sceneProgress * scene.duration)
      );

      if (sceneProgress >= 1) {
        clearInterval(intervalRef.current);
      }
    }, 50);

    // Move to next scene after duration
    timeoutRef.current = setTimeout(() => {
      if (currentScene < script.scenes.length - 1) {
        setCurrentScene(currentScene + 1);
        playCurrentScene(); // Play next scene
      } else {
        // Video finished
        setIsPlaying(false);
        setProgress(100);
        setTimeRemaining(0);
      }
    }, sceneDuration);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Reset when script changes
  useEffect(() => {
    resetVideo();
  }, [script]);

  const formatTime = (seconds) => {
    return seconds < 10
      ? `0:0${Math.floor(seconds)}`
      : `0:${Math.floor(seconds)}`;
  };

  const getSceneBackground = (index) => {
    const backgrounds = [
      "from-purple-600 to-blue-600",
      "from-pink-500 to-rose-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-teal-500 to-blue-500",
    ];
    return backgrounds[index % backgrounds.length];
  };

  if (contentType !== "topic_teaser" || !script.scenes) {
    // For non-scene based content types, show simplified preview
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onGoBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-800">Content Preview</h2>
          <div className="w-6"></div>
        </div>

        <div className="mb-6">
          <div className="bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 mb-4">
            <p className="text-sm font-medium text-rose-800">
              📖 Topic: {topic}
            </p>
          </div>

          {/* Render content based on type */}
          {contentType === "quick_quiz" && script.question && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">
                  ❓ Question:
                </h4>
                <p className="text-gray-800 font-medium">{script.question}</p>
              </div>
              <div className="space-y-2">
                {script.options?.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm border ${
                      option === script.correctAnswer
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                    {option === script.correctAnswer && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {contentType === "exam_hack" && script.hook && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h4 className="font-semibold text-orange-800 text-sm mb-2">
                  🎯 Hook:
                </h4>
                <p className="text-gray-800">{script.hook}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h4 className="font-semibold text-yellow-800 text-sm mb-2">
                  💡 Hack:
                </h4>
                <p className="text-gray-800">{script.hack}</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">⚠️ {error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onCreateVideo}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🎬 Create Video
          </button>
          <button
            onClick={onGoBack}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            ← Generate New Script
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-center flex-1">
          <h2 className="text-lg font-bold text-gray-800">TikTok Preview</h2>
          <p className="text-xs text-gray-500">Topic Teaser</p>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Topic */}
      <div className="mb-4">
        <div className="bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
          <p className="text-sm font-medium text-rose-800">📖 {topic}</p>
        </div>
      </div>

      {/* TikTok Video Simulator */}
      <div className="mb-6">
        <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800">
          {/* Video Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 bg-gradient-to-br ${getSceneBackground(
                currentScene
              )} flex items-center justify-center p-6`}
            >
              <div className="text-center">
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-white font-bold text-lg leading-tight drop-shadow-lg"
                >
                  {script.scenes[currentScene]?.text || "Scene loading..."}
                </motion.h3>

                {/* Scene indicator */}
                <div className="absolute top-4 right-4 bg-black/30 rounded-full px-3 py-1">
                  <span className="text-white text-xs font-medium">
                    {currentScene + 1}/{script.scenes.length}
                  </span>
                </div>

                {/* Duration indicator */}
                <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1">
                  <span className="text-white text-xs font-medium">
                    {script.scenes[currentScene]?.duration}s
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <motion.div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              onClick={togglePlayback}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              {isPlaying ? (
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </motion.button>
          </div>

          {/* Time Display */}
          <div className="absolute bottom-4 left-4 bg-black/50 rounded-full px-3 py-1">
            <span className="text-white text-xs font-medium">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Video Controls */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <button
            onClick={resetVideo}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Restart"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isPlaying ? "Playing" : "Paused"} • {totalDuration}s total
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          onClick={onCreateVideo}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <span className="mr-2">🎬</span>
          Create This Video
        </motion.button>

        <button
          onClick={onGoBack}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">←</span>
          Generate New Script
        </button>
      </div>
    </div>
  );
}
