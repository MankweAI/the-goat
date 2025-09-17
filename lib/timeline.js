// Build a simple timeline JSON for later rendering (not used for video now)
export function buildTimeline(script, topic) {
  const timeline = [];
  let t = 0;

  // Hook
  timeline.push({
    type: "hook",
    start: t,
    duration: 5,
    text: script.hook,
    safeZones: true,
  });
  t += 5;

  // Lessons
  (script.mini_lessons || []).forEach((l, idx) => {
    const d = Math.max(20, Math.min(30, Math.round(l.duration || 24)));
    timeline.push({
      type: "lesson",
      index: idx,
      start: t,
      duration: d,
      title: l.title,
      content: l.content,
      key_point: l.key_point,
      safeZones: true,
    });
    t += d;
  });

  // Quiz: allocate ~10s per question
  (script.mcq_progression || []).forEach((q, idx) => {
    const d = 10;
    timeline.push({
      type: "mcq",
      index: idx,
      start: t,
      duration: d,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty,
      explanation: q.explanation,
      safeZones: true,
    });
    t += d;
  });

  // Summary ~15s
  const summaryDur = 15;
  timeline.push({
    type: "summary",
    start: t,
    duration: summaryDur,
    summary: script.summary,
    safeZones: true,
  });
  t += summaryDur;

  return {
    topic,
    totalDuration: t,
    scenes: timeline,
    generatedAt: new Date().toISOString(),
  };
}

export function suggestCaptionAndTags(topic) {
  const base = `Master ${topic} in 2 minutes`;
  const tags = [
    "#learn",
    "#study",
    "#education",
    "#fyp",
    "#tips",
    "#" +
      topic
        .split(/\s+/)[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""),
  ];
  return { caption: base, hashtags: tags };
}

