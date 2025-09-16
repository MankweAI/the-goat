import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You create a 2-minute "Topic Mastery" learning journey.
Return a single JSON object (no markdown, no extra text) with:
- "mini_lessons": 3-4 items. Each: { "title": string, "content": string, "key_point": string, "duration": number (20-30) }
- "mcq_progression": 6 items (2 "easy", 2 "medium", 2 "difficult"). Each:
  { "question": string, "options": string[4], "correct_answer": string, "difficulty": "easy"|"medium"|"difficult", "explanation": string }
- "summary": { "key_points": string[3-6], "practical_application": string, "next_steps": string }

Keep explanations concise and accurate. Ensure valid JSON.
`;

function validate(payload) {
  if (!payload || typeof payload !== "object")
    return "Response is not an object";
  const { mini_lessons, mcq_progression, summary } = payload;

  if (!Array.isArray(mini_lessons) || mini_lessons.length < 3)
    return "mini_lessons must be an array of at least 3 items";
  for (const l of mini_lessons) {
    if (
      !l ||
      typeof l.title !== "string" ||
      typeof l.content !== "string" ||
      typeof l.key_point !== "string" ||
      typeof l.duration !== "number"
    )
      return "Each mini_lesson must have title, content, key_point, duration";
  }

  if (!Array.isArray(mcq_progression) || mcq_progression.length !== 6)
    return "mcq_progression must have exactly 6 questions";
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
      return "Each MCQ must have question, 4 options, correct_answer, difficulty, explanation";
  }

  if (
    !summary ||
    !Array.isArray(summary.key_points) ||
    summary.key_points.length < 3 ||
    typeof summary.practical_application !== "string" ||
    typeof summary.next_steps !== "string"
  )
    return "summary must include key_points[3+], practical_application, next_steps";

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
        { error: "OPENAI_API_KEY is not configured." },
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
      max_tokens: 1200,
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      return NextResponse.json(
        { error: "Model returned invalid JSON." },
        { status: 502 }
      );
    }

    const v = validate(data);
    if (v) {
      return NextResponse.json({ error: v }, { status: 422 });
    }

    return NextResponse.json({ script: data, topic: topic.trim() });
  } catch (err) {
    console.error("Topic Mastery API error:", err);
    return NextResponse.json(
      { error: "Failed to generate Topic Mastery." },
      { status: 500 }
    );
  }
}


