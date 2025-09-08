"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/context/GamificationContext';

// Mock data for leaderboard (in a real app, this would come from a backend)
const MOCK_LEADERBOARD = [
  { id: 'user1', name: 'Xolani M.', xp: 8750, level: 12, avatar: '👨🏾‍🎓' },
  { id: 'user2', name: 'Sarah K.', xp: 7200, level: 10, avatar: '👩🏽‍💼' },
  { id: 'user3', name: 'Trevor N.', xp: 6300, level: 9, avatar: '👨🏼‍💻' },
  { id: 'user4', name: 'Lerato T.', xp: 5800, level: 8, avatar: '👩🏾‍🔬' },
  { id: 'user5', name: 'Michael R.', xp: 4500, level: 7, avatar: '🧑🏻‍🚀' },
  { id: 'user6', name: 'Priya S.', xp: 4100, level: 7, avatar: '👩🏽‍🏫' },
  { id: 'user7', name: 'James L.', xp: 3800, level: 6, avatar: '👨🏿‍🎤' },
  { id: 'user8', name: 'Thabo K.', xp: 3200, level: 6, avatar: '👨🏾‍🔧' },
  { id: 'user9', name: 'Emma W.', xp: 2900, level: 5, avatar: '👩🏼‍🎨' },
  { id: 'user10', name: 'Daniel O.', xp: 2500, level: 5, avatar: '👨🏽‍✈️' },
];

export default function Leaderboard({ onClose }) {
  const { goatPoints, level } = useGamification();
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  
  // User's position in the leaderboard
  const [userRank, setUserRank] = useState(null);
  
  // Load leaderboard data
  useEffect(() => {
    // In a real app, fetch data from backend based on timeFrame
    // For now, use mock data and insert the current user
    const currentUser = { 
      id: 'currentUser',
      name: 'You',
      xp: goatPoints,
      level: level,
      avatar: '🎮',
      isCurrentUser: true
    };
    
    // Create a copy of the mock data
    const leaderboard = [...MOCK_LEADERBOARD];
    
    // Insert the current user at the appropriate position based on XP
    let inserted = false;
    for (let i = 0; i < leaderboard.length; i++) {
      if (currentUser.xp > leaderboard[i].xp) {
        leaderboard.splice(i, 0, currentUser);
        setUserRank(i + 1);
        inserted = true;
        break;
      }
    }
    
    // If user's XP is lower than everyone on the leaderboard
    if (!inserted) {
      leaderboard.push(currentUser);
      setUserRank(leaderboard.length);
    }
    
    // Limit to top 10
    setLeaderboardData(leaderboard.slice(0, 10));
  }, [goatPoints, level, timeFrame]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Leaderboard</h2>
            <p className="text-sm opacity-90">
              Your Rank: #{userRank} • {goatPoints} XP
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Time Frame Selector */}
        <div className="flex bg-gray-100 p-1 m-4 rounded-lg">
          {['daily', 'weekly', 'monthly', 'all-time'].map((time) => (
            <button
              key={time}
              onClick={() => setTimeFrame(time)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                timeFrame === time
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {time.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
        
        {/* Leaderboard List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center p-3 rounded-lg mb-2 ${
                  user.isCurrentUser
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-2xl mx-3">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 flex items-center">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Level {user.level}</div>
                </div>
                <div className="font-bold text-lg">{user.xp.toLocaleString()} XP</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
