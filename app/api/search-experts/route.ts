import { NextRequest, NextResponse } from "next/server";
import { getExpertiseProfiles } from "@/lib/expertise";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "Authentication";
  const profiles = getExpertiseProfiles(domain);

  return NextResponse.json({
    domain,
    profiles: profiles.map((p) => ({
      id: p.employee.id,
      name: p.employee.name,
      role: p.employee.role,
      score: p.overallScore,
      riskLevel: p.riskLevel,
      domainScores: p.domainScores,
    })),
  });
}
