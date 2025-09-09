// FILE: app/api/plan-homework-session/route.js
// -------------------------------------------------
// FIX & IMPROVEMENT - This API now correctly handles both image and text input.
// The prompt has been upgraded to intelligently ignore conversational text and
// focus only on the academic questions.
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

    // FIX: Check for both image and text input
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
      1.  **Identify Questions Only**: First, you MUST identify the actual academic questions from the input. IGNORE any conversational text, greetings, or instructions like "Please solve the following". Your entire plan must be based ONLY on the questions you find.
      2.  **Identify Main Questions**: Group sub-questions (e.g., 4.1, 4.2) under their main question number (e.g., Question 4).
      3.  **Create Plan**: For EACH main question, create a "plannedQuestion" object with an "id" and a short, descriptive "title".
      4.  **Create Curriculum**: Inside each "plannedQuestion" object, create a "curriculum" array. For EACH sub-question, create a separate objective object inside this array.
      5.  **Format Objectives**: Each curriculum objective MUST have FOUR keys: "id", "label" (the question number, e.g., "4.1"), "title" (a learning goal, e.g., "Learn how to find the pyramid's perpendicular height"), and "type" ("homework").

      The final output must be a JSON object with a single key "plannedQuestions".
      Output ONLY the raw JSON.`;

    let userContent = [];

    // FIX: Handle either image or text as the source
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
