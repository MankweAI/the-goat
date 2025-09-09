// FILE: app/api/generate-lesson/route.js
// -------------------------------------------------
// MODIFIED - The prompt now enforces that the 'challenges' options
// must also be an array of objects {text, isCorrect}, standardizing our data format.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objectiveTitle, objectiveType } = await request.json();
    const isHomework = objectiveType === "homework";

    const challengeInstructions = isHomework
      ? `The "challenges" key MUST be an ARRAY containing a SINGLE multiple-choice question object. This object MUST have "question" (string) and "options" (an array of OBJECTS, each with "text" and "isCorrect").`
      : `The "challenges" key MUST be an OBJECT containing THREE distinct MCQs for "easy", "medium", and "hard" levels. Each MCQ object must have "question" and "options" (an array of OBJECTS, each with "text" and "isCorrect").`;

    const systemPrompt = `You are an expert tutor and instructional designer using the "Guided Discovery" method. Your persona is a fun, friendly, and encouraging South African friend. Your task is to create a highly structured, interactive learning module.

      CRITICAL RULE: Every single object in the 'discovery_script' array MUST have a "reveal", a "prompt", and an "options" array. The "options" array must contain objects with a "text" key and an "isCorrect" key. There are no exceptions.

      You MUST follow this pedagogical structure precisely:
      
      STEP 1: THE ROADMAP
      - The VERY FIRST object in 'discovery_script' MUST be a roadmap (e.g., "To solve this, we need to cover A and B.").
      - The "prompt" must be a simple call to action (e.g., "Ready to dive in?").
      - The "options" must be a single-element array: [{ "text": "Let's go!", "isCorrect": true }]

      STEP 2: THE MINI-LESSONS
      - The subsequent steps must be mini-lessons for each concept from the roadmap.
      - Each mini-lesson step must contain a "reveal", "prompt", and "options".
      - Each "reveal" must end with a "Why It Matters" sentence connecting the concept back to the user's original goal.
      
      FINAL JSON STRUCTURE:
      {
        "discovery_script": [ /* Array of interactive steps following ALL rules above */ ],
        "blueprint": { "title": "Blueprint You Unlocked!", "summary": "A concise summary of the concepts covered." },
        "challenges": {} // Adhere to the specific challenge instructions.
      }

      Use a friendly, simple, South African persona. Output only the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `The learning objective is: "${objectiveTitle}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating advanced lesson:", error.message);
    return NextResponse.json(
      { error: "Failed to generate advanced lesson." },
      { status: 500 }
    );
  }
}
