// Feature removed for this simplified app.
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ message: "Feature removed" }, { status: 410 });
}
