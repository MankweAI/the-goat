import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You create a 2-minute "Topic Mastery" learning journey for short-form video.

Return ONLY a single JSON object (no markdown, no extra text) with keys:
- "hook": string (a 3–10 word attention-grabbing line; no hashtags; no emojis)
- "mini_lessons": array of 3-4 items. Each item:
  { "title": string, "content": string, "key_point": string, "duration": number } 
  - duration: number of seconds in [20, 30]
  - content: concise and simple (1-3 short sentences)
- "mcq_progression": array of exactly 6 items (2 "easy", 2 "medium", 2 "difficult"). Each:
  { "question": string, "options": string[4], "correct_answer": string, "difficulty": "easy"|"medium"|"difficult", "explanation": string }
  - question: clear and short
  - explanation: max ~160 characters, one sentence if possible
- "summary": {
    "key_points": array of 3-5 short bullet strings,
    "practical_application": string (<= 140 chars),
    "next_steps": string (<= 140 chars)
  }

Constraints:
- Use simple, readable language targeting Grade 8–10.
- Keep line lengths short to fit mobile captions (<= ~36 chars line ideally).
- Ensure valid JSON and consistent fields.
`;

function validate(payload) {
  if (!payload || typeof payload !== "object")
    return "Response is not an object";
  const { hook, mini_lessons, mcq_progression, summary } = payload;

  if (typeof hook !== "string" || !hook.trim() || hook.length > 80)
    return "hook must be a short string (<= 80 chars)";

  if (
    !Array.isArray(mini_lessons) ||
    mini_lessons.length < 3 ||
    mini_lessons.length > 4
  )
    return "mini_lessons must be an array of 3-4 items";
  for (const l of mini_lessons) {
    if (
      !l ||
      typeof l.title !== "string" ||
      typeof l.content !== "string" ||
      typeof l.key_point !== "string" ||
      typeof l.duration !== "number" ||
      l.duration < 18 ||
      l.duration > 35
    )
      return "Each mini_lesson must have title, content, key_point, duration(18-35)";
    if (l.content.length > 300) return "Lesson content too long";
  }

  if (!Array.isArray(mcq_progression) || mcq_progression.length !== 6)
    return "mcq_progression must have exactly 6 questions";
  const diffs = mcq_progression.map((q) => q?.difficulty);
  const count = (d) => diffs.filter((x) => x === d).length;
  if (count("easy") !== 2 || count("medium") !== 2 || count("difficult") !== 2)
    return "mcq_progression must have 2 easy, 2 medium, 2 difficult";
  for (const q of mcq_progression) {
    if (
      !q ||
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correct_answer !== "string" ||
      !["easy", "medium", "difficult"].includes(q.difficulty) ||
      typeof q.explanation !== "string"
    )
      return "Invalid MCQ item shape";
    if (q.explanation.length > 240) return "MCQ explanation too long";
  }

  if (
    !summary ||
    !Array.isArray(summary.key_points) ||
    summary.key_points.length < 3 ||
    summary.key_points.length > 5 ||
    typeof summary.practical_application !== "string" ||
    typeof summary.next_steps !== "string"
  )
    return "Invalid summary shape";
  if (summary.practical_application.length > 180)
    return "practical_application too long";
  if (summary.next_steps.length > 180) return "next_steps too long";

  return null;
}

export async function POST(req) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required and must be a non-empty string." },
        { status: 400 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured." },
        { status: 500 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create Topic Mastery for: "${topic.trim()}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1400,
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    let data;
    try {
      data = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON." },
        { status: 502 }
      );
    }

    const v = validate(data);
    if (v) return NextResponse.json({ error: v }, { status: 422 });

    return NextResponse.json({ script: data, topic: topic.trim() });
  } catch (err) {
    console.error("Topic Mastery API error:", err);
    return NextResponse.json(
      { error: "Failed to generate Topic Mastery." },
      { status: 500 }
    );
  }
}
