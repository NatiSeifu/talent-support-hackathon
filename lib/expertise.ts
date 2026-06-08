import companyData from "@/data/company.json";

export type Employee = (typeof companyData.employees)[number];
export type System = (typeof companyData.systems)[number];
export type HiringPriority = (typeof companyData.hiringPriorities)[number];

export interface ExpertiseProfile {
  employee: Employee;
  overallScore: number;
  domainScores: Record<string, number>;
  riskLevel: "critical" | "high" | "medium" | "low";
  trend: number;
}

export interface DepartureSimulation {
  employee: Employee;
  riskScore: number;
  impactedSystems: System[];
  knowledgeConcentration: number;
  successorCandidates: {
    employee: Employee;
    readinessScore: number;
    gaps: string[];
    timeToReady: string;
  }[];
  missingKnowledge: string[];
  estimatedRecovery: string;
  recommendedAction: "hire_external" | "promote_internal" | "cross_train";
}

export interface HiringSpec {
  role: string;
  urgency: "critical" | "high" | "medium";
  whyThisHire: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  interviewQuestions: { question: string; assessmentCriteria: string }[];
  idealCandidateProfile: string;
  onboardingPlan: { week: string; goals: string[] }[];
  salaryContext: string;
}

export interface KnowledgeCaptureSession {
  expertId: string;
  topics: {
    topic: string;
    priority: string;
    reason: string;
    suggestedQuestions: string[];
  }[];
}

export const SUCCESSOR_THRESHOLD = 70;

export function getEmployee(id: string): Employee | undefined {
  return companyData.employees.find((e) => e.id === id);
}

export function getExpertiseProfiles(domain: string): ExpertiseProfile[] {
  return companyData.employees
    .map((employee) => {
      const scores = employee.expertiseScores as Record<string, number>;
      const domainScore = scores[domain] ?? 0;
      const maxScore = Math.max(...Object.values(scores));
      const riskLevel: ExpertiseProfile["riskLevel"] =
        employee.riskFactors.busFactorSystems >= 3
          ? "critical"
          : employee.riskFactors.busFactorSystems >= 2
            ? "high"
            : employee.riskFactors.knowledgeConcentration > 0.3
              ? "medium"
              : "low";

      return {
        employee,
        overallScore: domainScore,
        domainScores: scores,
        riskLevel,
        trend: Math.floor(Math.random() * 12) - 3,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

export function simulateDeparture(employeeId: string): DepartureSimulation {
  const employee = companyData.employees.find((e) => e.id === employeeId);
  if (!employee) throw new Error("Employee not found");

  const impactedSystems = companyData.systems.filter(
    (s) => s.primaryExpert === employeeId
  );

  const domain = impactedSystems[0]?.domain ?? "Authentication";
  const profiles = getExpertiseProfiles(domain).filter(
    (p) => p.employee.id !== employeeId
  );

  const successorCandidates = profiles.slice(0, 3).map((p) => {
    const expertScores = employee.expertiseScores as Record<string, number>;
    const candidateScores = p.employee.expertiseScores as Record<string, number>;
    const gaps = Object.entries(expertScores)
      .filter(([key, val]) => val > 60 && (candidateScores[key] ?? 0) < 40)
      .map(([key]) => key);

    return {
      employee: p.employee,
      readinessScore: p.overallScore,
      gaps,
      timeToReady:
        p.overallScore >= 70
          ? "2-4 weeks"
          : p.overallScore >= 50
            ? "8-12 weeks"
            : "3-6 months",
    };
  });

  const hasStrongSuccessor = successorCandidates[0]?.readinessScore >= SUCCESSOR_THRESHOLD;

  return {
    employee,
    riskScore: 92,
    impactedSystems,
    knowledgeConcentration: employee.riskFactors.knowledgeConcentration,
    successorCandidates,
    missingKnowledge: [
      "OAuth token refresh race condition handling",
      "SSO SAML assertion validation flow",
      "Auth incident response procedures",
      "Enterprise client custom configurations",
      "Token rotation architecture decisions",
    ],
    estimatedRecovery: hasStrongSuccessor ? "4-6 weeks" : "3-6 months",
    recommendedAction: hasStrongSuccessor
      ? "promote_internal"
      : successorCandidates[0]?.readinessScore >= 50
        ? "cross_train"
        : "hire_external",
  };
}

export function getHiringPriorities() {
  return companyData.hiringPriorities;
}

export function getKnowledgeCaptureTopics(employeeId: string): KnowledgeCaptureSession | null {
  const topics = (companyData.knowledgeCaptureTopics as Record<string, typeof companyData.knowledgeCaptureTopics.emp_sarah>)[employeeId];
  if (!topics) return null;
  return { expertId: employeeId, topics };
}

export function getTeamHealthMetrics() {
  const totalDomains = companyData.team.domains.length;
  const singlePointExperts = companyData.employees.filter(
    (e) => e.riskFactors.busFactorSystems >= 2
  ).length;
  const criticalSystems = companyData.systems.filter(
    (s) => s.criticality === "critical"
  ).length;
  const avgHealth =
    companyData.systems.reduce((sum, s) => sum + s.healthScore, 0) /
    companyData.systems.length;

  return {
    teamName: companyData.team.name,
    headcount: companyData.team.headcount,
    knowledgeHealth: companyData.team.knowledgeHealth,
    totalDomains,
    singlePointExperts,
    criticalSystems,
    avgSystemHealth: Math.round(avgHealth),
    hiringPriorities: companyData.hiringPriorities.length,
  };
}

export function generateHiringSpec(domain: string): HiringSpec {
  return {
    role: "Senior Authentication Engineer",
    urgency: "critical",
    whyThisHire:
      "Sarah Chen holds 94% expertise across 4 critical authentication systems (Auth Service, SSO Gateway, OAuth Token Service, Mobile Login SDK). No internal candidate exceeds 51% readiness. The OAuth Token Service has zero backup — a departure creates immediate operational risk affecting 2M+ daily auth requests.",
    mustHaveSkills: [
      "OAuth 2.0 / OIDC token lifecycle management in production (3+ years)",
      "SSO/SAML enterprise integration experience (200+ client scale)",
      "Distributed systems debugging and incident response",
      "Go or Python backend services at scale",
      "Security-sensitive API design (token rotation, revocation)",
    ],
    niceToHaveSkills: [
      "React Native mobile auth SDK experience",
      "Kubernetes and cloud-native deployment",
      "PagerDuty/Datadog observability tooling",
      "Previous experience at SaaS company with enterprise clients",
      "Architecture documentation and ADR authorship",
    ],
    interviewQuestions: [
      {
        question: "Our OAuth refresh flow handles 2M requests/day. Mobile clients can background during a refresh request, causing race conditions. How would you debug and fix this?",
        assessmentCriteria: "Demonstrates understanding of token lifecycle, concurrency issues, and practical debugging in production auth systems.",
      },
      {
        question: "An enterprise client's SSO integration fails intermittently. Logs show SAML assertion validation errors correlated with clock skew. Walk me through your investigation.",
        assessmentCriteria: "Shows systematic debugging approach, familiarity with SAML/SSO protocols, and awareness of real-world enterprise integration challenges.",
      },
      {
        question: "Design a token rotation strategy that allows zero-downtime migration from our current JWT structure to a new signing algorithm. What are the risks?",
        assessmentCriteria: "Tests architectural thinking, backward compatibility awareness, and ability to plan high-stakes migrations.",
      },
      {
        question: "You're on-call and get paged at 2am: auth success rate dropped from 99.9% to 94%. What are your first 5 minutes?",
        assessmentCriteria: "Evaluates incident response instincts, familiarity with auth-specific failure modes, and composure under pressure.",
      },
    ],
    idealCandidateProfile:
      "A senior backend engineer (5+ years) who has previously owned authentication or identity infrastructure in a production SaaS environment. They've dealt with the messy reality of enterprise SSO integrations, token lifecycle management at scale, and auth-related incidents. They write clear architecture docs and can mentor junior engineers in the domain. They don't just build auth systems — they've operated and debugged them under pressure.",
    onboardingPlan: [
      {
        week: "Week 1",
        goals: [
          "Access captured knowledge base from Sarah's exit interview",
          "Read architecture docs and system maps",
          "Set up local development environment for auth services",
          "Shadow Mike Rodriguez on current SSO work",
        ],
      },
      {
        week: "Week 2",
        goals: [
          "Deep-dive into OAuth Token Service codebase",
          "Understand the token refresh race condition fix",
          "Pair with on-call engineer on monitoring/alerting setup",
          "Review last 3 auth incident postmortems",
        ],
      },
      {
        week: "Week 3",
        goals: [
          "Own first small bug fix in auth-service (with buddy review)",
          "Conduct shadow on-call shift for auth systems",
          "Document one undocumented architectural decision",
          "Meet enterprise clients team to understand SSO requirements",
        ],
      },
      {
        week: "Week 4",
        goals: [
          "Lead a mock incident response drill for token refresh failure",
          "Submit first architecture improvement proposal",
          "Begin ownership transition of OAuth Token Service",
          "Present auth system overview to broader team",
        ],
      },
    ],
    salaryContext:
      "Based on the criticality of this role and market rates for senior auth/identity engineers, expect $180-220K base + equity. This is above median due to the specialized domain expertise required.",
  };
}

export { companyData };
