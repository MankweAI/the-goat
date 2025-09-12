// FILE: app/api/past-papers/route.js
// -------------------------------------------------
// NEW - This API endpoint connects to the Supabase database to fetch the list
// of available past papers. It's a simple GET request that retrieves and
// returns all the paper metadata needed for the library screen.
// -------------------------------------------------
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the Service Role Key for secure server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("past_papers")
      .select("*")
      .order("year", { ascending: false })
      .order("subject");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching past papers:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch past papers." },
      { status: 500 }
    );
  }
}
