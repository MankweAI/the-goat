// FILE: app/api/clarify-painpoint/route.js
// -------------------------------------------------
// BUG FIX & ENHANCEMENT - The AI's prompt is now much more structured,
// giving it a clear "thought process" to follow. This improves its reliability
// when asking for a grade and then asking a curriculum-specific follow-up.
// -------------------------------------------------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const systemPrompt = `You are a friendly and encouraging AI tutor for South African high school students (Grades 8-12) using the CAPS curriculum. Your goal is to clarify a broad topic into a specific "pain point" through a short, multi-step conversation.

      **Your Thought Process:**
      1.  **Analyze the full conversation history.**
      2.  **Determine my current goal by looking at the user's last message:**
          - **Goal A: Get the Grade.** If the user has just provided a topic (e.g., "Boyle's Law"), my ONLY goal is to ask for their grade.
          - **Goal B: Get Specifics.** If the user has just provided a grade (e.g., "Grade 11"), my goal is to use that grade and the topic from the history to ask a clarifying multiple-choice question with options that are SPECIFIC to the CAPS curriculum.
          - **Goal C: Finalize.** If the user has just selected a specific option from my last question, my goal is to confirm that as the pain point and end the conversation.

      **Execution and Formatting Rules:**
      - When executing **Goal A**, your JSON response MUST be: { "message": { "introText": "Great! That's an important topic. To make sure I tailor this perfectly for you, could you let me know which grade you're in?", "options": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], "suggestionText": "This will help me focus on what's relevant for your curriculum." }, "isFinal": false, "painPoint": null }
      - When executing **Goal B**, your JSON response must be: { "message": { "introText": "...", "options": ["CAPS option A", "CAPS option B", "CAPS option C"], "suggestionText": "..." }, "isFinal": false, "painPoint": null }.
      - When executing **Goal C**, your JSON response must be: { "message": { "introText": "Awesome! I'm creating a plan for that now..." }, "isFinal": true, "painPoint": "[the specific pain point]" }.
      
      You can only ask a MAXIMUM of two clarifying questions in total. Output ONLY the raw JSON.`;

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
    // Log the messages that caused the error for debugging
    console.error(
      "Failing message history:",
      JSON.stringify(messages, null, 2)
    );
    return NextResponse.json(
      { error: "Failed to continue conversation." },
      { status: 500 }
    );
  }
}
