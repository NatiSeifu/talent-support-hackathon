import { NextResponse } from "next/server";
import { runTalentStrategist } from "@/lib/agents";

export async function POST(request: Request) {
  const { message } = (await request.json()) as { message: string };

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const result = await runTalentStrategist(message);
    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Talent strategist error:", error);
    return NextResponse.json(
      { error: "Agent failed", details: String(error) },
      { status: 500 }
    );
  }
}
