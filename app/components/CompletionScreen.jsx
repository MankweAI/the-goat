// FILE: app/components/CompletionScreen.jsx
// -------------------------------------------------
// PROACTIVE BUG FIX - Removed all calls to the old gamification system.
// This component is no longer in active use but is being cleaned up to prevent future errors.
// -------------------------------------------------
"use client";
import { BlockMath } from "react-katex";
import { motion } from "framer-motion";

const renderVisual = (visual) => {
  if (!visual) return null;
  if (visual.type === "latex_expression") {
    return <BlockMath math={visual.data.latex} />;
  }
  return null;
};

export default function CompletionScreen({
  keySkill,
  onNext,
  solvedSteps,
  originalQuestion,
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center flex-grow flex flex-col justify-center"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      >
        <h2 className="text-3xl font-bold text-green-500">
          Problem Solved! 🏆
        </h2>
        <p className="text-gray-600 mt-2">
          Great job! Keep up the amazing work.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-left bg-gray-50 p-4 rounded-lg my-6 max-h-60 overflow-y-auto"
      >
        <h3 className="font-bold text-gray-800 mb-2">Your Solution Path:</h3>
        <p className="text-sm text-gray-500">{originalQuestion}</p>
        {solvedSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="mt-2"
          >
            <p className="text-sm text-gray-700">→ {step.text}</p>
            {step.visual && (
              <div className="pl-4">{renderVisual(step.visual)}</div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md"
      >
        <p>
          <span className="font-bold">Key Skill:</span> {keySkill}
        </p>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="w-full mt-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        Choose Another Question ✨
      </motion.button>
    </motion.div>
  );
}

