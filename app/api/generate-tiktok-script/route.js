// FILE: app/api/generate-tiktok-script/route.js
// -------------------------------------------------
// NEW - This API generates a structured JSON script for a TikTok video
// based on a given topic and content type. It's the first step in the
// video creation process.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// This function contains the different AI prompts for each video type.
const getSystemPrompt = (contentType) => {
  switch (contentType) {
    case "topic_teaser":
      return `You are a viral TikTok video scriptwriter. Create a script for a 15-second "Topic Teaser" video.
        The output MUST be a JSON object with a "scenes" array. Each scene object must have "text" (max 15 words) and "duration" in seconds.
        The total duration must not exceed 15 seconds. Make the text punchy and engaging. Start with a strong hook.
        
        Example: { "scenes": [ { "text": "Master Photosynthesis in 15 seconds!", "duration": 3 }, { "text": "Plants need food...", "duration": 2 } ] }`;

    case "quick_quiz":
      return `You are a TikTok quiz master. Create a script for a "Quick Quiz" video.
        The output MUST be a JSON object with a "question" string, and an "options" array of 4 strings, and a "correctAnswer" string (which must be one of the options).
        
        Example: { "question": "What is the powerhouse of the cell?", "options": ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"], "correctAnswer": "Mitochondria" }`;

    case "exam_hack":
      return `You are a TikTok study coach. Create a script for an "Exam Hack" video.
        The output MUST be a JSON object with a "hook" (the common mistake or trap) and a "hack" (the solution or tip). Keep the text concise and impactful.
        
        Example: { "hook": "Struggling with quadratic equations?", "hack": "Remember the quadratic formula: x = [-b ± sqrt(b^2 - 4ac)] / 2a. It's a lifesaver!" }`;

    default:
      throw new Error("Invalid content type");
  }
};

export async function POST(request) {
  try {
    const { topic, contentType } = await request.json();

    if (!topic || !contentType) {
      return NextResponse.json(
        { error: "Topic and content type are required." },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt(contentType);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `The topic is: "${topic}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const script = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json({ script });
  } catch (error) {
    console.error("Error generating TikTok script:", error.message);
    return NextResponse.json(
      { error: "Failed to generate video script." },
      { status: 500 }
    );
  }
}

