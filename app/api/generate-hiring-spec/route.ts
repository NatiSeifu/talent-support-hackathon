import { NextResponse } from "next/server";
import { hiringSpec } from "@/lib/expertise";

export async function POST() {
  return NextResponse.json(hiringSpec);
}
