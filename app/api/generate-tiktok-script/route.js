// FILE: app/api/generate-tiktok-script/route.js
// PURPOSE: Generate beat-based scripts (30–45s) with SFX + camera hints.
// CHANGE: Enforces 30–45s, adds { beat, sfx, camera }, validates output.

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// System prompts
const getSystemPrompt = (contentType) => {
  switch (contentType) {
    case "topic_teaser":
      return `You are a viral TikTok educational storyteller.
Create a 30–45 second, non-interactive STORY-BASED explainer script.

Output MUST be a single JSON object with:
- "scenes": an array; each scene MUST include:
  - "text": on-screen caption (max 14 words)
  - "duration": integer seconds (1–6)
  - "beat": one of ["setup","problem","confusion","insight","solve","aha","wrap"]
  - "sfx": one of ["whoosh","ding","pop","none"]
  - "camera": short phrase for camera move (e.g., "gentle push-in")
- "meta": object with:
  - "requires3D": true
  - "style": "minimal, clean, vector-like with subtle 3D depth"
  - "notes": short tips for timing/easing

Rules:
- Total duration of scenes MUST be between 30 and 45 seconds.
- Language: punchy, visually suggestive, educational tone.
- Include at least one each: "problem", "insight", "solve", "aha".
- Keep captions concise and mobile-legible.
- Return JSON ONLY—no markdown or extra commentary.`;

    case "quick_quiz":
      return `You are a TikTok quiz master. Create:
{ "question": string, "options": [4 strings], "correctAnswer": string }`;

    case "exam_hack":
      return `You are a TikTok study coach. Create concise JSON:
{ "hook": string, "hack": string }`;

    default:
      throw new Error(
        `Invalid content type: ${contentType}. Supported: topic_teaser, quick_quiz, exam_hack`
      );
  }
};

export async function POST(request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { topic, contentType } = body;

    // Validate inputs
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required and must be a non-empty string." },
        { status: 400 }
      );
    }
    if (!contentType || typeof contentType !== "string") {
      return NextResponse.json(
        { error: "Content type is required and must be a string." },
        { status: 400 }
      );
    }
    if (topic.trim().length > 200) {
      return NextResponse.json(
        { error: "Topic must be less than 200 characters." },
        { status: 400 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json(
        {
          error:
            "OpenAI API is not configured. Please check server configuration.",
        },
        { status: 500 }
      );
    }

    const systemPrompt = getSystemPrompt(contentType);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create a beat-based TikTok explainer for: "${topic.trim()}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1200,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    let script;
    try {
      script = JSON.parse(raw);
    } catch (jsonError) {
      console.error("Failed to parse OpenAI response as JSON:", jsonError);
      console.error("OpenAI response content:", raw);
      return NextResponse.json(
        { error: "Failed to generate valid script format. Please try again." },
        { status: 500 }
      );
    }

    // Validate generated script
    if (contentType === "topic_teaser") {
      const scenes = script?.scenes;
      if (!Array.isArray(scenes) || scenes.length === 0) {
        return NextResponse.json(
          { error: "Generated script is missing scenes." },
          { status: 500 }
        );
      }
      const total = scenes.reduce(
        (sum, s) => sum + (Number(s?.duration) || 0),
        0
      );
      if (total < 30 || total > 45) {
        return NextResponse.json(
          {
            error: `Generated scenes total ${total}s, must be between 30 and 45 seconds. Try again.`,
          },
          { status: 500 }
        );
      }
      // Normalize fields
      script.scenes = scenes.map((s) => ({
        text: String(s?.text ?? "").slice(0, 120),
        duration: Math.max(1, Math.min(6, parseInt(s?.duration ?? 2))),
        beat: [
          "setup",
          "problem",
          "confusion",
          "insight",
          "solve",
          "aha",
          "wrap",
        ].includes(s?.beat)
          ? s.beat
          : "setup",
        sfx: ["whoosh", "ding", "pop", "none"].includes(s?.sfx)
          ? s.sfx
          : "none",
        camera: String(s?.camera || "hold").slice(0, 60),
      }));
      script.meta = {
        requires3D: true,
        style:
          script?.meta?.style || "minimal, clean, vector-like with subtle 3D",
        notes:
          script?.meta?.notes ||
          "One clear change per ~1s; smooth ease; captions legible.",
      };
    } else if (contentType === "quick_quiz") {
      if (
        !script?.question ||
        !Array.isArray(script?.options) ||
        !script?.correctAnswer
      ) {
        return NextResponse.json(
          { error: "Quiz missing fields." },
          { status: 500 }
        );
      }
    } else if (contentType === "exam_hack") {
      if (!script?.hook || !script?.hack) {
        return NextResponse.json(
          { error: "Exam hack missing fields." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      script,
      metadata: {
        topic: topic.trim(),
        contentType,
        generatedAt: new Date().toISOString(),
        model: "gpt-4o",
      },
    });
  } catch (error) {
    console.error("Error in generate-tiktok-script API:", error);
    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }
    if (error.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "OpenAI API configuration error." },
        { status: 500 }
      );
    }
    if (error.message && error.message.includes("Invalid content type")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to generate TikTok script." },
      { status: 500 }
    );
  }
}
