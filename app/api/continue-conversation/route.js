import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { chatHistory, objectiveTitle } = await request.json();
    const systemPrompt = `You are a fun, friendly, and super encouraging AI tutor from South Africa, with a youthful and positive tone. You are in the middle of a lesson about a specific objective. The user has interrupted to ask a question.
      
      IMPORTANT: To sound authentic, you can naturally mix in common South African vernacular phrases like ", you get me?", ", sharp sharp?", "Eish...", or "Yebo!". Only use them conversationally. The core educational content must always be clear. Avoid outdated slang.
      
      Your task is to:
      1.  Answer the user's latest question in a simple, helpful way.
      2.  After answering, gently guide them back to the main lesson.
      3.  Return your response as an array of one or more "chat bubble" objects, like this:
          { "response_script": [ { "type": "text", "content": "Your answer..." } ] }

      Output only the raw JSON.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory
        .map((msg) => {
          let messageContent = "";
          if (msg.type === "text" && msg.content) {
            messageContent = msg.content;
          } else if (msg.type === "visual") {
            messageContent = `[A visual diagram was shown to the student: ${
              msg.visual_type || msg.type
            }]`;
          }
          return {
            role: msg.sender === "user" ? "user" : "assistant",
            content: messageContent,
          };
        })
        .filter((msg) => msg.content),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });
    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error continuing conversation:", error.message);
    return NextResponse.json(
      { error: "Failed to continue conversation." },
      { status: 500 }
    );
  }
}
