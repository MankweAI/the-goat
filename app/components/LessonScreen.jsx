// FILE: app/components/LessonScreen.jsx
// -------------------------------------------------
// RE-ARCHITECTED - This component is now fully dynamic. It manages state
// for the displayed content and an example counter. When a user clicks the new
// "I don't understand" option, it cycles through pre-generated simpler examples
// from the API, replacing the main lesson text without advancing the step.
// ENHANCED - The "I don't understand" button is now adaptive. Its text changes
// after the first click, and the button is removed entirely after the last
// available example has been shown.
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";

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

  // New state for dynamic content
  const [displayContent, setDisplayContent] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);

  const stepData = lessonPlan?.discovery_script?.[currentStep];

  // Update content when the lesson step changes
  useEffect(() => {
    if (stepData) {
      setDisplayContent(stepData.reveal);
      setExampleIndex(0); // Reset for the new step
    }
  }, [currentStep, stepData]);

  if (!lessonPlan || lessonPlan.error || !lessonPlan.discovery_script) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <p className="text-red-500">
          {lessonPlan?.error || "Lesson data is missing or invalid."}
        </p>
        <button onClick={onBack} className="mt-4 text-sm text-blue-600">
          Go Back
        </button>
      </div>
    );
  }

  const advanceToNextStep = () => {
    if (currentStep < lessonPlan.discovery_script.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setView("blueprint");
    }
    setSelectedOption(null);
    setFeedback("");
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setFeedback("");

    // If the user asks for help, cycle through examples
    if (option.isHelpRequest) {
      if (stepData.examples && stepData.examples.length > 0) {
        setDisplayContent(stepData.examples[exampleIndex]);
        // Increment index, but don't loop
        setExampleIndex((prevIndex) => prevIndex + 1);
      } else {
        setDisplayContent("Let me try to rephrase that... " + stepData.reveal);
      }
      setTimeout(() => setSelectedOption(null), 500); // Re-enable buttons
      return;
    }

    // Standard MCQ logic
    if (option.isCorrect) {
      setTimeout(advanceToNextStep, 1000);
    } else {
      setFeedback(option.feedback || "Eish, not quite. Give it another shot!");
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayContent}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200 my-4"
                >
                  <p className="whitespace-pre-wrap text-gray-800">
                    {displayContent}
                  </p>
                </motion.div>
              </AnimatePresence>
              {stepData.prompt && (
                <div className="w-full text-center mt-4 p-2">
                  <p className="font-semibold text-gray-700">
                    {stepData.prompt}
                  </p>
                </div>
              )}
            </div>
            <div className="w-full space-y-3 pt-4 border-t border-gray-100">
              {(stepData.options || []).map((option, index) => {
                if (option.isHelpRequest) {
                  // Only render the help button if there are more examples to show
                  if (exampleIndex >= (stepData.examples?.length || 0)) {
                    return null;
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={selectedOption !== null}
                      className="w-full p-3 md:p-4 text-center rounded-lg border-2 font-semibold text-sm md:text-base transition-all duration-300 bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-800"
                    >
                      {exampleIndex === 0
                        ? "I don't understand, can you explain it differently?"
                        : "Explain again"}
                    </button>
                  );
                }
                return (
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
                );
              })}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col flex-grow min-h-0 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Objective Complete!
            </h3>
            <p className="text-gray-500 mt-1">{lessonPlan.blueprint.title}</p>
            <div className="my-6 p-5 bg-white rounded-2xl border-2 text-left border-gray-200 flex-grow overflow-y-auto">
              <h4 className="font-bold text-lg text-gray-800">
                Learning Summary
              </h4>
              <hr className="my-3 border-gray-200" />
              <p>{lessonPlan.blueprint.summary}</p>
            </div>
            <button
              onClick={() => onLessonComplete()}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-4 flex-shrink-0"
            >
              Continue to Challenges
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
