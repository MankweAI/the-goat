// FILE: app/api/generate-objective-details/route.js
// -------------------------------------------------
// NEW & FINAL - This single, powerful API generates the entire learning experience
// (lesson script, blueprint, and challenges) for an objective in one go.
// This is a much more robust and reliable architecture.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objective } = await request.json(); // Pass the whole objective object
    const isHomework = objective.type === "homework";

    const challengeInstructions = isHomework
      ? `The "challenges" key MUST be an ARRAY containing a SINGLE multiple-choice question object based on the objective's title. This object MUST have "question" (string) and "options" (an array of OBJECTS, each with "text" and "isCorrect").`
      : `The "challenges" key MUST be an OBJECT containing THREE distinct MCQs for "easy", "medium", and "hard" levels. Each MCQ object must have "question" and "options" (an array of OBJECTS, each with "text" and "isCorrect").`;

    const systemPrompt = `You are an expert tutor and instructional designer using the "Guided Discovery" method. Your task is to create a complete, interactive learning module for a single objective.

      You MUST generate a single JSON object containing three keys: "discovery_script", "blueprint", and "challenges".

      1.  **discovery_script**:
          - This MUST be an array of interactive steps.
          - Every step MUST have a "reveal", "prompt", and an "options" array (of {text, isCorrect} objects).
          - The first step must be a "Roadmap" outlining the concepts.
          - Each subsequent step is a mini-lesson that ends with a "Why It Matters" sentence connecting it to the user's goal.

      2.  **blueprint**:
          - This must be an object with a "title" and a "summary" of the concepts taught.

      3.  **challenges**:
          - This part is critical. Its structure depends on the objective's type.
          - ${challengeInstructions}

      Use a friendly, simple, South African persona. Output only the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `The learning objective is: "${objective.title}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating objective details:", error.message);
    return NextResponse.json(
      { error: "Failed to generate lesson and challenge." },
      { status: 500 }
    );
  }
}
