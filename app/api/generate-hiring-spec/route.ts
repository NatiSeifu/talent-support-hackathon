import { NextRequest, NextResponse } from "next/server";
import { generateHiringSpec } from "@/lib/expertise";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const domain = (body as { domain?: string }).domain ?? "Authentication";

  const spec = generateHiringSpec(domain);
  return NextResponse.json(spec);
}
