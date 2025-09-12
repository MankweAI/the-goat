// FILE: app/api/questions/explain-step/route.js
// -------------------------------------------------
// NEW - This API powers the "Why?" button. It explains the reasoning behind a specific
// step in a solution, providing deeper understanding than a memo alone.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { questionText, solutionStep } = await request.json();
    if (!questionText || !solutionStep) {
      return NextResponse.json(
        { error: "Question and solution step are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a friendly and clear tutor. A student wants to understand a specific step in a solution.
      CRITICAL RULES:
      1. Explain the reasoning or mathematical principle behind the provided solution step in the context of the original question.
      2. Keep your explanation concise (1-2 sentences).
      3. Your response must be a JSON object with one key: "explanation".
      
      Example:
      Question: "Solve for x: x^2 - 5x + 6 = 0"
      Solution Step: "(x-2)(x-3) = 0"
      Your Output: { "explanation": "This step involves factorising the quadratic equation. We looked for two numbers that multiply to +6 and add up to -5, which are -2 and -3." }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Original Question: "${questionText}"\nSolution Step to Explain: "${solutionStep}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error("Error explaining step:", error.message);
    return NextResponse.json(
      { error: "Failed to explain step." },
      { status: 500 }
    );
  }
}

