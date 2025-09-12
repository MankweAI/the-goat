// FILE: app/api/questions/find-similar/route.js
// -------------------------------------------------
// NEW - This endpoint uses vector similarity search (pgvector) to find
// conceptually similar questions from other past papers.
// -------------------------------------------------
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { questionId, questionText } = await request.json();

    if (!questionId || !questionText) {
      return NextResponse.json(
        { error: "Question ID and text are required." },
        { status: 400 }
      );
    }

    // 1. Get the embedding for the user's question
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: questionText,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Query Supabase for similar questions using the pgvector extension
    const { data: similarQuestions, error } = await supabase.rpc(
      "match_questions",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.75, // Adjust this threshold as needed
        match_count: 5,
      }
    );

    if (error) {
      console.error("Error finding similar questions:", error);
      throw new Error("Database query for similar questions failed.");
    }

    // 3. Filter out the original question from the results
    const filteredResults = similarQuestions.filter((q) => q.id !== questionId);

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error("API Error in /api/questions/find-similar:", error.message);
    return NextResponse.json(
      { error: "Failed to find similar questions." },
      { status: 500 }
    );
  }
}


