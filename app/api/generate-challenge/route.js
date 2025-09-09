// FILE: app/api/generate-challenge/route.js
// -------------------------------------------------
// DEBUGGING - Added console.log to see the raw AI response in the terminal.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objectiveTitle, objectiveType } = await request.json();
    const isHomework = objectiveType === "homework";

    const challengeInstructions = isHomework
      ? `The output JSON MUST be an ARRAY containing a SINGLE multiple-choice question object. This object MUST have "question" (string), "options" (an array of OBJECTS, each with "text" and "isCorrect"). For example: [ { "question": "What is 2+2?", "options": [{"text": "3", "isCorrect": false}, {"text": "4", "isCorrect": true}], } ]`
      : `The output JSON MUST be an OBJECT containing THREE distinct MCQs for "easy", "medium", and "hard" levels. Each MCQ object must have "question" and "options" (an array of OBJECTS, each with "text" and "isCorrect").`;

    const systemPrompt = `You are an expert tutor. Your task is to create a set of challenges for a specific learning objective.

      CRITICAL RULES:
      1.  Analyze the objective and generate only the challenges.
      2.  ${challengeInstructions}
      3.  The final output must be ONLY the raw JSON for the challenges (either an array for homework or an object for mastery). Do not wrap it in any other keys.
      
      Use a friendly, simple, South African persona in the question text.`;

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

    // ### THIS IS THE DEBUGGING LINE ###
    // It will print the raw text from the AI to your server's terminal.
    console.log("--- RAW AI RESPONSE FOR CHALLENGE ---");
    console.log(responseText);
    console.log("------------------------------------");

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating challenge:", error.message);
    return NextResponse.json(
      { error: "Failed to generate challenge." },
      { status: 500 }
    );
  }
}
