"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuests } from '@/context/QuestContext';

export default function QuestLog({ onClose }) {
  const { activeQuests, completedQuests, dailyQuests } = useQuests();
  const [activeTab, setActiveTab] = useState('active');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Quest Journal</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 font-medium ${activeTab === 'active' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500'}`}
          >
            Active Quests
          </button>
          <button 
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-3 font-medium ${activeTab === 'daily' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500'}`}
          >
            Daily Quests
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 font-medium ${activeTab === 'completed' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500'}`}
          >
            Completed
          </button>
        </div>
        
        {/* Quest List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeQuests.filter(q => q.type !== 'daily').length > 0 ? (
                  <ul className="space-y-3">
                    {activeQuests
                      .filter(q => q.type !== 'daily')
                      .map(quest => (
                        <QuestItem key={quest.id} quest={quest} />
                      ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No active quests. Start a new learning journey!</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Daily quests refresh at midnight. Complete them all for bonus XP!
                  </p>
                </div>
                <ul className="space-y-3">
                  {dailyQuests.map(quest => (
                    <QuestItem key={quest.id} quest={quest} />
                  ))}
                </ul>
              </motion.div>
            )}
            
            {activeTab === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {completedQuests.length > 0 ? (
                  <ul className="space-y-3">
                    {completedQuests.slice(0, 20).map(quest => (
                      <CompletedQuestItem key={quest.id} quest={quest} />
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>You haven't completed any quests yet.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Active quest item component
function QuestItem({ quest }) {
  const progressPercent = (quest.progress / quest.requirement) * 100;
  
  return (
    <li className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800">{quest.title}</h3>
        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
          +{quest.reward} XP
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{quest.progress} / {quest.requirement}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </li>
  );
}

// Completed quest item component
function CompletedQuestItem({ quest }) {
  const completedDate = new Date(quest.completedAt).toLocaleDateString();
  
  return (
    <li className="bg-green-50 rounded-lg p-4 border border-green-200">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800">{quest.title}</h3>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
          <span className="mr-1">✓</span> +{quest.reward} XP
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
      <p className="text-xs text-gray-500 mt-2">Completed: {completedDate}</p>
    </li>
  );
}
