import companyData from "@/data/company.json";

export type Employee = (typeof companyData.employees)[number];
export type System = (typeof companyData.systems)[number];

export interface RankedExpert extends Employee {
  score: number;
}

export interface HiringSpec {
  missingKnowledge: string[];
  requiredSkills: string[];
  idealCandidateProfile: string;
  interviewAssessment: string[];
  onboardingPlan: { week: string; goal: string }[];
  jobDescriptionSnippet: string;
}

export const SUCCESSOR_THRESHOLD = 70;

export const missingKnowledge = [
  "OAuth token refresh flows",
  "SSO gateway architecture",
  "Auth service incident response",
  "Legacy mobile login dependencies",
  "Authentication architecture decision history"
];

export const hiringSpec: HiringSpec = {
  missingKnowledge,
  requiredSkills: [
    "Backend engineering",
    "Distributed systems",
    "Identity & access management",
    "OAuth 2.0 / OIDC",
    "SSO integrations",
    "Security-sensitive API design",
    "Incident response",
    "Python, Go, or Node.js"
  ],
  idealCandidateProfile:
    "Senior Backend Engineer with deep experience owning authentication or identity infrastructure in production. Strong background in OAuth/OIDC, SSO, secure API design, distributed systems, and incident response.",
  interviewAssessment: [
    "Debug an OAuth refresh token failure.",
    "Design a scalable SSO flow for enterprise users.",
    "Explain JWT vs session-based authentication tradeoffs.",
    "Review an auth incident postmortem and identify root causes.",
    "Create a knowledge transfer plan for legacy mobile login dependencies."
  ],
  onboardingPlan: [
    { week: "Week 1", goal: "Read auth architecture docs and shadow incident reviews." },
    { week: "Week 2", goal: "Pair with Mike on SSO Gateway and OAuth refresh flow." },
    { week: "Week 3", goal: "Own a small auth bug fix and update runbooks." },
    { week: "Week 4", goal: "Lead a mock incident response for token refresh failure." }
  ],
  jobDescriptionSnippet:
    "We need a backend engineer with deep experience in authentication systems, OAuth/OIDC, SSO integrations, secure API design, and production incident response. This person should be able to own identity infrastructure, debug token lifecycle issues, and document and transfer knowledge across engineering teams."
};

export function calculateExpertiseScore(employee: Employee, domain: string): number {
  if (domain.toLowerCase().includes("auth")) {
    return employee.authenticationScore;
  }

  const domainMatch = employee.domains.some((item) =>
    item.toLowerCase().includes(domain.toLowerCase())
  );
  const skillMatches = employee.skills.filter((skill) =>
    skill.toLowerCase().includes(domain.toLowerCase())
  ).length;
  const score =
    (domainMatch ? 25 : 0) +
    Math.min(skillMatches * 20, 20) +
    employee.commits * 0.5 +
    employee.ticketsResolved * 1.5 +
    employee.docsAuthored * 5 +
    employee.incidentsLed * 8;

  return Math.min(Math.round(score), 100);
}

export function getRankedExperts(domain: string): RankedExpert[] {
  return companyData.employees
    .map((employee) => ({
      ...employee,
      score: calculateExpertiseScore(employee, domain)
    }))
    .sort((a, b) => b.score - a.score);
}

export function simulateDeparture(employeeId: string) {
  const impactedSystems = companyData.systems.filter(
    (system) => system.primaryExpert === employeeId
  );
  const successorCandidates = getRankedExperts("Authentication")
    .filter((employee) => employee.id !== employeeId)
    .slice(0, 3);
  const hasStrongSuccessor =
    (successorCandidates[0]?.score ?? 0) >= SUCCESSOR_THRESHOLD;

  return {
    riskScore: 92,
    impactedSystems,
    successorCandidates,
    hasStrongSuccessor,
    missingKnowledge,
    knowledgeConcentration: 72,
    estimatedOnboardingBurden: "High"
  };
}

export { companyData };
