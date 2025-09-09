// FILE: app/api/plan-homework-session/route.js
// -------------------------------------------------
// MODIFIED - The AI is now instructed to add a "label" (e.g., "4.1")
// to each curriculum objective for homework.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("imageFile");

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image provided for analysis." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert tutor. Your task is to analyze an image of a student's homework and create a structured learning plan.

      You MUST follow these steps precisely:
      1.  Identify each main question on the page (e.g., Question 4, Question 5).
      2.  For EACH main question, create a "plannedQuestion" object with an "id" and a short "title".
      3.  Inside this object, create a "curriculum" array.
      4.  For EACH sub-question (e.g., 4.1, 4.2), create a separate objective object inside the "curriculum" array.
      5.  Each curriculum objective MUST have FOUR keys:
          - "id": a unique identifier (e.g., "hw_q4_1").
          - "label": The original question number (e.g., "4.1").
          - "title": A user-friendly learning goal (e.g., "Learn how to find the pyramid's perpendicular height").
          - "type": This must ALWAYS be "homework".

      The final output must be a JSON object with a single key "plannedQuestions".
      Output ONLY the raw JSON.`;

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const userContent = [
      {
        type: "text",
        text: "Analyze the homework in this image and create a structured learning plan according to the rules.",
      },
      {
        type: "image_url",
        image_url: { url: `data:${imageFile.type};base64,${base64Image}` },
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error in plan-homework-session API:", error.message);
    return NextResponse.json(
      { error: "Failed to create homework plan." },
      { status: 500 }
    );
  }
}
