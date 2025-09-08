"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGamification } from './GamificationContext';

// Create context
const QuestContext = createContext();

// Quest system provider component
export function QuestProvider({ children }) {
  const { addXP, updateStats } = useGamification();
  const [quests, setQuests] = useState([]);
  const [activeQuests, setActiveQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);
  
  // Load saved quests from localStorage on initial render
  useEffect(() => {
    const savedActiveQuests = localStorage.getItem('fundi-active-quests');
    const savedCompletedQuests = localStorage.getItem('fundi-completed-quests');
    
    if (savedActiveQuests) {
      setActiveQuests(JSON.parse(savedActiveQuests));
    }
    
    if (savedCompletedQuests) {
      setCompletedQuests(JSON.parse(savedCompletedQuests));
    }
    
    // Generate daily quests
    generateDailyQuests();
  }, []);
  
  // Save quests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fundi-active-quests', JSON.stringify(activeQuests));
    localStorage.setItem('fundi-completed-quests', JSON.stringify(completedQuests));
  }, [activeQuests, completedQuests]);

  // Generate daily quests
  const generateDailyQuests = () => {
    // Basic daily quests
    const dailyQuestTemplates = [
      { id: 'daily_1', title: 'Daily Math Practice', description: 'Complete 3 math problems', reward: 50, type: 'daily', requirement: 3, progress: 0, category: 'math' },
      { id: 'daily_2', title: 'Knowledge Streak', description: 'Complete your problem of the day', reward: 30, type: 'daily', requirement: 1, progress: 0, category: 'potd' },
      { id: 'daily_3', title: 'Perfect Score', description: 'Get a perfect score on any quiz', reward: 75, type: 'daily', requirement: 1, progress: 0, category: 'score' }
    ];
    
    // Check if we already generated quests today
    const today = new Date().toDateString();
    const lastGenerated = localStorage.getItem('fundi-daily-quests-date');
    
    if (lastGenerated !== today) {
      localStorage.setItem('fundi-daily-quests-date', today);
      setDailyQuests(dailyQuestTemplates);
      
      // Add to active quests if not already there
      setActiveQuests(prev => {
        const filtered = prev.filter(q => q.type !== 'daily');
        return [...filtered, ...dailyQuestTemplates];
      });
    } else {
      // Load existing daily quests
      const savedDailyQuests = localStorage.getItem('fundi-daily-quests');
      if (savedDailyQuests) {
        setDailyQuests(JSON.parse(savedDailyQuests));
      }
    }
  };

  // Add a new quest
  const addQuest = (quest) => {
    setQuests(prev => [...prev, quest]);
    setActiveQuests(prev => [...prev, quest]);
  };

  // Update quest progress
  const updateQuestProgress = (questId, progress) => {
    setActiveQuests(prev => 
      prev.map(quest => {
        if (quest.id === questId) {
          const updatedQuest = { 
            ...quest, 
            progress: Math.min(quest.requirement, quest.progress + progress) 
          };
          
          // Check if quest is completed
          if (updatedQuest.progress >= updatedQuest.requirement && quest.progress < quest.requirement) {
            // Quest just completed
            completeQuest(quest);
            return null; // Will be filtered out
          }
          
          return updatedQuest;
        }
        return quest;
      }).filter(Boolean)
    );
  };

  // Complete a quest
  const completeQuest = (quest) => {
    // Add XP
    addXP(quest.reward, `Quest Completed: ${quest.title}`);
    
    // Update stats
    updateStats({ 
      questsCompleted: (prev) => prev + 1,
      // Add category-specific stats
      [`${quest.category}QuestsCompleted`]: (prev) => (prev || 0) + 1
    });
    
    // Move to completed quests
    setCompletedQuests(prev => [
      ...prev,
      { ...quest, completedAt: new Date().toISOString() }
    ]);
    
    // Add next quest in sequence if this was part of a quest line
    if (quest.nextQuestId) {
      const nextQuest = quests.find(q => q.id === quest.nextQuestId);
      if (nextQuest) {
        setActiveQuests(prev => [...prev, nextQuest]);
      }
    }
  };

  return (
    <QuestContext.Provider value={{ 
      activeQuests, 
      completedQuests,
      dailyQuests, 
      addQuest, 
      updateQuestProgress,
      completeQuest,
      generateDailyQuests
    }}>
      {children}
    </QuestContext.Provider>
  );
}

// Custom hook for using the quest context
export function useQuests() {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuests must be used within a QuestProvider');
  }
  return context;
}
