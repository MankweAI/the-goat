import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { problemId, userAnswer, isCorrect } = await request.json();

    // Track problem of the day completion
    await fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "potd_complete",
        properties: {
          problem_id: problemId,
          is_correct: isCorrect,
          date: new Date().toISOString().split("T")[0],
        },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking POTD completion:", error);
    return NextResponse.json(
      { error: "Failed to track completion" },
      { status: 500 }
    );
  }
}
