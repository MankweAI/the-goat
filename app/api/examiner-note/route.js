// FILE: app/api/questions/examiner-note/route.js
// -------------------------------------------------
// NEW - This AI-powered endpoint generates an "Examiner's Note".
// It provides high-level insight into a question's design, common traps, or the core concept being tested.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { questionText, solutionText, marks, topic } = await request.json();

    if (!questionText || !solutionText) {
      return NextResponse.json(
        { error: "Question and solution text are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert South African CAPS curriculum examiner providing a "secret" insight to a top student. Your task is to analyze an exam question and its solution to reveal the *examiner's intent*.

      CRITICAL RULES:
      1.  Focus on the 'trick', the key concept being tested, a common pitfall, or an efficient shortcut.
      2.  Your tone should be concise, insightful, and encouraging.
      3.  Your entire response MUST be a single JSON object with one key: "note". The value should be a single string of 1-3 sentences.
      4.  Do not explain the solution. Explain the *question's design*.
      
      Example Input:
      Question: "A complex-looking algebraic fraction that simplifies easily with difference of two squares."
      
      Example Output:
      {
        "note": "The examiner is testing if you can spot the difference of two squares to simplify the expression first. Rushing into a complex algebraic division is the main trap here."
      }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Topic: "${topic}"\nMarks: ${marks}\nQuestion: "${questionText}"\nSolution: "${solutionText}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating examiner's note:", error.message);
    return NextResponse.json(
      { error: "Failed to generate examiner's note." },
      { status: 500 }
    );
  }
}
