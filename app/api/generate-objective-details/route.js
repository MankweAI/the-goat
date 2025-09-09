// FILE: app/api/generate-objective-details/route.js
// -------------------------------------------------
// BUG FIX - The prompt now strictly commands the AI to use the user's
// original question (the objective.title) as the challenge question verbatim.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objective } = await request.json();
    const isHomework = objective.type === "homework";

    // ### THIS IS THE FIX ###
    const challengeInstructions = isHomework
      ? `The "challenges" key MUST be an ARRAY containing a SINGLE multiple-choice question object. For this object, the "question" key MUST be the EXACT, VERBATIM text from the user's learning objective, which is: "${objective.title}". Then, create plausible multiple-choice "options" for it.`
      : `The "challenges" key MUST be an OBJECT containing THREE distinct MCQs for "easy", "medium", and "hard" levels. Each MCQ object must have "question" and "options" (an array of OBJECTS, each with "text" and "isCorrect").`;

    const systemPrompt = `You are an expert tutor and instructional designer using the "Guided Discovery" method. Your persona is a fun, friendly, and encouraging South African friend. Your task is to create a complete, interactive learning module for a single objective.

      You MUST generate a single JSON object containing three keys: "discovery_script", "blueprint", and "challenges".

      1.  **discovery_script**:
          - This MUST be an array of interactive steps.
          - Every step MUST have a "reveal", "prompt", and an "options" array (of {text, isCorrect} objects).
          - The first step must be a "Roadmap" outlining the concepts. Its "options" array must be: [{ "text": "Let's go!", "isCorrect": true }]
          - Each subsequent step is a mini-lesson that ends with a "Why It Matters" sentence.

      2.  **blueprint**:
          - This must be an object with a "title" and a "summary" formatted with simple Markdown (bold headings and bullet points).

      3.  **challenges**:
          - Adhere to these specific instructions: ${challengeInstructions}

      Use a friendly, South African persona with relevant emojis. Output only the raw JSON.`;

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
