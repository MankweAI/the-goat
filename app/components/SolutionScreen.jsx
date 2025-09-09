// FILE: app/components/SolutionScreen.jsx
// -------------------------------------------------
// REDESIGNED - This screen now presents the final solution in a structured,
// easy-to-read format, parsing the simple Markdown from the AI.
// -------------------------------------------------
"use client";
import { motion } from "framer-motion";

// Helper component to render the structured solution text
const SolutionRenderer = ({ text }) => {
  const lines = text.split("\\n").filter((line) => line.trim() !== "");
  return (
    <div className="space-y-3 text-left">
      {lines.map((line, index) => {
        if (line.startsWith("*") && line.endsWith("*")) {
          // Render as a bold heading
          return (
            <h4 key={index} className="font-bold text-gray-800 pt-2">
              {line.replace(/\*/g, "")}
            </h4>
          );
        }
        if (line.startsWith("-")) {
          // Render as a list item
          return (
            <p key={index} className="text-gray-700 ml-4">
              {line.replace(/^- /, "")}
            </p>
          );
        }
        // Render as a regular paragraph
        return (
          <p key={index} className="text-gray-700">
            {line}
          </p>
        );
      })}
    </div>
  );
};

export default function SolutionScreen({ solutionText, onContinue }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-600">
          Solution Unlocked! 💡
        </h2>
        <p className="text-gray-600 mt-2">
          Here’s the step-by-step guide to solving your question.
        </p>
      </div>

      <div className="my-6 p-4 bg-gray-50 rounded-lg border max-h-80 overflow-y-auto">
        <SolutionRenderer text={solutionText} />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
