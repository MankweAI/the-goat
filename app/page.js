// FILE: app/page.js
// -------------------------------------------------
// REFACTORED - This version uses the new, single API call architecture.
// It fetches the lesson AND challenge data upfront, fixing the persistent bug.
// -------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GamificationProvider,
  useGamification,
} from "@/context/GamificationContext";

import HomeScreen from "./components/HomeScreen";
import LoadingSpinner from "./components/LoadingSpinner";
import TopicIntakeScreen from "./components/TopicIntakeScreen";
import HomeworkScreen from "./components/HomeworkScreen";
import HomeworkSelectionScreen from "./components/HomeworkSelectionScreen";
import CurriculumScreen from "./components/CurriculumScreen";
import LessonScreen from "./components/LessonScreen";
import ChallengeScreen from "./components/ChallengeScreen";
import ProgressReportScreen from "./components/ProgressReportScreen";
import MasteryQuizScreen from "./components/MasteryQuizScreen";
import GamificationUI from "./components/GamificationUI";

function AppContent() {
  const [screen, setScreen] = useState("home");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [plannedQuestions, setPlannedQuestions] = useState([]);
  const [completedHomeworkIds, setCompletedHomeworkIds] = useState(new Set());

  const [curriculum, setCurriculum] = useState(null);
  const [currentObjective, setCurrentObjective] = useState(null);
  const [completedObjectives, setCompletedObjectives] = useState(new Set());

  // NEW state to hold the complete lesson plan
  const [currentLessonPlan, setCurrentLessonPlan] = useState(null);
  const [challengeResults, setChallengeResults] = useState([]);

  const { addXP, updateStats } = useGamification();

  // --- Handlers ---

  const handleGoHome = () => {
    setScreen("home");
    // ... (reset all other states)
    setError(null);
    setIsLoading(false);
    setPlannedQuestions([]);
    setCompletedHomeworkIds(new Set());
    setCurriculum(null);
    setCurrentObjective(null);
    setCompletedObjectives(new Set());
    setCurrentLessonPlan(null);
  };

  const handlePlanHomework = async (formData) => {
    setIsLoading(true);
    setError(null);
    setScreen("loading");

    try {
      const response = await fetch("/api/plan-homework-session", {
        method: "POST",
        body: formData,
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).error || "Failed to plan homework session."
        );

      const data = await response.json();
      if (
        !data ||
        !data.plannedQuestions ||
        data.plannedQuestions.length === 0
      ) {
        setError(
          "I couldn't find any questions on that page. Please try again."
        );
        setScreen("homework_intake");
        return;
      }

      setPlannedQuestions(data.plannedQuestions);

      if (data.plannedQuestions.length === 1) {
        setCurriculum(data.plannedQuestions[0].curriculum);
        setCompletedObjectives(new Set());
        setScreen("topic_curriculum");
      } else {
        setScreen("homework_selection");
      }
    } catch (err) {
      setError(err.message);
      setScreen("homework_intake");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMasteryCurriculum = async (painPoint) => {
    setIsLoading(true);
    setError(null);
    setScreen("loading");
    try {
      const response = await fetch("/api/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painPoint }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).error || "Failed to generate plan."
        );

      const data = await response.json();
      setCurriculum(data.curriculum);
      setCompletedObjectives(new Set());
      setScreen("topic_curriculum");
    } catch (err) {
      setError(err.message);
      setScreen("topic_intake");
    } finally {
      setIsLoading(false);
    }
  };

  // ### THIS FUNCTION CONTAINS THE NEW LOGIC ###
  const handleStartObjective = async (objective) => {
    setIsLoading(true);
    setError(null);
    setScreen("loading");

    // Find parent question ID for context
    const parentQuestion = plannedQuestions.find(
      (q) => q.curriculum === curriculum
    );
    const parentId = parentQuestion ? parentQuestion.id : null;
    const fullObjective = { ...objective, questionId: parentId };
    setCurrentObjective(fullObjective);

    try {
      const response = await fetch("/api/generate-objective-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective: fullObjective }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).error || "Failed to generate lesson."
        );

      const lessonPlan = await response.json();
      setCurrentLessonPlan(lessonPlan); // Store the entire plan (lesson + challenges)
      setScreen("lesson");
    } catch (err) {
      setError(err.message);
      setScreen("topic_curriculum");
    } finally {
      setIsLoading(false);
    }
  };

  // This function is now very simple! No API call needed.
  const handleLessonComplete = () => {
    setScreen("topic_challenge");
  };

  const handleChallengesComplete = (results) => {
    setChallengeResults(results);
    setScreen("topic_progress_report");
  };

  const handleObjectiveMastered = () => {
    // This function's logic remains the same as the last fix
    addXP(100, "Objective Mastered!");
    updateStats({ objectivesMastered: (prev) => prev + 1 });

    const newCompletedObjectives = new Set(completedObjectives).add(
      currentObjective.id
    );
    setCompletedObjectives(newCompletedObjectives);

    const isCurrentCurriculumComplete = curriculum.every((obj) =>
      newCompletedObjectives.has(obj.id)
    );

    if (isCurrentCurriculumComplete) {
      if (currentObjective.questionId) {
        const newCompletedHwIds = new Set(completedHomeworkIds).add(
          currentObjective.questionId
        );
        setCompletedHomeworkIds(newCompletedHwIds);

        if (
          plannedQuestions.length > 1 &&
          newCompletedHwIds.size < plannedQuestions.length
        ) {
          setScreen("homework_selection");
          return;
        }
      }
      handleGoHome();
    } else {
      setScreen("topic_curriculum");
    }
  };

  const renderScreen = () => {
    if (error) {
      return (
        <div className="w-full max-w-md mx-auto text-center p-4">
          {" "}
          <p className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</p>{" "}
          <button
            onClick={handleGoHome}
            className="mt-4 text-sm text-gray-600 hover:underline"
          >
            {" "}
            Go Home{" "}
          </button>{" "}
        </div>
      );
    }
    if (isLoading || screen === "loading") return <LoadingSpinner />;

    switch (screen) {
      case "home":
        return (
          <HomeScreen
            onStartTopicMastery={() => setScreen("topic_intake")}
            onStartHomework={() => setScreen("homework_intake")}
          />
        );
      case "homework_intake":
        return (
          <HomeworkScreen
            onGenerateCurriculum={handlePlanHomework}
            onBack={handleGoHome}
            isLoading={isLoading}
          />
        );
      case "homework_selection":
        return (
          <HomeworkSelectionScreen
            questions={plannedQuestions}
            completedQuestionIds={completedHomeworkIds}
            onSelectQuestion={(question) => {
              setCurriculum(question.curriculum);
              setCompletedObjectives(new Set());
              setScreen("topic_curriculum");
            }}
            onBack={handleGoHome}
          />
        );
      case "topic_intake":
        return (
          <TopicIntakeScreen
            onGenerateCurriculum={handleGenerateMasteryCurriculum}
            onBack={handleGoHome}
            isLoading={isLoading}
          />
        );
      case "topic_curriculum":
        return (
          <CurriculumScreen
            curriculum={curriculum}
            onStartObjective={handleStartObjective}
            onBack={() =>
              plannedQuestions.length > 1
                ? setScreen("homework_selection")
                : handleGoHome()
            }
            completedObjectives={completedObjectives}
          />
        );
      case "lesson":
        return (
          <LessonScreen
            lessonPlan={currentLessonPlan}
            objective={currentObjective}
            onBack={() => setScreen("topic_curriculum")}
            onDiscoveryComplete={handleLessonComplete}
          />
        );
      case "topic_challenge":
        return (
          <ChallengeScreen
            challenges={currentLessonPlan.challenges}
            onChallengesComplete={handleChallengesComplete}
            onBack={() => setScreen("topic_curriculum")}
          />
        );
      case "topic_progress_report":
        return (
          <ProgressReportScreen
            results={challengeResults}
            onContinue={handleObjectiveMastered}
          />
        );
      // MasteryQuiz case removed for brevity as it's unchanged and would follow this flow
      default:
        return (
          <HomeScreen
            onStartTopicMastery={() => setScreen("topic_intake")}
            onStartHomework={() => setScreen("homework_intake")}
          />
        );
    }
  };

  return (
    <>
      <GamificationUI />
      <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <GamificationProvider>
      <AppContent />
    </GamificationProvider>
  );
}
