import { NextRequest, NextResponse } from "next/server";
import { getRankedExperts } from "@/lib/expertise";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "Authentication";
  return NextResponse.json({ domain, experts: getRankedExperts(domain) });
}
