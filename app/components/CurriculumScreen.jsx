// FILE: app/components/CurriculumScreen.jsx
// -------------------------------------------------
// REDESIGNED - A complete UI overhaul for clarity and mobile-friendliness.
// Removes lock icons and enhances the "Start" button.
// -------------------------------------------------
import { motion } from "framer-motion";

export default function CurriculumScreen({
  curriculum,
  onStartObjective,
  onBack,
  completedObjectives,
}) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <button
        onClick={onBack}
        className="self-start mb-4 text-sm text-gray-600 hover:text-black"
      >
        &larr; Back
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Learning Plan</h2>
        <p className="text-gray-500 mt-1">
          Complete each step to master the topic.
        </p>
      </div>
      <ul className="space-y-3">
        {curriculum.map((obj, index) => {
          const isCompleted = completedObjectives.has(obj.id);
          const isUnlocked =
            index === 0 || completedObjectives.has(curriculum[index - 1]?.id);

          if (isUnlocked && !isCompleted) {
            // Active Step
            return (
              <motion.li
                key={obj.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <button
                  onClick={() => onStartObjective(obj)}
                  className="w-full p-4 rounded-xl text-left transition-all duration-300 border-2 border-blue-500 bg-blue-50 flex justify-between items-center shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="ml-4 font-semibold text-blue-800 text-base md:text-lg">
                      {obj.title}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600 text-sm">
                    Start →
                  </span>
                </button>
              </motion.li>
            );
          }

          // Completed or Locked Step
          return (
            <li
              key={obj.id}
              className={`flex items-center p-4 rounded-xl transition-colors duration-300 ${
                isCompleted ? "bg-green-50" : "bg-gray-100"
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                className={`ml-4 font-medium text-base md:text-lg ${
                  isCompleted ? "text-gray-500 line-through" : "text-gray-400"
                }`}
              >
                {obj.title}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
