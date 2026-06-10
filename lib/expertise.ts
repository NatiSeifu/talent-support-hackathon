import rawCompanyData from "@/data/company.json";
import signalData from "@/data/signals.json";

export interface Employee {
  id: string;
  name: string;
  initials: string;
  role: string;
  team: string;
  tenure: string;
  skills: string[];
  domains: string[];
  signals: {
    prsAuthored: number;
    prsReviewed: number;
    commits: number;
    ticketsResolved: number;
    incidentsLed: number;
    docsAuthored: number;
    codeReviewsInDomain: number;
    mentoringSessions: number;
    architectureDecisions: number;
    onCallShifts: number;
  };
  expertiseScores: Record<string, number>;
  riskFactors: {
    busFactorSystems: number;
    knowledgeConcentration: number;
    documentationGaps: number;
    soloOwnedCriticalPaths: number;
  };
}

export interface System {
  id: string;
  name: string;
  domain: string;
  criticality: "critical" | "high" | "medium";
  primaryExpert: string;
  backupExperts: string[];
  dependencies: string[];
  healthScore: number;
  lastIncident: string;
  description: string;
}

export interface HiringPriority {
  rank: number;
  domain: string;
  severity: "critical" | "high" | "medium";
  reason: string;
  recommendedAction: "hire_external" | "cross_train";
  estimatedImpact: string;
  internalOption: {
    candidate: string;
    currentScore: number;
    targetScore: number;
    estimatedTimeToReady: string;
  } | null;
}

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

type CompanyMember = (typeof rawCompanyData.team.members)[number];
type SignalProfile = (typeof signalData.employeeSignals)[keyof typeof signalData.employeeSignals];

const memberIdMap: Record<string, string> = {
  emp_sarah: "sarah-chen",
  emp_mike: "mike-rodriguez",
  emp_alex: "alex-kim",
  emp_priya: "priya-patel",
  emp_jordan: "jordan-taylor",
};

const defaultScores: Record<string, Record<string, number>> = {
  emp_sarah: { Authentication: 94, SSO: 91, OAuth: 96, "Mobile Login": 72, "Platform APIs": 45, Infrastructure: 30 },
  emp_mike: { Authentication: 51, SSO: 62, OAuth: 28, "Mobile Login": 15, "Platform APIs": 85, Infrastructure: 40 },
  emp_alex: { Authentication: 31, SSO: 22, OAuth: 18, "Mobile Login": 12, "Platform APIs": 72, Infrastructure: 92 },
  emp_priya: { Authentication: 42, SSO: 20, OAuth: 25, "Mobile Login": 78, "Platform APIs": 35, Infrastructure: 18 },
  emp_jordan: { Authentication: 18, SSO: 12, OAuth: 10, "Mobile Login": 24, "Platform APIs": 48, Infrastructure: 20 },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getMember(employeeId: string): CompanyMember | undefined {
  const memberId = memberIdMap[employeeId];
  return rawCompanyData.team.members.find((member) => member.id === memberId);
}

function getSignalScores(profile: SignalProfile): Record<string, number> {
  return Object.fromEntries(
    Object.entries(profile.computedScores).map(([domain, value]) => [
      domain,
      value.score,
    ])
  );
}

const employees: Employee[] = Object.entries(signalData.employeeSignals).map(
  ([id, profile]) => {
    const member = getMember(id);
    const expertiseScores = {
      ...(defaultScores[id] ?? {}),
      ...getSignalScores(profile),
    };
    const topScore = Math.max(...Object.values(expertiseScores), 0);

    return {
      id,
      name: profile.name,
      initials: getInitials(profile.name),
      role: member?.title ?? "Engineer",
      team: rawCompanyData.team.name,
      tenure: member ? `${member.tenure_years} years` : "Unknown",
      skills: member?.domains ?? Object.keys(expertiseScores),
      domains: member?.domains ?? Object.keys(expertiseScores),
      signals: {
        prsAuthored: profile.github.prsAuthored,
        prsReviewed: profile.github.prsReviewed,
        commits: profile.github.commits,
        ticketsResolved: profile.jira.ticketsResolved,
        incidentsLed: profile.pagerduty.incidentsLed,
        docsAuthored: profile.confluence.docsAuthored,
        codeReviewsInDomain: profile.github.reviewRequestsReceived,
        mentoringSessions: profile.calendar.mentoringSessions,
        architectureDecisions: profile.confluence.adrsWritten,
        onCallShifts: profile.pagerduty.onCallShifts,
      },
      expertiseScores,
      riskFactors: {
        busFactorSystems: id === "emp_sarah" ? 4 : topScore >= 85 ? 1 : 0,
        knowledgeConcentration: id === "emp_sarah" ? 0.72 : topScore / 300,
        documentationGaps: profile.confluence.undocumentedSystems.length,
        soloOwnedCriticalPaths: id === "emp_sarah" ? 5 : 0,
      },
    };
  }
);

const systems: System[] = [
  { id: "sys_auth", name: "Authentication Service", domain: "Authentication", criticality: "critical", primaryExpert: "emp_sarah", backupExperts: ["emp_mike"], dependencies: ["sys_sso", "sys_oauth"], healthScore: 34, lastIncident: "2026-04-12", description: "Core identity verification service handling 2M+ auth requests/day" },
  { id: "sys_sso", name: "SSO Gateway", domain: "SSO", criticality: "critical", primaryExpert: "emp_sarah", backupExperts: ["emp_mike"], dependencies: ["sys_oauth"], healthScore: 28, lastIncident: "2026-03-28", description: "Enterprise SAML/OIDC gateway for 200+ clients" },
  { id: "sys_oauth", name: "OAuth Token Service", domain: "OAuth", criticality: "critical", primaryExpert: "emp_sarah", backupExperts: [], dependencies: [], healthScore: 18, lastIncident: "2026-05-01", description: "Token refresh, rotation, and revocation" },
  { id: "sys_mobile_login", name: "Mobile Login SDK", domain: "Mobile Login", criticality: "high", primaryExpert: "emp_sarah", backupExperts: ["emp_priya"], dependencies: ["sys_auth"], healthScore: 45, lastIncident: "2026-02-15", description: "Authentication SDK used by mobile applications" },
];

const hiringPriorities: HiringPriority[] = [
  {
    rank: 1,
    domain: "Authentication",
    severity: "critical",
    reason: "Sarah Chen owns four critical authentication systems with no qualified successor.",
    recommendedAction: "hire_external",
    estimatedImpact: "3-6 month recovery if unaddressed",
    internalOption: {
      candidate: "emp_mike",
      currentScore: 51,
      targetScore: 75,
      estimatedTimeToReady: "8-12 weeks with intensive pairing",
    },
  },
];

const knowledgeCaptureTopics: Record<string, KnowledgeCaptureSession["topics"]> = {
  emp_sarah: [
    {
      topic: "OAuth Token Refresh Architecture",
      priority: "critical",
      reason: "No complete documentation exists and Sarah owns the production failure history.",
      suggestedQuestions: [
        "Walk me through the OAuth refresh flow end-to-end.",
        "What race condition occurs when mobile clients resume during refresh?",
        "Why does token validation include a clock-skew grace window?",
      ],
    },
    {
      topic: "SSO Enterprise Integration Patterns",
      priority: "critical",
      reason: "Enterprise clients have undocumented SAML and OIDC configuration differences.",
      suggestedQuestions: [
        "What are the most common enterprise SSO failure modes?",
        "Which clients have custom configurations?",
        "How do you diagnose intermittent assertion validation failures?",
      ],
    },
    {
      topic: "Auth Incident Response Playbook",
      priority: "high",
      reason: "Sarah led the authentication incidents and the response sequence is not fully documented.",
      suggestedQuestions: [
        "What are your first diagnostic steps during an authentication outage?",
        "Which alerts indicate real failures rather than noise?",
        "What is the escalation path?",
      ],
    },
    {
      topic: "Architecture Decision History",
      priority: "medium",
      reason: "Important authentication tradeoffs are missing from the current documentation.",
      suggestedQuestions: [
        "Why was authentication separated from the monolith?",
        "Which token-storage alternatives were rejected?",
        "What would you redesign today?",
      ],
    },
  ],
};

export const companyData = {
  organization: rawCompanyData.company,
  team: {
    name: rawCompanyData.team.name,
    headcount: rawCompanyData.company.metrics.total_engineers,
    knowledgeHealth: 64,
    domains: ["Authentication", "SSO", "OAuth", "Mobile Login", "Platform APIs", "Infrastructure"],
  },
  employees,
  systems,
  hiringPriorities,
  knowledgeCaptureTopics,
};

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
  const topics = companyData.knowledgeCaptureTopics[employeeId];
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
