"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopicMasteryRunner({ topic, script, onDone }) {
  const {
    mini_lessons = [],
    mcq_progression = [],
    summary = {},
  } = script || {};

  // State
  const [phase, setPhase] = useState("intro"); // intro | lessons | quiz | summary | complete
  const [lessonIndex, setLessonIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [simNote, setSimNote] = useState("");
  const simRef = useRef({ timers: [] });

  // Total length target (2 minutes)
  const totalTarget = 120;

  // Helper to register timers for cleanup
  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    simRef.current.timers.push(id);
    return id;
  };
  const every = (fn, ms) => {
    const id = setInterval(fn, ms);
    simRef.current.timers.push(id);
    return id;
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      simRef.current.timers.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      });
    };
  }, []);

  // Global timer
  useEffect(() => {
    every(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const overallProgress = Math.min((seconds / totalTarget) * 100, 100);

  // Simulation flow
  useEffect(() => {
    if (phase === "intro") {
      setSimNote("Simulating tap: Start");
      later(() => {
        setPhase("lessons");
        setSimNote("");
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Lessons simulation
  useEffect(() => {
    if (phase !== "lessons") return;
    const lesson = mini_lessons[lessonIndex];
    if (!lesson) {
      // Move to quiz
      setPhase("quiz");
      setSimNote("");
      return;
    }
    // Show lesson for its duration or at least ~18s
    const displayMs = Math.max((lesson.duration || 20) * 1000, 18000);
    // Simulate Next tap 1s before advancing
    const tapAt = Math.max(displayMs - 1000, 2000);
    later(() => setSimNote("Simulating tap: Next"), tapAt);
    later(() => {
      setSimNote("");
      setLessonIndex((i) => i + 1);
    }, displayMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lessonIndex]);

  // Quiz simulation
  useEffect(() => {
    if (phase !== "quiz") return;
    const q = mcq_progression[questionIndex];
    if (!q) {
      // Proceed to summary
      setPhase("summary");
      setSimNote("");
      return;
    }

    // Decide simulated pick:
    // easy: correct, medium: 50/50, difficult: 50/50
    const options = q.options || [];
    let pick = options[0];
    const isEasy = q.difficulty === "easy";
    const chooseCorrect =
      isEasy || Math.random() > 0.5 ? q.correct_answer : null;
    if (chooseCorrect) {
      pick = q.correct_answer;
    } else {
      // pick a random incorrect
      const incorrect = options.filter((o) => o !== q.correct_answer);
      pick =
        incorrect[Math.floor(Math.random() * incorrect.length)] || options[0];
    }

    // Simulate a short reading delay then tap
    later(() => {
      setSimNote("Simulating tap: Select answer");
      setSelected(pick);
      const correct = pick === q.correct_answer;
      setShowFeedback(true);
      if (correct) setScore((s) => s + 1);
    }, 2500);

    // After feedback, simulate Next
    later(() => {
      setSimNote("Simulating tap: Next");
    }, 4500);

    // Advance to next question
    later(() => {
      setSimNote("");
      setShowFeedback(false);
      setSelected(null);
      setQuestionIndex((i) => i + 1);
    }, 5500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex]);

  // Summary simulation
  useEffect(() => {
    if (phase !== "summary") return;
    // Stay ~15s then complete
    later(() => setSimNote("Simulating tap: Finish"), 12000);
    later(() => {
      setSimNote("");
      setPhase("complete");
    }, 14000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-finish callback
  useEffect(() => {
    if (phase === "complete") {
      later(() => onDone?.(), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const timeFmt = useMemo(() => {
    const remain = Math.max(totalTarget - seconds, 0);
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  const renderIntro = () => (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Topic Mastery</h2>
      <p className="text-gray-600 mb-4">{topic}</p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
        You’ll see mini-lessons, answer questions, and review a summary. All
        interactions are simulated automatically to preview the experience.
      </div>
      <div className="mt-6 text-sm text-gray-500">{simNote}</div>
    </div>
  );

  const renderLesson = () => {
    const lesson = mini_lessons[lessonIndex];
    if (!lesson) return null;
    const progress = ((lessonIndex + 1) / mini_lessons.length) * 100;

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-gray-500">
            Lesson {lessonIndex + 1} of {mini_lessons.length}
          </span>
          <span className="text-xs text-gray-500">Time left: {timeFmt}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-gray-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={lessonIndex}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {lesson.title}
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-3 text-gray-800">
              {lesson.content}
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
              Key point: {lesson.key_point}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-center">
          <button
            className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm shadow-sm opacity-70 cursor-default"
            aria-disabled
          >
            Next
          </button>
        </div>
        <p className="text-xs text-center text-gray-500 mt-2">{simNote}</p>
      </div>
    );
  };

  const renderQuiz = () => {
    const q = mcq_progression[questionIndex];
    if (!q) return null;
    const progress = ((questionIndex + 1) / mcq_progression.length) * 100;

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-gray-500">
            Question {questionIndex + 1} of {mcq_progression.length} •{" "}
            {q.difficulty}
          </span>
          <span className="text-xs text-gray-500">Score: {score}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-gray-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h3 className="text-base font-bold text-gray-900 mb-4">
              {q.question}
            </h3>

            <div className="space-y-2 mb-4">
              {(q.options || []).map((option, i) => {
                const isCorrect = option === q.correct_answer;
                const isSelected = selected === option;
                const stateClass = showFeedback
                  ? isCorrect
                    ? "bg-green-50 border-green-300 text-green-800"
                    : isSelected
                    ? "bg-red-50 border-red-300 text-red-800"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                  : "bg-white border-gray-200 text-gray-800";
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${stateClass} text-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>{String.fromCharCode(65 + i)}.</strong> {option}
                      </span>
                      {showFeedback && isCorrect && <span>✓</span>}
                      {showFeedback && isSelected && !isCorrect && (
                        <span>✗</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {showFeedback && (
              <div className="p-3 rounded-xl border bg-blue-50 border-blue-200 text-sm text-blue-900">
                {q.explanation}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-center">
          <button
            className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm shadow-sm opacity-70 cursor-default"
            aria-disabled
          >
            Next
          </button>
        </div>
        <p className="text-xs text-center text-gray-500 mt-2">{simNote}</p>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Summary</h2>
        <p className="text-gray-600 mt-1">You studied: {topic}</p>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">
            Key points
          </h4>
          <ul className="space-y-1">
            {(summary.key_points || []).map((p, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start">
                <span className="w-2 h-2 rounded-full bg-gray-700 mt-2 mr-2"></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        {summary.practical_application && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800">
            <span className="font-semibold">Practical application: </span>
            {summary.practical_application}
          </div>
        )}
        {summary.next_steps && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800">
            <span className="font-semibold">Next steps: </span>
            {summary.next_steps}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">{score}</p>
          <p className="text-xs text-gray-500">Quiz score</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {mini_lessons.length}
          </p>
          <p className="text-xs text-gray-500">Lessons</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">2:00</p>
          <p className="text-xs text-gray-500">Duration</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm shadow-sm opacity-70 cursor-default"
          aria-disabled
        >
          Finish
        </button>
      </div>
      <p className="text-xs text-center text-gray-500 mt-2">{simNote}</p>
    </div>
  );

  const renderComplete = () => (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Mastery complete</h2>
      <p className="text-gray-600">Restarting...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Topic Mastery</h3>
          <div className="flex items-center space-x-3">
            <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-800"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{timeFmt}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            {renderIntro()}
          </motion.div>
        )}
        {phase === "lessons" && (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            {renderLesson()}
          </motion.div>
        )}
        {phase === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            {renderQuiz()}
          </motion.div>
        )}
        {phase === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            {renderSummary()}
          </motion.div>
        )}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            {renderComplete()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
