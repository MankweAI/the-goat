// FILE: app/components/HomeworkSelectionScreen.jsx
// -------------------------------------------------
// NEW - This screen appears when multiple questions are found,
// allowing the user to choose their path.
// -------------------------------------------------
"use client";
import { motion } from "framer-motion";

export default function HomeworkSelectionScreen({
  questions,
  completedQuestionIds,
  onSelectQuestion,
  onBack,
}) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col h-[90vh]">
      <button
        onClick={onBack}
        className="self-start mb-4 text-sm text-gray-600 hover:text-black"
      >
        &larr; Upload a different page
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">We found these questions!</h2>
        <p className="text-gray-500">Which one do you want to tackle first?</p>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        <ul className="space-y-3">
          {questions.map((q, index) => {
            const isCompleted = completedQuestionIds.has(q.id);
            return (
              <motion.li
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => onSelectQuestion(q)}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-300 border-2 flex justify-between items-center ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <span className="font-bold text-gray-800">{q.title}</span>
                  {isCompleted && (
                    <div className="ml-2 flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

