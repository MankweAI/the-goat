// FILE: app/api/generate-solution/route.js
// -------------------------------------------------
// UPGRADED - The AI now returns a structured JSON object for the solution,
// separating each step into a title, explanation, formula, and result. This is far more robust.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objective } = await request.json();

    if (!objective || !objective.originalText) {
      return NextResponse.json(
        { error: "Original question text is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert tutor providing a final, definitive solution to a student's homework question. Your task is to break the solution down into a structured JSON format.

      CRITICAL RULES:
      1.  The user's original question is provided. Your entire solution must DIRECTLY and CONCISELY answer this specific question.
      2.  Do NOT invent hypothetical scenarios. Use only the information given in the question to construct your solution.
      3.  ALL mathematical expressions MUST be wrapped in standard LaTeX delimiters ($...$ for inline, \\\\[ ... \\\\] for block).
      4.  The final output MUST be a JSON object with a single key "solution".
      5.  The "solution" object must contain three keys:
          - "given": A string summarizing the given information.
          - "steps": An array of objects, where each object represents one step of the solution and has keys for "title", "explanation", "formula", and "result". The "result" should only be the mathematical outcome.
          - "finalAnswer": A string containing the final, clear answer.

      Example for "2x - 3 = -7":
      {
        "solution": {
          "given": "The equation is $2x - 3 = -7$.",
          "steps": [
            { "title": "Step 1: Isolate the x term", "explanation": "Add 3 to both sides of the equation.", "formula": "2x - 3 + 3 = -7 + 3", "result": "2x = -4" },
            { "title": "Step 2: Solve for x", "explanation": "Divide both sides by 2.", "formula": "\\\\frac{2x}{2} = \\\\frac{-4}{2}", "result": "x = -2" }
          ],
          "finalAnswer": "The solution is $x = -2$."
        }
      }

      Output ONLY the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a structured JSON solution for this question: "${objective.originalText}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating structured solution:", error.message);
    return NextResponse.json(
      { error: "Failed to generate structured solution." },
      { status: 500 }
    );
  }
}
