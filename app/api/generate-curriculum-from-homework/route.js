// FILE: app/api/generate-curriculum-from-homework/route.js
// -------------------------------------------------
// BUG FIX - The prompt is now much more specific, forcing the AI
// to create separate, well-titled objectives for each sub-question (e.g., 4.1, 4.2).
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const textInput = formData.get("textInput"); // This contains the specific question selected by the user.

    if (!textInput) {
      return NextResponse.json(
        { error: "No question provided to break down." },
        { status: 400 }
      );
    }

    // NEW, MORE ADVANCED PROMPT WITH BUG FIX LOGIC
    const systemPrompt = `You are an expert tutor. Your task is to analyze a single homework question the user has selected. This question may contain multiple sub-questions (e.g., 4.1, 4.2). You must break it down into a step-by-step curriculum of learning objectives.

      CRITICAL RULES:
      1.  You MUST treat each sub-question (like 4.1, 4.2, etc.) as its own, separate learning objective. Do NOT group them into one objective.
      2.  For each sub-question, create an object for the "curriculum" array.
      3.  Each object MUST have three keys:
          - "id": A unique identifier (e.g., "hw_q4_1").
          - "title": A learning goal that directly addresses the sub-question. It should start with "Learn how to...". For example, for "4.1 Show that the height is 7,5 cm", the title should be "Learn how to find the pyramid's perpendicular height". DO NOT include the question number like "(for Q4.1)" in the title.
          - "type": This must ALWAYS be the string "homework".
      4.  If the main question has no sub-questions, then create a single objective for the entire question.
      
      The final output must be a JSON object with a single key "curriculum", which is an array of these objective objects.
      Output ONLY the raw JSON.`;

    const userContent = [
      {
        type: "text",
        text: `The user has selected this question to work on: "${textInput}"`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error(
      "Error generating granular curriculum from homework:",
      error.message
    );
    return NextResponse.json(
      { error: "Failed to generate detailed curriculum." },
      { status: 500 }
    );
  }
}
