// FILE: app/api/generate-objective-details/route.js
// -------------------------------------------------
// RE-ARCHITECTED - The lesson generation logic is now more sophisticated.
// For each lesson step, the AI now generates the core lesson, an array of
// simpler examples, and includes a special "isHelpRequest" option in the MCQs.
// This allows the frontend to cycle through explanations if a user is stuck.
// ENHANCED - The AI is now instructed to generate exactly 3 examples, providing
// the user with a total of 4 different explanations (1 main + 3 examples).
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objective } = await request.json();
    const isHomework = objective.type === "homework";

    const challengeInstructions = isHomework
      ? `The "challenges" key MUST be an ARRAY containing a SINGLE multiple-choice question object. For this object, the "question" key MUST be the EXACT, VERBATIM text from the user's learning objective, which is: "${objective.title}". Then, create plausible multiple-choice "options" for it.`
      : `The "challenges" key MUST be an OBJECT containing THREE distinct MCQs for "easy", "medium", and "hard" levels. Each MCQ object must have "question" and "options" (an array of OBJECTS, each with "text" and "isCorrect").`;

    const systemPrompt = `You are an expert tutor and instructional designer. Your task is to create a complete, interactive learning module with a friendly, encouraging South African persona.

      You MUST generate a single JSON object with "discovery_script", "blueprint", and "challenges".

      1.  **discovery_script**: An array of interactive steps.
          - The VERY FIRST step is a "Roadmap" outlining the concepts. Its options array MUST be: [{ "text": "Let's go!", "isCorrect": true }]
          - Each subsequent step MUST have these keys:
              a. **"reveal"**: The main teaching content for the concept. Must end with "Why It Matters...".
              b. **"examples"**: An array of EXACTLY 3 unique, super-simple, casual examples of the concept, as strings. Each should be suitable for a student two grades younger and start with a friendly phrase like "Ok, let's try another way:".
              c. **"prompt"**: The question to check understanding.
              d. **"options"**: An array of MCQ option objects.
                 - Include 2-3 regular options, each with "text" and "isCorrect" keys.
                 - CRITICALLY, you MUST also include this exact option object: { "text": "I don't understand, can you explain it differently?", "isCorrect": false, "isHelpRequest": true }.

      2.  **blueprint**: An object with a "title" and a "summary".
      3.  **challenges**: Adhere to these instructions: ${challengeInstructions}

      Output only the raw JSON.`;

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
