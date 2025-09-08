"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuests } from "@/context/QuestContext";

export default function QuestCreator({ onClose, lessonData }) {
  const { addQuest } = useQuests();
  const [questTitle, setQuestTitle] = useState(lessonData?.title || "");
  const [questDescription, setQuestDescription] = useState(
    lessonData?.description || ""
  );
  const [questReward, setQuestReward] = useState("50");
  const [questType, setQuestType] = useState("learning");
  const [questCategory, setQuestCategory] = useState("math");
  const [questRequirement, setQuestRequirement] = useState("1");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Create the quest object
    const newQuest = {
      id: `quest_${Date.now()}`,
      title: questTitle,
      description: questDescription,
      reward: parseInt(questReward, 10),
      type: questType,
      category: questCategory,
      requirement: parseInt(questRequirement, 10),
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    // Add the quest to the system
    addQuest(newQuest);

    // Simulate saving delay
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">Create Custom Learning Quest</h2>
          <p className="text-sm opacity-90">
            Turn your learning goals into quests
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quest Title
            </label>
            <input
              type="text"
              value={questTitle}
              onChange={(e) => setQuestTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              placeholder="e.g., Master Algebra Equations"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={questDescription}
              onChange={(e) => setQuestDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
              required
              placeholder="What do you need to do to complete this quest?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quest Type
              </label>
              <select
                value={questType}
                onChange={(e) => setQuestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="learning">Learning</option>
                <option value="practice">Practice</option>
                <option value="challenge">Challenge</option>
                <option value="mastery">Mastery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={questCategory}
                onChange={(e) => setQuestCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="language">Language</option>
                <option value="history">History</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XP Reward
              </label>
              <input
                type="number"
                value={questReward}
                onChange={(e) => setQuestReward(e.target.value)}
                min="10"
                max="500"
                step="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Requirement
              </label>
              <input
                type="number"
                value={questRequirement}
                onChange={(e) => setQuestRequirement(e.target.value)}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Quest"
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
