// FILE: app/api/questions/explain-marks/route.js
// -------------------------------------------------
// NEW - This AI-powered endpoint generates a likely mark allocation breakdown for a given question.
// It uses the question, solution, and total marks to provide exam technique insights.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { questionText, solutionText, marks } = await request.json();

    if (!questionText || !solutionText || !marks) {
      return NextResponse.json(
        { error: "Question, solution, and marks are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert South African CAPS curriculum examiner. Your task is to analyze a specific exam question and its official memorandum answer to predict the mark allocation.

      CRITICAL RULES:
      1.  You will be given the question, the final answer, and the total marks.
      2.  Based on this, you must deduce the most logical step-by-step breakdown of how an examiner would award those marks.
      3.  Your response MUST be a JSON object with a single key, "breakdown", which is an array of strings.
      4.  Each string in the array should represent one point in the marking process.
      5.  Do not add any conversational text. Only output the raw JSON.

      Example Input:
      Question: "Solve for x in the equation 2x - 3 = -7"
      Solution: "x = -2"
      Marks: 3

      Example Output:
      {
        "breakdown": [
          "1 mark for adding 3 to both sides.",
          "1 mark for simplifying to 2x = -4.",
          "1 mark for the final answer of x = -2."
        ]
      }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Question: "${questionText}"\nSolution: "${solutionText}"\nMarks: ${marks}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating mark explanation:", error.message);
    return NextResponse.json(
      { error: "Failed to generate mark explanation." },
      { status: 500 }
    );
  }
}

