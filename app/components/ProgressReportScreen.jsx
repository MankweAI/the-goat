// FILE: app/components/ProgressReportScreen.jsx
// -------------------------------------------------
// REDESIGNED - This screen has been completely overhauled to function as a "Learning Summary."
// It now features a dynamic circular progress chart for the score, reinforces the specific
// objective the user has just mastered, and includes actionable feedback and a smarter,
// contextual "Continue" button to guide the user's next steps.
// MODIFIED - The "Continue" button is now disabled unless the user achieves a perfect score,
// prompting them to review their answers before proceeding.
// -------------------------------------------------
"use client";
import { motion } from "framer-motion";

const ProgressRing = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          className="text-blue-600"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          transform="rotate(-90 60 60)"
        />
      </svg>
    </div>
  );
};

export default function ProgressReportScreen({
  results,
  objective,
  onContinue,
  onReview,
  continueText,
}) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length;
  const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  const getMessage = () => {
    if (score === 100) return "Perfect Score! You're a true GOAT! 🐐";
    if (score >= 66) return "Great job! You've got a solid understanding.";
    return "Good effort! Practice makes perfect.";
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center"
    >
      <motion.h2
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-800"
      >
        Learning Summary
      </motion.h2>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="my-8 flex flex-col items-center"
      >
        <div className="relative">
          <ProgressRing score={score} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-gray-900">{correctCount}</p>
            <p className="text-xl text-gray-500">/ {totalCount}</p>
          </div>
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="font-semibold text-lg mb-4 text-gray-700"
      >
        {getMessage()}
      </motion.p>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <p className="text-sm text-gray-500">Objective Mastered:</p>
        <p className="font-semibold text-gray-800 mt-1">{objective?.title}</p>
      </div>

      {score < 100 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-full"
        >
          <button
            onClick={onReview}
            className="w-full bg-amber-100 text-amber-800 font-bold py-3 px-4 rounded-lg mb-2 border border-amber-200 hover:bg-amber-200"
          >
            Review the questions you got wrong
          </button>
          <p className="text-xs text-gray-500 px-4">
            You must score 100% to continue. Review your answers and we can try
            the challenge again!
          </p>
        </motion.div>
      )}

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: score === 100 ? 1.05 : 1 }}
        whileTap={{ scale: score === 100 ? 0.95 : 1 }}
        onClick={onContinue}
        disabled={score < 100}
        className={`w-full font-bold py-3 px-4 rounded-lg mt-4 transition-colors duration-300 ${
          score < 100
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {continueText || "Continue"}
      </motion.button>
    </motion.div>
  );
}
