// FILE: app/components/TopicMasteryPreview.jsx
// -------------------------------------------------
// NEW - Interactive 2-minute Topic Mastery experience
// Includes mini-lessons, progressive MCQs, and summary
// -------------------------------------------------
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopicMasteryPreview({
  script,
  topic,
  onCreateVideo,
  onGoBack,
  error,
}) {
  const [currentPhase, setCurrentPhase] = useState("intro"); // intro, lessons, quiz, summary, complete
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const intervalRef = useRef(null);

  const { mini_lessons = [], mcq_progression = [], summary = {} } = script;

  // Calculate total duration
  const totalDuration = 120; // 2 minutes

  // Phase durations (in seconds)
  const phaseDurations = {
    lessons: mini_lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
    quiz: mcq_progression.length * 15, // 15 seconds per question
    summary: 20,
  };

  // Start the experience
  const startExperience = () => {
    setCurrentPhase("lessons");
    startTimer();
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTotalTime((prev) => {
        if (prev >= totalDuration) {
          completeExperience();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const completeExperience = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentPhase("complete");
  };

  // Progress through lessons
  const nextLesson = () => {
    if (currentLessonIndex < mini_lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      setCurrentPhase("quiz");
      setPhaseProgress(0);
    }
  };

  // Handle quiz answers
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const currentQuestion = mcq_progression[currentQuizIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore(score + 1);
    }

    setUserAnswers([
      ...userAnswers,
      {
        question: currentQuestion.question,
        selected: answer,
        correct: currentQuestion.correct_answer,
        isCorrect,
      },
    ]);

    setTimeout(() => {
      nextQuiz();
    }, 2000);
  };

  const nextQuiz = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentQuizIndex < mcq_progression.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setCurrentPhase("summary");
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Progress calculation
  const overallProgress = (totalTime / totalDuration) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderIntro = () => (
    <div className="text-center p-6">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-4xl mb-4">
          🎯
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Topic Mastery</h2>
        <p className="text-gray-600 mb-4">{topic}</p>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <p className="text-sm font-medium text-emerald-800">
            🕐 2-minute complete learning journey
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
            1
          </span>
          Mini-lessons ({mini_lessons.length} topics)
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-3">
            2
          </span>
          Progressive Quiz ({mcq_progression.length} questions)
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-3">
            3
          </span>
          Summary & Key Takeaways
        </div>
      </div>

      <button
        onClick={startExperience}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        🚀 Start Learning Journey
      </button>
    </div>
  );

  const renderLessons = () => {
    const lesson = mini_lessons[currentLessonIndex];
    const progress = ((currentLessonIndex + 1) / mini_lessons.length) * 100;

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-blue-600">
            Lesson {currentLessonIndex + 1} of {mini_lessons.length}
          </span>
          <span className="text-sm text-gray-500">
            {formatTime(totalTime)} / 2:00
          </span>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentLessonIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {lesson.title}
            </h3>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
              <p className="text-gray-700 leading-relaxed">{lesson.content}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">
                💡 Key Point: {lesson.key_point}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={nextLesson}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          {currentLessonIndex < mini_lessons.length - 1
            ? "Next Lesson"
            : "Start Quiz"}{" "}
          →
        </button>
      </div>
    );
  };

  const renderQuiz = () => {
    const question = mcq_progression[currentQuizIndex];
    const progress = ((currentQuizIndex + 1) / mcq_progression.length) * 100;

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-purple-600">
            Question {currentQuizIndex + 1} of {mcq_progression.length}
          </span>
          <span className="text-sm text-gray-500">
            {formatTime(totalTime)} / 2:00
          </span>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">
              Difficulty: {question.difficulty}
            </span>
            <span className="text-xs text-gray-500">
              Score: {score}/{currentQuizIndex}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuizIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              {question.question}
            </h3>

            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                    showFeedback
                      ? option === question.correct_answer
                        ? "bg-green-50 border-green-300 text-green-800"
                        : selectedAnswer === option
                        ? "bg-red-50 border-red-300 text-red-800"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                      : "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  } ${
                    selectedAnswer === option && !showFeedback
                      ? "border-purple-400 bg-purple-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>{String.fromCharCode(65 + index)}.</strong>{" "}
                      {option}
                    </span>
                    {showFeedback && option === question.correct_answer && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                    {showFeedback &&
                      selectedAnswer === option &&
                      option !== question.correct_answer && (
                        <span className="text-red-600 font-bold">✗</span>
                      )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${
                  selectedAnswer === question.correct_answer
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <p className="text-sm font-medium mb-2">
                  {selectedAnswer === question.correct_answer
                    ? "🎉 Correct!"
                    : "💡 Learn from this:"}
                </p>
                <p className="text-sm text-gray-700">{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-4">
          📚
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Learning Complete!</h2>
        <p className="text-gray-600">You've mastered: {topic}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{score}</p>
            <p className="text-xs text-gray-500">Quiz Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {mini_lessons.length}
            </p>
            <p className="text-xs text-gray-500">Lessons</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">2:00</p>
            <p className="text-xs text-gray-500">Duration</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">🔑 Key Points:</h4>
          <ul className="space-y-1">
            {summary.key_points?.map((point, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-start"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">
            🎯 Practical Application:
          </h4>
          <p className="text-sm text-gray-600">
            {summary.practical_application}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">🚀 Next Steps:</h4>
          <p className="text-sm text-gray-600">{summary.next_steps}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onCreateVideo}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          🎬 Create Learning Video
        </button>

        <button
          onClick={onGoBack}
          className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          ← Learn Something New
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center p-6">
      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center text-4xl mb-4">
        🏆
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Mastery Achieved!
      </h2>
      <p className="text-gray-600 mb-6">
        You've successfully completed the {topic} learning journey.
      </p>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-orange-200 mb-6">
        <p className="text-sm font-medium text-orange-800">
          🎉 Final Score: {score}/{mcq_progression.length} (
          {Math.round((score / mcq_progression.length) * 100)}%)
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onCreateVideo}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold"
        >
          🎬 Create Learning Video
        </button>
        <button
          onClick={onGoBack}
          className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium"
        >
          ← Master Another Topic
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
        <div className="flex items-center justify-between text-white">
          <button onClick={onGoBack} className="hover:bg-white/20 p-1 rounded">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="font-bold">Topic Mastery</h2>
          <div className="w-6"></div>
        </div>

        {currentPhase !== "intro" && (
          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-700">⚠️ {error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentPhase === "intro" && renderIntro()}
          {currentPhase === "lessons" && renderLessons()}
          {currentPhase === "quiz" && renderQuiz()}
          {currentPhase === "summary" && renderSummary()}
          {currentPhase === "complete" && renderComplete()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

