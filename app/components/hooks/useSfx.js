// FILE: app/components/hooks/useSfx.js
// PURPOSE: Minimal WebAudio-based sound effects (whoosh, ding, pop) without external assets.
// USAGE:
// const { playWhoosh, playDing, playPop, ensureUnlocked, unlocked } = useSfx();
// - Click the "Enable Sound" button (or any user gesture) to unlock audio.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function useSfx() {
  const ctxRef = useRef(null);
  const [unlocked, setUnlocked] = useState(false);

  const ensureUnlocked = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    setUnlocked(true);
  }, []);

  useEffect(() => {
    const handler = () => ensureUnlocked();
    window.addEventListener("pointerdown", handler, { once: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, [ensureUnlocked]);

  const playTone = useCallback(
    (freq = 440, duration = 0.15, type = "sine", gain = 0.05) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g).connect(ctx.destination);
      const now = ctx.currentTime;
      osc.start(now);
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.stop(now + duration + 0.02);
    },
    []
  );

  const playWhoosh = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize); // decay
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.value = 0.08;
    noise.connect(filter).connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    noise.start(now);
    noise.stop(now + 0.32);
  }, []);

  const playDing = useCallback(() => {
    playTone(880, 0.12, "sine", 0.06);
    setTimeout(() => playTone(1320, 0.1, "sine", 0.05), 90);
  }, [playTone]);

  const playPop = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    g.gain.value = 0.07;
    osc.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
  }, []);

  return { playWhoosh, playDing, playPop, ensureUnlocked, unlocked };
}
