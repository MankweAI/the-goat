// FILE: app/components/LessonScreen.jsx
// -------------------------------------------------
// BUG FIX - The component is now more resilient. It checks if stepData.options
// exists. If not, it renders a simple "Continue" button instead of crashing.
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const BlueprintRenderer = ({ summary }) => {
  if (!summary) return null;
  const sections = summary.split("*").filter((s) => s.trim() !== "");
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section
          .split("\\n")
          .map((l) => l.trim())
          .filter((l) => l);
        const title = lines.shift() || "";
        return (
          <div key={index}>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{line.replace(/^- /, "")}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default function LessonScreen({
  lessonPlan,
  objective,
  onBack,
  onLessonComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [view, setView] = useState("discovery");
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setCurrentStep(0);
    setView("discovery");
    setSelectedOption(null);
    setFeedback("");
  }, [lessonPlan]);

  if (!lessonPlan) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <p className="text-red-500">Lesson data is missing. Please go back.</p>
        <button onClick={onBack} className="mt-4 text-sm text-blue-600">
          Go Back
        </button>
      </div>
    );
  }

  if (lessonPlan.error || !lessonPlan.discovery_script) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <p className="text-red-500">
          {lessonPlan.error || "An unknown error occurred."}
        </p>
        <button onClick={onBack} className="mt-4 text-sm text-blue-600">
          Go Back
        </button>
      </div>
    );
  }

  const stepData = lessonPlan.discovery_script[currentStep];

  const advanceToNextStep = () => {
    if (currentStep < lessonPlan.discovery_script.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setView("blueprint");
    }
    setSelectedOption(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setFeedback("");
    if (option.isCorrect) {
      setTimeout(() => {
        advanceToNextStep();
      }, 1000);
    } else {
      setFeedback(option.feedback);
      setTimeout(() => setSelectedOption(null), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col h-[95vh]">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-black p-2 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-base md:text-lg text-center font-bold text-gray-800 flex-1 mx-2">
          {objective.title}
        </h2>
        <div className="w-10"></div>
      </div>
      <AnimatePresence mode="wait">
        {view === "discovery" && stepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-grow min-h-0"
          >
            <div className="flex-grow overflow-y-auto px-2">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 my-4">
                <p className="whitespace-pre-wrap text-gray-800">
                  {stepData.reveal}
                </p>
              </div>
              {stepData.prompt && (
                <div className="w-full text-center mt-4 p-2">
                  <p className="font-semibold text-gray-700">
                    {stepData.prompt}
                  </p>
                </div>
              )}
            </div>
            <div className="w-full space-y-3 pt-4 border-t border-gray-100">
              {/* ### THIS IS THE FIX ### */}
              {/* We now check if options exist and are an array */}
              {stepData.options &&
              Array.isArray(stepData.options) &&
              stepData.options.length > 0 ? (
                stepData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={selectedOption !== null}
                    className={`w-full p-3 md:p-4 text-center rounded-lg border-2 font-semibold text-sm md:text-base transition-all duration-300 ${
                      selectedOption === option
                        ? option.isCorrect
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500 animate-shake"
                        : "bg-white border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {option.text}
                  </button>
                ))
              ) : (
                // If no options, render a simple Continue button
                <button
                  onClick={advanceToNextStep}
                  className="w-full p-3 md:p-4 text-center rounded-lg border-2 font-semibold text-sm md:text-base bg-blue-500 text-white hover:bg-blue-600"
                >
                  Continue
                </button>
              )}
            </div>
            {feedback && (
              <p className="text-red-600 text-xs text-center mt-2 p-2">
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
            className="flex flex-col flex-grow min-h-0"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">
                Awesome Work! 🚀
              </h3>
              <p className="text-gray-600 mt-2">{lessonPlan.blueprint.title}</p>
            </div>
            <div className="my-6 p-4 bg-gray-50 rounded-lg border flex-grow overflow-y-auto">
              <BlueprintRenderer summary={lessonPlan.blueprint.summary} />
            </div>
            <button
              onClick={() => onLessonComplete()}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-4 flex-shrink-0"
            >
              {objective.type === "homework" && objective.label
                ? `Ready for Question ${objective.label}`
                : "I'm Ready for the Challenges!"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
