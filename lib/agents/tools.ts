import { z } from "zod";
import { companyData } from "@/lib/expertise";

function getEmployeeById(employeeId: string) {
  return companyData.employees.find((e) => e.id === employeeId);
}

export const toolDefinitions = {
  getEmployeeExpertise: {
    description: "Get detailed expertise signals for a specific employee.",
    parameters: z.object({
      employeeId: z.string().describe("The employee ID (e.g. emp_sarah)"),
    }),
  },
  getSystemOwnership: {
    description: "Get all systems a person owns and their backup coverage.",
    parameters: z.object({
      employeeId: z.string().describe("The employee ID"),
    }),
  },
  getTeamExpertiseMatrix: {
    description: "Get the full team expertise matrix — who knows what.",
    parameters: z.object({
      domain: z.string().optional().describe("Filter to a specific domain"),
    }),
  },
  calculateRiskScore: {
    description: "Calculate the departure risk score for an employee.",
    parameters: z.object({
      employeeId: z.string(),
    }),
  },
  getKnowledgeCaptureTopics: {
    description: "Get interview topics for capturing an expert's knowledge.",
    parameters: z.object({
      employeeId: z.string(),
    }),
  },
} as const;

export type ToolCallArgs = {
  getEmployeeExpertise: { employeeId: string };
  getSystemOwnership: { employeeId: string };
  getTeamExpertiseMatrix: { domain?: string };
  calculateRiskScore: { employeeId: string };
  getKnowledgeCaptureTopics: { employeeId: string };
};

export function executeTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case "getEmployeeExpertise": {
      const emp = getEmployeeById(args.employeeId as string);
      if (!emp) return { error: "Employee not found" };
      return {
        name: emp.name, role: emp.role, tenure: emp.tenure, team: emp.team,
        skills: emp.skills, domains: emp.domains, signals: emp.signals,
        expertiseScores: emp.expertiseScores, riskFactors: emp.riskFactors,
      };
    }
    case "getSystemOwnership": {
      const owned = companyData.systems.filter((s) => s.primaryExpert === args.employeeId);
      const backupFor = companyData.systems.filter((s) => s.backupExperts.includes(args.employeeId as string));
      return {
        ownedSystems: owned.map((s) => ({
          name: s.name, domain: s.domain, criticality: s.criticality,
          healthScore: s.healthScore, backupCount: s.backupExperts.length, description: s.description,
        })),
        backupSystems: backupFor.map((s) => ({ name: s.name, domain: s.domain })),
        totalCriticalOwned: owned.filter((s) => s.criticality === "critical").length,
        totalWithNoBackup: owned.filter((s) => s.backupExperts.length === 0).length,
      };
    }
    case "getTeamExpertiseMatrix": {
      const domain = args.domain as string | undefined;
      const matrix = companyData.employees.map((emp) => {
        const scores = emp.expertiseScores as Record<string, number>;
        return {
          id: emp.id, name: emp.name, role: emp.role,
          scores: domain ? { [domain]: scores[domain] ?? 0 } : scores,
          busFactorSystems: emp.riskFactors.busFactorSystems,
        };
      });
      return { matrix, totalEmployees: matrix.length };
    }
    case "calculateRiskScore": {
      const emp = getEmployeeById(args.employeeId as string);
      if (!emp) return { error: "Employee not found" };
      const ownedSystems = companyData.systems.filter((s) => s.primaryExpert === args.employeeId);
      const criticalSystems = ownedSystems.filter((s) => s.criticality === "critical");
      const noBackupSystems = ownedSystems.filter((s) => s.backupExperts.length === 0);
      const riskScore = Math.min(100, Math.round(
        (criticalSystems.length * 20) + (noBackupSystems.length * 15) +
        (emp.riskFactors.knowledgeConcentration * 30) + (emp.riskFactors.documentationGaps * 5)
      ));
      return {
        employeeId: args.employeeId, employeeName: emp.name, riskScore,
        riskLevel: riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : "medium",
        criticalSystemsOwned: criticalSystems.length,
        systemsWithNoBackup: noBackupSystems.length,
        impactedSystems: ownedSystems.map((s) => s.name),
      };
    }
    case "getKnowledgeCaptureTopics": {
      const topics = (companyData.knowledgeCaptureTopics as Record<string, unknown>)[args.employeeId as string];
      if (!topics) return { error: "No topics available" };
      return { employeeId: args.employeeId, topics };
    }
    default:
      return { error: "Unknown tool" };
  }
}
