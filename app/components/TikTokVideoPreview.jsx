// FILE: app/components/TikTokVideoPreview.jsx
// PURPOSE: 9:16 preview player with a vanilla Three.js background + SFX + captions.
// HOW IT WORKS:
// - Plays script.scenes sequentially (30–45s total).
// - Mounts a small Three.js stage (vanilla three) for subtle 3D polish.
// - Shows simple 2D overlays (equation card, balance, rule chip, result).
// - Plays sound effects per scene (whoosh/ding/pop) using WebAudio.
// NOTE: Client-only. Three stage is dynamically imported to avoid SSR issues.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import useSfx from "./hooks/useSfx";

// IMPORTANT: Dynamically import the 3D stage to avoid SSR issues.
const ThreeStage = dynamic(() => import("./three/ThreeStageVanilla"), {
  ssr: false,
});

// Map beats to overlays
const BEAT_HINTS = {
  setup: { overlay: "equation" },
  problem: { overlay: "equation" },
  confusion: { overlay: "equation" },
  insight: { overlay: "rule" },
  solve: { overlay: "balance" },
  aha: { overlay: "result" },
  wrap: { overlay: "result" },
};

export default function TikTokVideoPreview({
  script,
  topic,
  contentType,
  onGoBack,
}) {
  const scenes = Array.isArray(script?.scenes) ? script.scenes : [];
  const totalDuration = useMemo(
    () => scenes.reduce((a, s) => a + (s.duration || 0), 0),
    [scenes]
  );

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0); // 0..1 within current scene
  const timerRef = useRef(null);
  const sceneStartRef = useRef(0);

  const { playWhoosh, playDing, playPop, ensureUnlocked, unlocked } = useSfx();

  const playSceneSfx = (sfx) => {
    if (!unlocked) return;
    if (sfx === "whoosh") playWhoosh();
    else if (sfx === "ding") playDing();
    else if (sfx === "pop") playPop();
  };

  // Start/Restart timeline when scenes change
  useEffect(() => {
    if (scenes.length === 0) return;
    setIdx(0);
    setPlaying(true);
    setSceneProgress(0);
    clearTimeout(timerRef.current);

    playSceneSfx(scenes[0]?.sfx);

    const step = (i) => {
      sceneStartRef.current = performance.now();
      const durMs = Math.max(
        1000,
        Math.min(6000, (scenes[i]?.duration || 2) * 1000)
      );
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!playing) return;
        if (i + 1 < scenes.length) {
          setIdx(i + 1);
          playSceneSfx(scenes[i + 1]?.sfx);
          step(i + 1);
        } else {
          setPlaying(false); // stop at end
        }
      }, durMs);
    };

    step(0);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(scenes)]);

  // Progress ticker
  useEffect(() => {
    let raf;
    const tick = () => {
      if (!playing) return;
      const now = performance.now();
      const durMs = Math.max(
        1000,
        Math.min(6000, (scenes[idx]?.duration || 2) * 1000)
      );
      const elapsed = Math.min(1, (now - sceneStartRef.current) / durMs);
      setSceneProgress(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, playing, scenes]);

  const current = scenes[idx] || {
    text: "",
    beat: "setup",
    duration: 2,
    sfx: "none",
    camera: "hold",
  };
  const hint = BEAT_HINTS[current.beat] || BEAT_HINTS.setup;

  // Controls
  const onTogglePlay = () => {
    if (!unlocked) ensureUnlocked();
    setPlaying((p) => !p);
    if (!playing) {
      sceneStartRef.current =
        performance.now() - sceneProgress * (current.duration * 1000);
      clearTimeout(timerRef.current);
      const remain = (1 - sceneProgress) * (current.duration * 1000);
      timerRef.current = setTimeout(() => {
        if (idx + 1 < scenes.length) {
          setIdx(idx + 1);
          playSceneSfx(scenes[idx + 1]?.sfx);
        } else {
          setPlaying(false);
        }
      }, remain);
    } else {
      clearTimeout(timerRef.current);
    }
  };

  const onRestart = () => {
    setIdx(0);
    setPlaying(true);
    setSceneProgress(0);
    clearTimeout(timerRef.current);
    playSceneSfx(scenes[0]?.sfx);
  };

  // Beat-driven overlay choice
  const Overlay = useMemo(() => {
    switch (hint.overlay) {
      case "equation":
        return <EquationCard emphasis={current.beat === "problem"} />;
      case "rule":
        return <RuleCard />;
      case "balance":
        return <BalanceScale />;
      case "result":
      default:
        return <ResultCard />;
    }
  }, [hint.overlay, current.beat]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onGoBack}
          className="text-sm text-gray-600 hover:text-black"
        >
          &larr; Back
        </button>
        <div className="text-xs text-gray-500 truncate max-w-[50%]">
          {topic}
        </div>
        <div className="text-xs text-gray-400">
          {Math.round(totalDuration)}s
        </div>
      </div>

      {/* 9:16 phone frame */}
      <div className="relative mx-auto w-[270px] h-[480px] rounded-[24px] overflow-hidden shadow-inner bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200">
        {/* 3D Stage (background) */}
        <ThreeStage
          beat={current.beat}
          sceneIndex={idx}
          sceneProgress={sceneProgress}
        />

        {/* Readability vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 35% at 50% 30%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.08) 100%)",
          }}
        />

        {/* Beat-driven 2D overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${idx}-${hint.overlay}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {Overlay}
          </motion.div>
        </AnimatePresence>

        {/* Caption Layer (Lower Third) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${idx}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-4 left-3 right-3"
          >
            <div className="px-3 py-2 rounded-xl bg-white/85 backdrop-blur border border-gray-200 shadow">
              <p className="text-[13px] leading-snug text-gray-900 text-center">
                {current.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Sound Unlock Prompt */}
        {!unlocked && (
          <button
            onClick={ensureUnlocked}
            className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-emerald-600 text-white text-[11px] shadow"
            title="Enable sound effects"
          >
            Enable Sound 🔊
          </button>
        )}

        {/* Transport Controls */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="px-2 py-1 rounded-lg bg-gray-900/80 text-white text-[11px] shadow"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={onRestart}
            className="px-2 py-1 rounded-lg bg-gray-200 text-gray-900 text-[11px] shadow"
          >
            Restart
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-2 left-3 right-3 h-1 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{
              width: `${
                ((scenes
                  .slice(0, idx)
                  .reduce((a, s) => a + (s.duration || 0), 0) +
                  sceneProgress * (current.duration || 0)) /
                  (totalDuration || 1)) *
                100
              }%`,
              transition: "width 120ms linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Simple overlay components
   ----------------------------- */

function EquationCard({ emphasis = false }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`px-10 py-8 rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow ${
          emphasis ? "animate-shake" : ""
        }`}
      >
        <p className="text-xl font-semibold text-gray-900">2(x+3) = 14</p>
      </div>
    </div>
  );
}

function BalanceScale() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="230" height="150" viewBox="0 0 230 150">
        <g stroke="#334155" strokeWidth="2" fill="none">
          <line x1="15" y1="135" x2="215" y2="135" />
          <line x1="115" y1="35" x2="115" y2="135" />
          <line x1="35" y1="90" x2="195" y2="90" />
          <line x1="60" y1="90" x2="60" y2="120" />
          <line x1="170" y1="90" x2="170" y2="120" />
          <rect x="40" y="118" width="40" height="18" rx="6" />
          <rect x="150" y="118" width="40" height="18" rx="6" />
        </g>
        <text x="60" y="110" textAnchor="middle" fontSize="12" fill="#111827">
          2(x+3)
        </text>
        <text x="170" y="110" textAnchor="middle" fontSize="12" fill="#111827">
          14
        </text>
      </svg>
    </div>
  );
}

function RuleCard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/85 text-indigo-800 shadow animate-fade-in">
        +3 → −3
      </div>
    </div>
  );
}

function ResultCard() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div className="px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50/90 text-emerald-700 shadow">
        x = 4 ✓
      </div>
      <div className="px-4 py-2 rounded-xl border border-gray-200 bg-white/85 text-gray-800 shadow text-sm">
        Ax+b=c → x=(c−b)/a
      </div>
    </div>
  );
}
