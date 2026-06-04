import { NextRequest, NextResponse } from "next/server";
import { simulateDeparture } from "@/lib/expertise";

export async function POST(request: NextRequest) {
  const { employeeId } = (await request.json()) as { employeeId?: string };

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  return NextResponse.json(simulateDeparture(employeeId));
}
