// FILE: app/components/SolutionScreen.jsx
// -------------------------------------------------
// REDESIGNED - This component is completely new. It consumes the structured
// solution data from the API and renders it in a clean, card-based layout
// for maximum readability and impact.
// -------------------------------------------------
"use client";
import { motion } from "framer-motion";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const renderWithInlineMath = (text) => {
  if (!text) return null;
  const parts = text.split("$");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <InlineMath key={i} math={part} />
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

const StepCard = ({ step, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="bg-white rounded-xl border border-gray-200 p-4"
    >
      <h4 className="font-bold text-blue-700">{step.title}</h4>
      <p className="mt-2 text-gray-600 text-sm">
        {renderWithInlineMath(step.explanation)}
      </p>
      {step.formula && <BlockMath math={step.formula} />}
      {step.result && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">Resulting in:</p>
          <BlockMath math={step.result} />
        </div>
      )}
    </motion.div>
  );
};

export default function SolutionScreen({ solution, objective, onContinue }) {
  if (!solution) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <p className="text-red-500">
          Could not load the solution. Please try again.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto bg-gray-50 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Problem Solved</h2>
        <p className="text-gray-500 mt-2 text-base">
          Here’s the complete breakdown for your question:
        </p>
      </div>

      <div className="my-6 p-4 bg-white rounded-xl border-2 border-gray-200">
        <p className="text-base font-semibold text-gray-800 text-center">
          {objective.title}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Given Information
          </h3>
          <div className="p-4 bg-white rounded-xl border border-gray-200 text-gray-600 text-sm">
            {renderWithInlineMath(solution.given)}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Step-by-Step Solution
          </h3>
          <div className="space-y-3">
            {solution.steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Final Answer</h3>
          <div className="p-4 bg-green-100 rounded-xl border border-green-300 text-green-800 font-bold text-center">
            {renderWithInlineMath(solution.finalAnswer)}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
