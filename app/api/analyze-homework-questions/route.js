// FILE: app/api/analyze-homework-questions/route.js
// -------------------------------------------------
// NEW - This API analyzes an upload and identifies all distinct
// questions, returning a list of concise titles.
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

    if (!textInput && !imageFile) {
      return NextResponse.json(
        { error: "No input provided." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert at analyzing educational materials. Your task is to look at a student's homework and identify all the distinct, separate questions.
      
      RULES:
      1.  Group sub-questions (e.g., 4.1, 4.2) under their main question number (e.g., Question 4).
      2.  For each main question you find, create an object.
      3.  Each object MUST have two keys:
          - "id": A unique identifier string (e.g., "q4").
          - "title": A very short, descriptive title (5-7 words MAX) for the question. E.g., "Question 4: Pyramid Volume & Area" or "Question 5: Sphere in a Box".
      
      The final output must be a JSON object with a single key "questions", which is an array of these objects.
      If you cannot find any questions, return an empty array. Output ONLY the raw JSON.`;

    let userContent = [];
    let model = "gpt-4o";

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = buffer.toString("base64");
      userContent.push({
        type: "text",
        text: "Analyze the homework in this image:",
      });
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${imageFile.type};base64,${base64Image}` },
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze this homework text: ${textInput}`,
      });
    }

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error in analyze-homework-questions API:", error.message);
    return NextResponse.json(
      { error: "Failed to analyze homework." },
      { status: 500 }
    );
  }
}

