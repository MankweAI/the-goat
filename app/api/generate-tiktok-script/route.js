// FILE: app/api/generate-tiktok-script/route.js
// -------------------------------------------------
// FIXED - Enhanced error handling and logging for better debugging
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhanced system prompts for each content type
const getSystemPrompt = (contentType) => {
  switch (contentType) {
    case "topic_teaser":
      return `You are a viral TikTok video scriptwriter. Create a script for a 15-second "Topic Teaser" video.
        The output MUST be a JSON object with a "scenes" array. Each scene object must have "text" (max 15 words) and "duration" in seconds.
        The total duration must not exceed 15 seconds. Make the text punchy and engaging. Start with a strong hook.
        
        Example: { "scenes": [ { "text": "Master Photosynthesis in 15 seconds!", "duration": 3 }, { "text": "Plants need sunlight, water, and CO2!", "duration": 4 } ] }`;

    case "quick_quiz":
      return `You are a TikTok quiz master. Create a script for a "Quick Quiz" video.
        The output MUST be a JSON object with a "question" string, "options" array of 4 strings, and "correctAnswer" string.
        
        Example: { "question": "What is the powerhouse of the cell?", "options": ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"], "correctAnswer": "Mitochondria" }`;

    case "exam_hack":
      return `You are a TikTok study coach. Create a script for an "Exam Hack" video.
        The output MUST be a JSON object with "hook" and "hack" strings. Keep concise and impactful.
        
        Example: { "hook": "Struggling with quadratic equations?", "hack": "Remember: x = [-b ± √(b²-4ac)] / 2a. Practice this formula daily!" }`;

    default:
      throw new Error(
        `Invalid content type: ${contentType}. Supported: topic_teaser, quick_quiz, exam_hack`
      );
  }
};

export async function POST(request) {
  try {
    // Validate request body
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

    // Validate required fields
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

    console.log(`📝 Generating ${contentType} script for topic: "${topic}"`);

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json(
        { error: "OpenAI API is not configured properly." },
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
          content: `Create an engaging TikTok script for the topic: "${topic}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const scriptContent = completion.choices[0].message.content;

    let script;
    try {
      script = JSON.parse(scriptContent);
    } catch (jsonError) {
      console.error("Failed to parse OpenAI response as JSON:", jsonError);
      console.error("OpenAI response content:", scriptContent);
      return NextResponse.json(
        { error: "Failed to generate valid script format." },
        { status: 500 }
      );
    }

    console.log(
      `✅ Successfully generated ${contentType} script for "${topic}"`
    );

    return NextResponse.json({
      script,
      metadata: {
        topic,
        contentType,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in generate-tiktok-script API:", error);

    // Handle specific OpenAI errors
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

    return NextResponse.json(
      {
        error: "Failed to generate TikTok script.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
