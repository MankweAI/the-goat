"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";

export default function ProgressReportScreen({ results, onContinue }) {
  const { addXP, updateStats } = useGamification();
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length;
  const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  useEffect(() => {
    const pointsFromChallenges = results.reduce(
      (sum, r) => sum + (r.points || 0),
      0
    );
    let bonus = 0;
    let bonusReason = "";

    if (correctCount === results.length && results.length > 0) {
      bonus = 150; // Perfect Score Bonus
      bonusReason = "Perfect Score Bonus!";
      updateStats({ perfectScores: (prev) => prev + 1 });
    }

    if (pointsFromChallenges > 0) {
      addXP(pointsFromChallenges, "Challenge Completed");
    }

    if (bonus > 0) {
      setTimeout(() => addXP(bonus, bonusReason), 1000);
    }

    updateStats({ objectivesMastered: (prev) => prev + 1 });
  }, []);

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
        className="text-2xl font-bold"
      >
        Progress Report
      </motion.h2>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="my-8"
      >
        <p className="text-5xl font-bold">
          {correctCount}{" "}
          <span className="text-3xl text-gray-500">/ {totalCount}</span>
        </p>
        <p className="mt-2 text-gray-600">Correct Answers</p>
        {score === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full inline-block"
          >
            🏆 Perfect Score! +150 Bonus XP
          </motion.div>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="font-semibold text-lg mb-8"
      >
        {getMessage()}
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg"
      >
        Continue to Next Objective
      </motion.button>
    </motion.div>
  );
}
