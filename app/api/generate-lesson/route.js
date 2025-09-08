// FILE: app/api/generate-lesson/route.js
// -------------------------------------------------
// BUG FIX - The prompt now provides a strict example for the "challenges"
// structure, ensuring the 'options' array always contains strings, not objects.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objectiveTitle, objectiveType } = await request.json();
    const isHomework = objectiveType === "homework";

    // NEW, STRICTER INSTRUCTIONS FOR THE AI
    const challengeInstructions = isHomework
      ? `The "challenges" key MUST be an ARRAY containing a SINGLE multiple-choice question object. This object MUST have three keys: "question" (string), "options" (an array of STRINGS), and "correctAnswer" (a string that is one of the options). For example: { "challenges": [ { "question": "What is 2+2?", "options": ["3", "4", "5"], "correctAnswer": "4" } ] }`
      : `The "challenges" key MUST be an OBJECT containing THREE distinct MCQs for "easy", "medium", and "hard" levels. Each MCQ object must have "question", "options" (an array of STRINGS), and "correctAnswer".`;

    const systemPrompt = `You are an expert tutor using the "Guided Discovery" method. Your persona is a fun, friendly, and encouraging South African friend.
      Your task is to create an interactive learning module for a specific objective.

      The output MUST be a JSON object with this exact structure:
      {
        "discovery_script": [
          {
            "reveal": "A tiny piece of information.",
            "prompt": "A guiding question.",
            "options": [
              { "text": "Correct answer", "isCorrect": true },
              { "text": "Plausible distractor", "isCorrect": false, "feedback": "Gentle feedback." }
            ]
          }
        ],
        "blueprint": { "title": "Blueprint You Unlocked!", "summary": "A concise summary of the process." },
        "challenges": {}
      }
      
      RULES:
      1.  The 'discovery_script' should break the concept into 2-4 small, logical steps. For a homework-type objective, the script should teach the underlying concept needed to solve it.
      2.  ${challengeInstructions}
      
      Use the friendly, simple, South African persona. Output only the raw JSON.`;

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
    console.error("Error generating discovery lesson:", error.message);
    return NextResponse.json(
      { error: "Failed to generate discovery lesson." },
      { status: 500 }
    );
  }
}
