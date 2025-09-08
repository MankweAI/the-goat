// FILE: app/components/LessonScreen.jsx
// -------------------------------------------------
// NEW - This is the official, interactive lesson component.
// It replaces the old chat-style LessonScreen and DiscoveryScreen.
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonScreen({
  objective,
  onBack,
  onDiscoveryComplete,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [lessonData, setLessonData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [view, setView] = useState("discovery");
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      try {
        // Fetch from our new, context-aware API
        const response = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objectiveTitle: objective.title,
            objectiveType: objective.type,
          }),
        });
        const data = await response.json();
        setLessonData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLesson();
  }, [objective]);

  const handleOptionSelect = (option, index) => {
    setSelectedOption(index);
    setFeedback("");
    if (option.isCorrect) {
      setTimeout(() => {
        if (currentStep < lessonData.discovery_script.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setView("blueprint");
        }
        setSelectedOption(null);
      }, 1000);
    } else {
      setFeedback(option.feedback);
      setTimeout(() => setSelectedOption(null), 2000);
    }
  };

  if (isLoading || !lessonData)
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <p>Your tutor is preparing the lesson...</p>
      </div>
    );

  const stepData = lessonData.discovery_script[currentStep];

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col h-[95vh]">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-black"
        >
          &larr; Back to Plan
        </button>
        <h2 className="text-lg text-center font-bold">{objective.title}</h2>
        <div className="w-16"></div>
      </div>
      <AnimatePresence mode="wait">
        {view === "discovery" && (
          <motion.div
            key="discovery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-grow"
          >
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 my-4">
              <p className="whitespace-pre-wrap">{stepData.reveal}</p>
            </div>
            <div className="w-full text-center mt-4 p-4">
              <p className="font-semibold">{stepData.prompt}</p>
            </div>
            <div className="w-full space-y-3 mt-4">
              {stepData.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option, index)}
                  disabled={selectedOption !== null}
                  className={`w-full p-4 text-center rounded-lg border-2 font-semibold transition-all duration-300 ${
                    selectedOption === index
                      ? option.isCorrect
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500 animate-shake"
                      : "bg-white border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
            {feedback && (
              <p className="text-red-600 text-sm mt-2 p-2 text-center">
                {feedback}
              </p>
            )}
          </motion.div>
        )}
        {view === "blueprint" && (
          <motion.div
            key="blueprint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-grow"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">
                Awesome Work! 🚀
              </h3>
              <p className="text-gray-600 mt-2">{lessonData.blueprint.title}</p>
            </div>
            <div className="my-6 p-4 bg-gray-50 rounded-lg border whitespace-pre-wrap">
              {lessonData.blueprint.summary}
            </div>
            <button
              onClick={() => onDiscoveryComplete(lessonData.challenges)}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-auto"
            >
              Okay, I'm ready for the challenges!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
