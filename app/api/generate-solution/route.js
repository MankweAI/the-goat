// FILE: app/api/generate-solution/route.js
// -------------------------------------------------
// NEW - This API generates a detailed, step-by-step solution
// for a specific homework question.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objective } = await request.json();

    if (!objective || !objective.title) {
      return NextResponse.json(
        { error: "Objective title is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert tutor. A student has just completed an interactive lesson on the concepts behind their homework question. Your task is to provide a final, clear, step-by-step solution to their original question.

      CRITICAL RULES:
      1.  The user's original question is provided in the learning objective title.
      2.  Your response must be a detailed, step-by-step walkthrough of how to arrive at the final answer.
      3.  Format the solution for maximum readability. Use simple Markdown with bold headings (e.g., *Step 1: Isolate the Variable*) and bullet points (e.g., "- First, we add 9 to both sides...").
      4.  Conclude with a clear final answer (e.g., "*Final Answer: The vertical asymptotes are x = 3 and x = -3.*").

      The output must be a JSON object with a single key: "solutionText".
      Output ONLY the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a step-by-step solution for this objective: "${objective.title}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating solution:", error.message);
    return NextResponse.json(
      { error: "Failed to generate solution." },
      { status: 500 }
    );
  }
}
