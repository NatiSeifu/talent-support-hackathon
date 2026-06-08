import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeCaptureTopics, getEmployee } from "@/lib/expertise";

export async function POST(request: NextRequest) {
  const { employeeId, message } = (await request.json()) as {
    employeeId?: string;
    message?: string;
  };

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  const employee = getEmployee(employeeId);
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const session = getKnowledgeCaptureTopics(employeeId);
  if (!session) {
    return NextResponse.json({ error: "No capture topics found" }, { status: 404 });
  }

  if (!message) {
    return NextResponse.json({
      employee: {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        tenure: employee.tenure,
      },
      topics: session.topics,
      systemPrompt: buildSystemPrompt(employee, session.topics),
    });
  }

  return NextResponse.json({
    response: generateFollowUp(message, session.topics),
    insightsCaptured: Math.floor(Math.random() * 3) + 1,
  });
}

function buildSystemPrompt(
  employee: NonNullable<ReturnType<typeof getEmployee>>,
  topics: { topic: string; suggestedQuestions: string[] }[]
) {
  return `You are an AI knowledge capture specialist conducting a structured interview with ${employee.name}, a ${employee.role} with ${employee.tenure} of tenure. Your goal is to extract critical knowledge about the systems they own before this expertise is lost.

RULES:
- Ask one focused question at a time
- Probe deeper when answers are vague — ask for specifics (file names, line numbers, config values)
- Acknowledge answers before moving to the next question
- If they mention something undocumented, flag it as a "critical insight"
- Be conversational but efficient — this is a 30-minute session

TOPICS TO COVER (in priority order):
${topics.map((t, i) => `${i + 1}. ${t.topic}\n   Questions: ${t.suggestedQuestions.join("; ")}`).join("\n")}

Start with the highest-priority topic. After covering core questions, probe for edge cases, failure modes, and "things only you know."`;
}

function generateFollowUp(
  message: string,
  topics: { topic: string; suggestedQuestions: string[] }[]
) {
  const followUps = [
    "That's really valuable context. Can you walk me through the specific failure mode you mentioned? What does the error look like in production logs?",
    "Interesting — so that's undocumented. If a new engineer hit this issue at 2am, what steps should they follow to diagnose it?",
    "Thanks for explaining the architecture. One more thing — are there any enterprise clients with custom configurations that deviate from the standard flow?",
    "Got it. Let me make sure I captured this correctly: the idempotency key uses the refresh token hash with a 10-second TTL in Redis. Is there anything else about the token refresh flow that's not in the code comments?",
  ];

  return followUps[Math.floor(Math.random() * followUps.length)];
}
