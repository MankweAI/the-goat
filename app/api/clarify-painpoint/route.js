// FILE: app/api/clarify-painpoint/route.js
// -------------------------------------------------
// NEW - This API manages the diagnostic conversation to refine
// a user's general topic into a specific, actionable pain point.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const systemPrompt = `You are a friendly and encouraging AI tutor from South Africa. Your goal is to help a student clarify a broad topic into a specific "pain point" that you can build a lesson plan for.

      CRITICAL RULES:
      1.  Analyze the user's latest message.
      2.  If the topic is still too broad (e.g., "algebra", "photosynthesis"), ask a simple multiple-choice question to narrow it down.
      3.  You are only allowed to ask a MAXIMUM of two clarifying questions. Keep track of the conversation turns.
      4.  Once you have a specific, focused pain point (e.g., "solving quadratic equations with the formula" or "the Calvin cycle"), or after you have asked two questions, you MUST end the conversation.
      5.  To end the conversation, confirm the pain point with the user (e.g., "Okay, got it! We'll build a plan for..."), set "isFinal" to true, and populate the "painPoint" field.
      6.  Your response MUST be a JSON object with the structure: { "responseText": "...", "isFinal": boolean, "painPoint": "string|null" }.
      
      Output ONLY the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error in clarify-painpoint API:", error.message);
    return NextResponse.json(
      { error: "Failed to continue conversation." },
      { status: 500 }
    );
  }
}
