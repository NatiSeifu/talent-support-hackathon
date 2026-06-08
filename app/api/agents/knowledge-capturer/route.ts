import { NextResponse } from "next/server";
import { runKnowledgeCapturer } from "@/lib/agents";
import { getEmployee, getKnowledgeCaptureTopics } from "@/lib/expertise";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    employeeId: string;
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const { employeeId, messages } = body;

  if (!employeeId || !messages) {
    return NextResponse.json(
      { error: "employeeId and messages are required" },
      { status: 400 }
    );
  }

  const employee = getEmployee(employeeId);
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const session = getKnowledgeCaptureTopics(employeeId);

  const expertContext = `
EXPERT: ${employee.name}
ROLE: ${employee.role}
TEAM: ${employee.team}
TENURE: ${employee.tenure}
SKILLS: ${employee.skills.join(", ")}
DOMAINS: ${employee.domains.join(", ")}

SIGNALS:
- PRs Authored: ${employee.signals.prsAuthored}
- PRs Reviewed: ${employee.signals.prsReviewed}
- Commits: ${employee.signals.commits}
- Tickets Resolved: ${employee.signals.ticketsResolved}
- Incidents Led: ${employee.signals.incidentsLed}
- Docs Authored: ${employee.signals.docsAuthored}

EXPERTISE SCORES: ${JSON.stringify(employee.expertiseScores)}

TOPICS TO COVER:
${session?.topics.map((t, i) => `${i + 1}. [${t.priority}] ${t.topic}\n   Reason: ${t.reason}\n   Questions: ${t.suggestedQuestions.join("\n   - ")}`).join("\n\n") ?? "General knowledge capture"}
`;

  try {
    const result = await runKnowledgeCapturer(messages, expertContext);
    return NextResponse.json({ response: result });
  } catch (error) {
    console.error("Knowledge capturer error:", error);
    return NextResponse.json(
      { error: "Agent failed", details: String(error) },
      { status: 500 }
    );
  }
}
