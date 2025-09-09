// FILE: app/api/plan-homework-session/route.js
// -------------------------------------------------
// UPGRADED - The AI is now instructed to add an "originalText" key to each
// curriculum objective, storing the verbatim sub-question.
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
    const textInput = formData.get("textInput");

    if (!imageFile && !textInput) {
      return NextResponse.json(
        {
          error:
            "No homework provided. Please type a question or upload an image.",
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert tutor. Your task is to analyze a student's homework and create a structured learning plan.

      You MUST follow these steps precisely:
      1.  **Identify Questions Only**: First, identify the actual academic questions from the input, ignoring conversational text.
      2.  **Identify Main Questions**: Group sub-questions (e.g., 4.1, 4.2) under their main question number.
      3.  **Create Plan**: For EACH main question, create a "plannedQuestion" object with an "id" and a short, descriptive "title".
      4.  **Create Curriculum**: Inside each "plannedQuestion", create a "curriculum" array. For EACH sub-question, create a separate objective object inside this array.
      5.  **Format Objectives**: Each curriculum objective MUST have FIVE keys:
          - "id": a unique identifier (e.g., "hw_q4_1").
          - "label": The original question number (e.g., "4.1").
          - "title": A user-friendly learning goal (e.g., "Learn how to find the pyramid's perpendicular height").
          - "originalText": The exact, verbatim text of the sub-question.
          - "type": This must ALWAYS be "homework".

      The final output must be a JSON object with a single key "plannedQuestions".
      Output ONLY the raw JSON.`;

    let userContent = [];

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = buffer.toString("base64");
      userContent.push({
        type: "text",
        text: "Analyze the homework in this image and create a structured learning plan according to the rules.",
      });
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${imageFile.type};base64,${base64Image}` },
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze this homework text and create a structured learning plan according to the rules: "${textInput}"`,
      });
    }

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
