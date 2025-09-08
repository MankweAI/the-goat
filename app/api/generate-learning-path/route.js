// FILE: app/api/generate-learning-path/route.js
// -------------------------------------------------
// NEW - This is our new, unified API endpoint.
// It combines the logic of analyzing an image/text with generating a curriculum.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const textInput = formData.get("textInput");
    const imageFile = formData.get("imageFile");

    let painPoint = textInput;

    // If there's an image, we first need to determine the pain point from the image content.
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = buffer.toString("base64");
      const imageAnalysisPrompt = `Analyze the content of this image, which contains homework questions. Identify the core topic or concept the student needs help with. Respond with just that topic. For example: "solving linear equations with fractions".`;

      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: imageAnalysisPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      });
      painPoint = visionResponse.choices[0].message.content;
    }

    if (!painPoint) {
      return NextResponse.json(
        { error: "No pain point or homework provided." },
        { status: 400 }
      );
    }

    // Now, generate the curriculum based on the identified pain point.
    const curriculumPrompt = `You are a fun, friendly, and super encouraging AI tutor from South Africa. A student is struggling with a topic. Your task is to take their "pain point" and create a personalized, step-by-step curriculum to help them master it.
      
      The output must be a JSON object with a single key "curriculum", which is an array of objective objects. Each objective must have "id" (a simple string like "step_1"), and "title" (a concise learning goal).
      The curriculum should have between 3 and 5 logical, ordered steps. Output only the raw JSON.`;

    const curriculumCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: curriculumPrompt },
        { role: "user", content: `My pain point is: "${painPoint}"` },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = curriculumCompletion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error in generate-learning-path API:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate learning path." },
      { status: 500 }
    );
  }
}
