// FILE: app/components/QReaderScreen.jsx
// -------------------------------------------------
// REDESIGNED - This version implements the collapsible accordion-style for the AI tools.
// - "Get a Hint", "Examiner's Note", and "Show Solution" are now self-contained collapsible sections.
// - Clicking a button expands its content directly below it. Clicking again collapses it.
// - State management has been refactored to handle the active collapsible section.
// -------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Make sure you have lucide-react installed: npm install lucide-react
import {
  Lightbulb,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award,
  ChevronDown,
} from "lucide-react";

// --- Sub-components (No changes needed) ---

const WhyExplanation = ({ explanation, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-2 ml-8 p-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg"
  >
    {isLoading ? (
      <p className="italic text-indigo-700">Explaining...</p>
    ) : (
      <p className="text-sm text-indigo-800">{explanation}</p>
    )}
  </motion.div>
);

// --- Main Paper Trainer Component ---

export default function QReaderScreen({ paper, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // State for New Features
  const [activeSection, setActiveSection] = useState(null); // 'hint', 'note', or 'solution'
  const [hint, setHint] = useState({ loading: false, data: null });
  const [examinerNote, setExaminerNote] = useState({
    loading: false,
    data: null,
  });
  const [revealedStep, setRevealedStep] = useState(0);
  const [stepExplanations, setStepExplanations] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const response = await fetch(`/mock-data/mock-questions.json`);
      if (!response.ok) throw new Error("Could not find mock question data.");
      const data = await response.json();
      setQuestions(data);
      setIsLoading(false);
    };
    if (paper?.id) fetchQuestions();
  }, [paper?.id]);

  const currentQuestion = questions[currentIndex];

  const handleToggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      // Fetch content if it hasn't been fetched for this question yet
      if (section === "hint" && !hint.data) handleGetHint();
      if (section === "note" && !examinerNote.data) handleExaminersNote();
      if (section === "solution" && revealedStep === 0) setRevealedStep(1);
    }
  };

  const handleGetHint = async () => {
    setHint({ loading: true, data: "Thinking of a hint..." });
    const res = await fetch("/api/questions/get-hint", {
      method: "POST",
      body: JSON.stringify({ questionText: currentQuestion.question_text }),
    });
    const data = await res.json();
    setHint({ loading: false, data: data.hint });
  };

  const handleExplainStep = async (step, index) => {
    setStepExplanations((prev) => ({
      ...prev,
      [index]: { loading: true, data: null },
    }));
    const res = await fetch("/api/questions/explain-step", {
      method: "POST",
      body: JSON.stringify({
        questionText: currentQuestion.question_text,
        solutionStep: step,
      }),
    });
    const data = await res.json();
    setStepExplanations((prev) => ({
      ...prev,
      [index]: { loading: false, data: data.explanation },
    }));
  };

  const handleExaminersNote = async () => {
    setExaminerNote({ loading: true, data: "Analyzing the question..." });
    const res = await fetch("/api/questions/examiner-note", {
      method: "POST",
      body: JSON.stringify({
        questionText: currentQuestion.question_text,
        solutionText: currentQuestion.solution_steps.join("\n"),
        topic: currentQuestion.topic,
        marks: currentQuestion.marks,
      }),
    });
    const data = await res.json();
    setExaminerNote({ loading: false, data: data.note });
  };

  const navigate = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentIndex(newIndex);
      // Reset state for new question
      setActiveSection(null);
      setHint({ loading: false, data: null });
      setExaminerNote({ loading: false, data: null });
      setRevealedStep(0);
      setStepExplanations({});
    }
  };

  const revealNextStep = () => {
    setRevealedStep((prev) =>
      Math.min(currentQuestion.solution_steps.length, prev + 1)
    );
  };

  if (isLoading || !currentQuestion)
    return <div className="text-center p-12">Loading Smart Paper...</div>;

  const allStepsRevealed =
    revealedStep >= currentQuestion.solution_steps.length;

  const sectionButtonClasses = (section) =>
    `w-full flex justify-between items-center p-4 font-semibold rounded-lg transition-all duration-300 shadow-sm disabled:opacity-50`;
  const sectionColors = {
    hint: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      hover: "hover:bg-yellow-200",
      activeBg: "bg-yellow-200",
      activeRing: "ring-2 ring-yellow-400",
    },
    note: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      hover: "hover:bg-purple-200",
      activeBg: "bg-purple-200",
      activeRing: "ring-2 ring-purple-400",
    },
    solution: {
      bg: "bg-green-100",
      text: "text-green-800",
      hover: "hover:bg-green-200",
      activeBg: "bg-green-200",
      activeRing: "ring-2 ring-green-400",
    },
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-gray-100 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-black transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-gray-800">{paper.title}</h2>
          <p className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[250px] mb-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">
            Question {currentQuestion.question_number}
          </span>
          <span className="text-sm font-semibold text-gray-500">
            {currentQuestion.marks} marks
          </span>
        </div>
        <p className="mt-4 text-gray-700 text-base leading-relaxed">
          {currentQuestion.question_text}
        </p>
      </div>

      {/* Collapsible AI Tools */}
      <div className="space-y-3">
        {/* Hint Section */}
        <div>
          <button
            onClick={() => handleToggleSection("hint")}
            className={`${sectionButtonClasses("hint")} ${
              sectionColors.hint.bg
            } ${sectionColors.hint.text} ${sectionColors.hint.hover} ${
              activeSection === "hint"
                ? sectionColors.hint.activeBg +
                  " " +
                  sectionColors.hint.activeRing
                : ""
            }`}
          >
            <span className="flex items-center gap-2">
              <Lightbulb size={18} /> Get a Hint
            </span>
            <motion.div
              animate={{ rotate: activeSection === "hint" ? 180 : 0 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>
          <AnimatePresence>
            {activeSection === "hint" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 mt-2 bg-yellow-50 rounded-b-lg border-t border-yellow-200 text-yellow-900">
                  {hint.loading ? "Thinking..." : hint.data}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Examiner's Note Section */}
        <div>
          <button
            onClick={() => handleToggleSection("note")}
            className={`${sectionButtonClasses("note")} ${
              sectionColors.note.bg
            } ${sectionColors.note.text} ${sectionColors.note.hover} ${
              activeSection === "note"
                ? sectionColors.note.activeBg +
                  " " +
                  sectionColors.note.activeRing
                : ""
            }`}
          >
            <span className="flex items-center gap-2">
              <Award size={18} /> Examiner's Note
            </span>
            <motion.div
              animate={{ rotate: activeSection === "note" ? 180 : 0 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>
          <AnimatePresence>
            {activeSection === "note" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 mt-2 bg-purple-50 rounded-b-lg border-t border-purple-200 text-purple-900">
                  {examinerNote.loading ? "Analyzing..." : examinerNote.data}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Solution Section */}
        <div>
          <button
            onClick={() => handleToggleSection("solution")}
            className={`${sectionButtonClasses("solution")} ${
              sectionColors.solution.bg
            } ${sectionColors.solution.text} ${sectionColors.solution.hover} ${
              activeSection === "solution"
                ? sectionColors.solution.activeBg +
                  " " +
                  sectionColors.solution.activeRing
                : ""
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen size={18} /> Show Solution
            </span>
            <motion.div
              animate={{ rotate: activeSection === "solution" ? 180 : 0 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>
          <AnimatePresence>
            {activeSection === "solution" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 mt-2 bg-green-50 rounded-b-lg border-t border-green-200">
                  <div className="space-y-3">
                    {currentQuestion.solution_steps
                      .slice(0, revealedStep)
                      .map((step, index) => (
                        <div key={index}>
                          <div className="flex items-start gap-3 text-gray-700">
                            <span className="flex-shrink-0 font-bold mt-1">
                              {index + 1}.
                            </span>
                            <p className="flex-grow">{step}</p>
                            <button
                              onClick={() => handleExplainStep(step, index)}
                              className="flex-shrink-0 text-blue-500 hover:underline text-sm"
                            >
                              [Why?]
                            </button>
                          </div>
                          {stepExplanations[index] && (
                            <WhyExplanation
                              explanation={stepExplanations[index].data}
                              isLoading={stepExplanations[index].loading}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                  {!allStepsRevealed && (
                    <button
                      onClick={revealNextStep}
                      className="mt-4 w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Reveal Next Step
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          disabled={currentIndex === 0}
          className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <button
          onClick={() => navigate(1)}
          disabled={currentIndex === questions.length - 1}
          className="w-full p-3 bg-gray-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
