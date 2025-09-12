// FILE: app/api/papers/[id]/questions/route.js
// -------------------------------------------------
// NEW - This API endpoint retrieves all the questions associated with a specific paper ID.
// It's the core endpoint for loading a "Smart Paper" session in the QReader.
// -------------------------------------------------
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request, { params }) {
  const paperId = params.id;
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const questionNumber = searchParams.get("q");

  if (!paperId) {
    return NextResponse.json(
      { error: "Paper ID is required." },
      { status: 400 }
    );
  }

  try {
    let query = supabase.from("questions").select("*").eq("paper_id", paperId);

    if (topic) {
      query = query.eq("topic", topic);
    }
    if (questionNumber) {
      query = query.like("question_number", `${questionNumber}.%`);
    }

    const { data: questions, error } = await query.order("id", {
      ascending: true,
    });

    if (error) {
      console.error(`Error fetching questions for paper ${paperId}:`, error);
      throw new Error("Failed to fetch questions from the database.");
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error("API Error in /api/papers/[id]/questions:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve questions for this paper." },
      { status: 500 }
    );
  }
}
