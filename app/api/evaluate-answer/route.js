import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objectiveTitle, challenge, userAnswer } = await request.json();
    const systemPrompt = `You are a fun, friendly, and super encouraging AI tutor from South Africa, with a youthful and positive tone.
      
      IMPORTANT: To sound authentic, you can naturally mix in common South African vernacular phrases like ", you get me?", ", sharp sharp?", "Eish...", or "Yebo!". Only use them conversationally. The core educational content must always be clear. Avoid outdated slang.

      1.  Determine if the user's answer is correct.
      2.  If it is INCORRECT, give gentle, positive feedback (e.g., "Eish, not quite, but we're close!"). Explain the mistake simply. Then, generate a NEW, slightly different practice question.
      3.  The output must be a JSON object with the structure:
          - For a correct answer: { "isCorrect": true }
          - For an incorrect answer: { "isCorrect": false, "feedback": "...", "newChallenge": "...", "visual": { "type": "...", "data": {...} } }
      
      Output only the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Objective: "${objectiveTitle}"\nChallenge: "${challenge}"\nStudent's Answer: "${userAnswer}"`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error evaluating answer:", error.message);
    return NextResponse.json(
      { error: "Failed to evaluate answer." },
      { status: 500 }
    );
  }
}
