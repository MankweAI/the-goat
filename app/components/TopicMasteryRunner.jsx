"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SimTapRipple from "./SimTapRipple";
import { splitIntoLines, clampChars } from "../../lib/fitText";
import { buildTimeline, suggestCaptionAndTags } from "../../lib/timeline";

export default function TopicMasteryRunner({ topic, script, onDone }) {
  // Phases: hook -> lessons -> quiz -> summary -> complete
  const [phase, setPhase] = useState("hook");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Simulation helpers
  const simTimers = useRef([]);
  const [ripple, setRipple] = useState({ x: 0, y: 0, show: false });
  const stageRef = useRef(null);

  const totalTarget = 120;
  const overallProgress = Math.min((seconds / totalTarget) * 100, 100);
  const timeFmt = useMemo(() => {
    const remain = Math.max(totalTarget - seconds, 0);
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  // Global timer
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    simTimers.current.push(id);
    return () => {
      simTimers.current.forEach(clearInterval);
      simTimers.current.forEach(clearTimeout);
    };
  }, []);

  // Utility: schedule timeout with auto-cleanup
  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    simTimers.current.push(id);
    return id;
  };

  // Subtle simulated tap ripple at element selector
  const rippleAtSelector = (selector) => {
    const stage = stageRef.current;
    if (!stage) return;
    const el = stage.querySelector(selector);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - stageRect.left;
    const y = rect.top + rect.height / 2 - stageRect.top;
    setRipple({ x, y, show: true });
    later(() => setRipple((r) => ({ ...r, show: false })), 700);
  };

  // Hook simulation
  useEffect(() => {
    if (phase !== "hook") return;
    later(() => rippleAtSelector("[data-sim-next='hook']"), 3600);
    later(() => setPhase("lessons"), 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Lessons simulation
  useEffect(() => {
    if (phase !== "lessons") return;
    const lesson = script.mini_lessons?.[lessonIndex];
    if (!lesson) {
      setPhase("quiz");
      return;
    }
    const durMs = Math.max(20, Math.min(30, lesson.duration || 24)) * 1000;
    // Next tap just before end
    later(
      () => rippleAtSelector("[data-sim-next='lesson']"),
      Math.max(1200, durMs - 900)
    );
    later(() => setLessonIndex((i) => i + 1), durMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lessonIndex]);

  // Quiz simulation
  useEffect(() => {
    if (phase !== "quiz") return;
    const q = script.mcq_progression?.[questionIndex];
    if (!q) {
      setPhase("summary");
      return;
    }
    const options = q.options || [];
    const chooseCorrect = q.difficulty === "easy" ? true : Math.random() > 0.5;
    const pick = chooseCorrect
      ? q.correct_answer
      : options.find((o) => o !== q.correct_answer) || options[0];

    later(() => {
      setSelected(pick);
      setShowFeedback(true);
      if (pick === q.correct_answer) setScore((s) => s + 1);
      rippleAtSelector(`[data-option='${options.indexOf(pick)}']`);
    }, 2300);

    later(() => rippleAtSelector("[data-sim-next='quiz']"), 4300);
    later(() => {
      setShowFeedback(false);
      setSelected(null);
      setQuestionIndex((i) => i + 1);
    }, 5200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex]);

  // Summary simulation
  useEffect(() => {
    if (phase !== "summary") return;
    later(() => rippleAtSelector("[data-sim-next='summary']"), 10000);
    later(() => setPhase("complete"), 12000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Exit
  useEffect(() => {
    if (phase === "complete") {
      const timeline = buildTimeline(script, topic);
      const extras = suggestCaptionAndTags(topic);
      console.log("Timeline JSON:", timeline);
      console.log("Suggested caption/hashtags:", extras);
      later(() => onDone?.(), 1200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Text helpers
  const safeCaption = (text) => splitIntoLines(text, 36, 2);

  const toBullets = (text) => {
    if (!text) return [];
    // Split by sentence enders, fallback to semicolons/dashes
    let parts = text
      .split(/(?<=[.?!])\s+|;|\s+-\s+/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) parts = [text.trim()];
    // Keep at most 3 concise bullets
    parts = parts
      .slice(0, 3)
      .map((p) => (p.length > 80 ? p.slice(0, 77) + "…" : p));
    // Fit each bullet into 1–2 short lines
    return parts.map((p) => splitIntoLines(p, 34, 2));
  };

  // Minimal header: thin progress + time
  const headerBar = (
    <div className="absolute top-0 left-0 right-0 p-2.5 flex items-center justify-between text-[11px] text-gray-700">
      <div className="w-20 bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <span>{timeFmt}</span>
    </div>
  );

  const HookScene = () => {
    const lines = safeCaption(script.hook);
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-6 w-full text-center">
          <div className="text-gray-900 text-2xl font-bold leading-tight tracking-tight">
            {lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          <div className="sr-only" data-sim-next="hook" />
        </div>
      </div>
    );
  };

  // Minimalistic, slide-like lesson screen
  const LessonScene = () => {
    const l = script.mini_lessons?.[lessonIndex];
    if (!l) return null;
    const bullets = toBullets(l.content);
    const keyLine = safeCaption(l.key_point).join(" ");

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-[86%] max-w-[420px] mx-auto">
            <div className="text-gray-900 text-[22px] font-semibold leading-snug mb-4">
              {l.title}
            </div>

            <ul className="space-y-2 mb-5">
              {bullets.map((lines, idx) => (
                <li
                  key={idx}
                  className="text-[18px] leading-snug text-gray-900"
                >
                  <div className="flex items-start">
                    <span className="mt-[8px] mr-2 w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                    <div>
                      {lines.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="text-[14px] text-gray-600 italic">
              Key: {keyLine}
            </div>

            <div className="sr-only" data-sim-next="lesson" />
          </div>
        </div>
      </div>
    );
  };

  const DifficultyChip = ({ d }) => {
    const map = {
      easy: "bg-green-100 text-green-900",
      medium: "bg-amber-100 text-amber-900",
      difficult: "bg-red-100 text-red-900",
    };
    return (
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full ${
          map[d] || "bg-gray-100 text-gray-900"
        }`}
      >
        {d}
      </span>
    );
  };

  const QuizScene = () => {
    const q = script.mcq_progression?.[questionIndex];
    if (!q) return null;
    const expl = clampChars(q.explanation, 160);

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-6 w-full">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
            <div>
              Q{questionIndex + 1} / {script.mcq_progression?.length || 0}
            </div>
            <DifficultyChip d={q.difficulty} />
          </div>

          <div className="text-gray-900 text-[20px] font-semibold leading-snug mb-3">
            {q.question}
          </div>

          <div className="space-y-2 mb-3">
            {(q.options || []).map((option, i) => {
              const isCorrect = option === q.correct_answer;
              const isSelected = selected === option;
              let cls = "bg-white border-gray-300 text-gray-900";
              if (showFeedback) {
                if (isCorrect)
                  cls = "bg-green-50 border-green-300 text-green-900";
                else if (isSelected)
                  cls = "bg-red-50 border-red-300 text-red-900";
                else cls = "bg-gray-50 border-gray-200 text-gray-600";
              }
              return (
                <div
                  key={i}
                  data-option={i}
                  className={`p-3 rounded-xl border text-[15px] ${cls}`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>{String.fromCharCode(65 + i)}.</strong> {option}
                    </span>
                    {showFeedback && isCorrect && <span>✓</span>}
                    {showFeedback && isSelected && !isCorrect && <span>✗</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {showFeedback && (
            <div className="text-[14px] text-gray-800">{expl}</div>
          )}

          <div className="sr-only" data-sim-next="quiz" />
        </div>
      </div>
    );
  };

  // Minimalistic summary: bullets only, no stats card
  const SummaryScene = () => {
    const s = script.summary || {};
    const points = (s.key_points || []).map((p) => clampChars(p, 90));

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-6 w-full">
          <div className="text-gray-900 text-[20px] font-semibold leading-snug mb-3">
            Summary
          </div>
          <ul className="space-y-2 mb-4">
            {points.map((p, i) => (
              <li
                key={i}
                className="text-[16px] text-gray-900 leading-snug flex items-start"
              >
                <span className="mt-[8px] mr-2 w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                <div>{p}</div>
              </li>
            ))}
          </ul>

          {s.practical_application && (
            <div className="text-[14px] text-gray-700 mb-2">
              <span className="font-semibold">Apply:</span>{" "}
              {clampChars(s.practical_application, 140)}
            </div>
          )}
          {s.next_steps && (
            <div className="text-[14px] text-gray-700">
              <span className="font-semibold">Next:</span>{" "}
              {clampChars(s.next_steps, 140)}
            </div>
          )}

          {/* Minimal note only; no stats grid */}
          <div className="sr-only" data-sim-next="summary" />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
      {/* Stage 9:16 */}
      <div
        ref={stageRef}
        className="relative aspect-[9/16] bg-white text-gray-900 overflow-hidden"
      >
        {headerBar}

        {/* Scenes */}
        <AnimatePresence mode="wait">
          {phase === "hook" && (
            <motion.div
              key="hook"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <HookScene />
            </motion.div>
          )}
          {phase === "lessons" && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <LessonScene />
            </motion.div>
          )}
          {phase === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <QuizScene />
            </motion.div>
          )}
          {phase === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <SummaryScene />
            </motion.div>
          )}
          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center text-sm text-gray-600">
                Complete. Resetting…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle simulated tap ripple */}
        <SimTapRipple x={ripple.x} y={ripple.y} show={ripple.show} />
      </div>
    </div>
  );
}
