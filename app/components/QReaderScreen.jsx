// FILE: app/components/QReaderScreen.jsx
// -------------------------------------------------
// IMPLEMENTED - This component has been updated to include the two new features:
// 1. "Examiner's Note" Button: Triggers an AI call to get exam technique insights.
// 2. Interactive Step-by-Step Solution: The solution is now revealed one step at a time.
// -------------------------------------------------
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
} from "lucide-react";

// --- Sub-components (Slightly modified for new features) ---

const InfoPopover = ({ title, content, onClose, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    onClick={(e) => e.stopPropagation()}
    className="absolute bottom-full right-0 mb-3 w-72 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl z-20 border border-gray-700 backdrop-blur-sm bg-opacity-80"
  >
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200"
    >
      <X size={18} />
    </button>
    <h4 className="font-bold mb-2 text-lg text-blue-300">{title}</h4>
    {isLoading ? (
      <p className="text-gray-300">Generating insight...</p>
    ) : (
      <div className="text-gray-200">{content}</div>
    )}
  </motion.div>
);

const SimilarQuestionsModal = ({ questions, isLoading, onClose }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">
          Similar Questions Found
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 transition-colors duration-200"
        >
          <X size={24} />
        </button>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && (
          <p className="text-center text-gray-600 p-4">
            Finding similar questions...
          </p>
        )}
        {!isLoading &&
          questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200"
            >
              <p className="font-semibold text-base text-blue-800">
                {q.question_text}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                From: {q.source_paper} - Q{q.question_number}
              </p>
            </motion.div>
          ))}
        {!isLoading && questions.length === 0 && (
          <p className="text-center text-gray-600 p-4">
            No similar questions found.
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md"
      >
        Close
      </button>
    </motion.div>
  </div>
);

// --- Main QReader Component ---

export default function QReaderScreen({ paper, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [popover, setPopover] = useState(null);

  // State for Step-by-Step Solution
  const [showSolution, setShowSolution] = useState(false);
  const [revealedStep, setRevealedStep] = useState(0);

  // State for Examiner's Note
  const [examinerNote, setExaminerNote] = useState({
    loading: false,
    data: "",
  });

  const [marksExplanation, setMarksExplanation] = useState({
    loading: false,
    data: [],
  });
  const [similarQuestions, setSimilarQuestions] = useState({
    loading: false,
    data: [],
  });
  const popoverRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleExplainMarks = async () => {
    // ... (This function remains the same)
  };

  const handleFindSimilar = async () => {
    // ... (This function remains the same)
  };

  const handleExaminersNote = async () => {
    if (!currentQuestion) return;
    if (popover === "examiner") {
      setPopover(null);
      return;
    }
    setPopover("examiner");
    setExaminerNote({ loading: true, data: "" });

    try {
      const response = await fetch("/api/questions/examiner-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: currentQuestion.question_text,
          solutionText: currentQuestion.solution_steps.join("\n"),
          marks: currentQuestion.marks,
          topic: currentQuestion.topic,
        }),
      });
      if (!response.ok) throw new Error("Failed to get examiner's note.");
      const data = await response.json();
      setExaminerNote({
        loading: false,
        data: data.note || "No specific insight available.",
      });
    } catch (error) {
      console.error("Error fetching examiner's note:", error);
      setExaminerNote({ loading: false, data: "Failed to load insight." });
    }
  };

  const navigate = (direction) => {
    setShowSolution(false);
    setRevealedStep(0);
    setPopover(null);
    setCurrentIndex((prev) =>
      Math.max(0, Math.min(questions.length - 1, prev + direction))
    );
  };

  const toggleSolution = () => {
    if (showSolution) {
      setShowSolution(false);
      setRevealedStep(0);
    } else {
      setShowSolution(true);
      setRevealedStep(1);
    }
  };

  const revealNextStep = () => {
    setRevealedStep((prev) =>
      Math.min(currentQuestion.solution_steps.length, prev + 1)
    );
  };

  if (isLoading || !currentQuestion) {
    // Improved loading state
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading Smart Paper...
      </div>
    );
  }

  const allStepsRevealed =
    revealedStep >= currentQuestion.solution_steps.length;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl relative">
      <AnimatePresence>
        {popover === "similar" && (
          <SimilarQuestionsModal
            questions={similarQuestions.data}
            isLoading={similarQuestions.loading}
            onClose={() => setPopover(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6 border-b pb-4 border-blue-200">
        <button
          onClick={onBack}
          className="text-blue-700 hover:text-blue-900 transition-colors duration-200 flex items-center gap-1"
        >
          <ChevronLeft size={20} />{" "}
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="text-center flex-grow">
          <h2 className="text-xl md:text-2xl font-extrabold text-blue-900">
            {paper.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="w-14 sm:w-20"></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 min-h-[250px] border border-blue-200 flex flex-col justify-between relative"
        >
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <span className="font-bold text-xl text-gray-900">
                Question {currentQuestion.question_number}
              </span>
              <div className="flex items-center gap-3" ref={popoverRef}>
                <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {currentQuestion.difficulty}
                </span>
                <div className="relative">
                  <button
                    onClick={handleExplainMarks}
                    className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                  >
                    ({currentQuestion.marks} marks) <Info size={16} />
                  </button>
                  {popover === "marks" && (
                    <InfoPopover
                      title="Mark Breakdown"
                      content={marksExplanation.data}
                      isLoading={marksExplanation.loading}
                      onClose={() => setPopover(null)}
                    />
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={handleExaminersNote}
                    className="p-2 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-20l00 transition-colors duration-200"
                  >
                    <Lightbulb size={18} />
                  </button>
                  {popover === "examiner" && (
                    <InfoPopover
                      title="Examiner's Note"
                      content={[examinerNote.data]}
                      isLoading={examinerNote.loading}
                      onClose={() => setPopover(null)}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question_text}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 bg-green-50 border-2 border-green-200 p-6 rounded-2xl shadow-md"
          >
            <h4 className="font-bold text-xl text-green-800 flex items-center gap-2">
              <BookOpen size={20} /> Official Solution:
            </h4>
            <div className="mt-4 space-y-3">
              {currentQuestion.solution_steps
                .slice(0, revealedStep)
                .map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-700 text-base leading-relaxed"
                  >
                    <span className="font-bold mr-2">{index + 1}.</span>
                    {step}
                  </motion.div>
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate(-1)}
          disabled={currentIndex === 0}
          className="flex items-center justify-center p-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-300 transition-colors duration-200 shadow-sm"
        >
          <ChevronLeft size={20} className="mr-2" /> Previous
        </button>
        <button
          onClick={() => navigate(1)}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center justify-center p-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-300 transition-colors duration-200 shadow-sm"
        >
          Next <ChevronRight size={20} className="ml-2" />
        </button>
        <button
          onClick={toggleSolution}
          className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
        >
          <BookOpen size={20} className="mr-2" />{" "}
          {showSolution ? "Hide" : "Show"} Solution
        </button>
        <button
          onClick={handleFindSimilar}
          className="flex items-center justify-center p-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md"
        >
          <Search size={20} className="mr-2" /> Find Similar
        </button>
      </div>
    </div>
  );
}
