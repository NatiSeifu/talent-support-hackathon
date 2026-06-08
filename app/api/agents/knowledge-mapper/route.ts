import { NextResponse } from "next/server";
import { runKnowledgeMapper } from "@/lib/agents";

export async function POST(request: Request) {
  const { message } = (await request.json()) as { message: string };

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const result = await runKnowledgeMapper(message);
    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Knowledge mapper error:", error);
    return NextResponse.json(
      { error: "Agent failed", details: String(error) },
      { status: 500 }
    );
  }
}
