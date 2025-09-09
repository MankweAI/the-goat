// FILE: app/components/ChallengeScreen.jsx
// -------------------------------------------------
// BUG FIX - The ChallengeMCQ component is now updated to handle the
// standardized options format (an array of objects with a .text property).
// -------------------------------------------------
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChallengeMCQ = ({ challenge, onAnswered, difficulty }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  // This now expects an object: option = { text: "...", isCorrect: ... }
  const handleSelect = (option) => {
    setSelectedOption(option);
    setTimeout(() => onAnswered(option.isCorrect), 1200);
  };

  const difficultyStyles = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
    homework: "bg-indigo-100 text-indigo-800",
  };

  return (
    <div>
      <div
        className={`inline-block mx-auto px-3 py-1 rounded-full text-sm font-semibold mb-4 ${difficultyStyles[difficulty]}`}
      >
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </div>
      <p className="font-semibold text-lg text-center">{challenge.question}</p>
      <div className="space-y-3 mt-6">
        {challenge.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            disabled={selectedOption !== null}
            className={`w-full p-4 text-center rounded-lg border-2 font-semibold transition-all duration-300 ${
              selectedOption
                ? option.isCorrect
                  ? "bg-green-100 border-green-500" // Correct answer is always green
                  : selectedOption.text === option.text
                  ? "bg-red-100 border-red-500" // Selected incorrect answer is red
                  : "bg-white border-gray-200" // Other incorrect answers
                : "bg-white border-gray-200 hover:bg-gray-100" // Default state
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ChallengeScreen({
  challenges,
  onChallengesComplete,
  onBack,
}) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [results, setResults] = useState([]);

  const isSingleChallenge = Array.isArray(challenges);

  const challengeOrder = ["easy", "medium", "hard"];
  const currentDifficulty = isSingleChallenge
    ? "homework"
    : challengeOrder[challengeIndex];

  const currentChallenge = isSingleChallenge
    ? (challenges || [])[0]
    : (challenges || {})[currentDifficulty];

  useEffect(() => {
    setChallengeIndex(0);
    setResults([]);
  }, [challenges]);

  const handleAnswered = (isCorrect) => {
    let points = 0;
    if (isCorrect) {
      if (currentDifficulty === "easy") points = 10;
      else if (currentDifficulty === "medium") points = 20;
      else if (currentDifficulty === "hard") points = 30;
      else if (currentDifficulty === "homework") points = 50;
    }
    const newResults = [
      ...results,
      { level: currentDifficulty, isCorrect, points },
    ];
    setResults(newResults);

    if (!isSingleChallenge && challengeIndex < challengeOrder.length - 1) {
      setChallengeIndex((prevIndex) => prevIndex + 1);
    } else {
      onChallengesComplete(newResults);
    }
  };

  if (!currentChallenge) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the challenge for this lesson. Please go back and try
          again.
        </p>
        <button
          onClick={onBack}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg"
        >
          Back to Plan
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-4">Challenge Time!</h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDifficulty}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <ChallengeMCQ
            challenge={currentChallenge}
            onAnswered={handleAnswered}
            difficulty={currentDifficulty}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
