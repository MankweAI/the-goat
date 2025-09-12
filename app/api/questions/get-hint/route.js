// FILE: app/api/questions/get-hint/route.js
// -------------------------------------------------
// NEW - This API provides a single, contextual hint for a question without revealing the solution.
// It's designed to overcome a student's initial block and maintain study momentum.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { questionText } = await request.json();
    if (!questionText) {
      return NextResponse.json(
        { error: "Question text is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a helpful tutor. A student is stuck on a question and needs a small hint.
      CRITICAL RULES:
      1. Provide a single, concise hint to get them started.
      2. DO NOT solve the problem or give away the answer.
      3. Your response must be a JSON object with one key: "hint".
      
      Example:
      Question: "Solve for x: x^2 - 5x + 6 = 0"
      Your Output: { "hint": "Try to find two numbers that multiply to 6 and add up to -5." }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Question: "${questionText}"` },
      ],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error("Error generating hint:", error.message);
    return NextResponse.json(
      { error: "Failed to generate hint." },
      { status: 500 }
    );
  }
}
