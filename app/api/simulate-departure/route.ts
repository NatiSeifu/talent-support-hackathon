import { NextRequest, NextResponse } from "next/server";
import { simulateDeparture } from "@/lib/expertise";

export async function POST(request: NextRequest) {
  const { employeeId } = (await request.json()) as { employeeId?: string };

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  try {
    const result = simulateDeparture(employeeId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Simulation failed" },
      { status: 500 }
    );
  }
}
