// FILE: app/api/questions/check-answer/route.js
// -------------------------------------------------
// NEW - This API intelligently validates a student's answer against the official memo.
// It can understand mathematical equivalences (e.g., x=0.5 vs x=1/2).
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { userAnswer, correctAnswer } = await request.json();
    if (userAnswer === undefined || correctAnswer === undefined) {
      return NextResponse.json(
        { error: "User answer and correct answer are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert math examiner. A student has submitted an answer. Compare it to the correct answer from the memo.
      CRITICAL RULES:
      1. Determine if the student's answer is correct, incorrect, or partially correct.
      2. Be mindful of mathematical equivalence (e.g., 1/2 is the same as 0.5; x=2, y=3 is the same as y=3, x=2).
      3. Provide brief, encouraging feedback.
      4. Your response MUST be a JSON object with two keys: "status" ('correct', 'incorrect', or 'close') and "feedback".
      
      Example 1:
      User Answer: "x = 0.5"
      Correct Answer: "x = 1/2"
      Your Output: { "status": "correct", "feedback": "Spot on! Well done." }

      Example 2:
      User Answer: "15"
      Correct Answer: "-15"
      Your Output: { "status": "close", "feedback": "You're very close! Just double-check your signs." }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Student's Answer: "${userAnswer}"\nCorrect Answer: "${correctAnswer}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error("Error checking answer:", error.message);
    return NextResponse.json(
      { error: "Failed to check answer." },
      { status: 500 }
    );
  }
}


