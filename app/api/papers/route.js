// FILE: app/api/papers/route.js
// -------------------------------------------------
// NEW - This API endpoint fetches a list of available past papers.
// It allows filtering by grade, subject, and year to populate the selection screen.
// -------------------------------------------------
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get("grade");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");

  try {
    let query = supabase
      .from("papers")
      .select("id, title, subject, year, grade, stats");

    if (grade) query = query.eq("grade", grade);
    if (subject) query = query.eq("subject", subject);
    if (year) query = query.eq("year", year);

    const { data: papers, error } = await query.order("year", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching papers:", error);
      throw new Error("Failed to fetch papers from the database.");
    }

    return NextResponse.json(papers);
  } catch (error) {
    console.error("API Error in /api/papers:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve past papers." },
      { status: 500 }
    );
  }
}

