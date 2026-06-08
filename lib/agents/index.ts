import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, executeTool } from "./tools";

const client = new Anthropic();

export const KNOWLEDGE_MAPPER_SYSTEM = `You are Agent 1: The Knowledge Mapper.

Your job is to analyze an organization's engineering team and identify:
1. Who knows what — expertise concentration across domains
2. Where the risks are — single points of failure, bus factor issues
3. What the data says — ground every claim in actual signals (PRs, tickets, incidents, docs)

You have access to tools that query the team's real data. USE THEM. Don't guess — pull the data.
Be direct, quantitative, and actionable.`;

export const KNOWLEDGE_CAPTURER_SYSTEM = `You are Agent 2: The Knowledge Capturer.

You conduct structured knowledge extraction interviews with departing experts. Your goal is to capture tribal knowledge, undocumented gotchas, architecture decisions, and incident response procedures.

RULES:
- Ask ONE focused question at a time
- Probe deeper: "What file? What line? What's the exact failure mode?"
- Flag undocumented things: "⚡ CRITICAL INSIGHT: [summary]"
- Acknowledge answers before moving on
- Focus on things a new person would NOT find in code or docs
- Ask about failure modes, edge cases, and escalation paths

STRUCTURE:
1. Start with highest-priority system (worst health / no docs)
2. For each: Architecture → Edge Cases → Failure Modes → Incident Response → Handoff
3. End with: "What's the one thing you're most worried about no one else knowing?"`;

export const TALENT_STRATEGIST_SYSTEM = `You are Agent 3: The Talent Strategist.

Given risk analysis and captured knowledge, produce actionable outputs:
1. HIRING SPECS — Specific to THIS team's gaps. Real systems, real incidents, real interview questions.
2. SUCCESSOR PLANS — Gap analysis + week-by-week development plan with milestones.
3. CROSS-TRAINING PLANS — Who should learn what, priority order, time estimates.

Always ground recommendations in data. Use tools for current scores and risk metrics. Be specific.`;

const anthropicTools: Anthropic.Tool[] = Object.entries(toolDefinitions).map(([name, def]) => ({
  name,
  description: def.description,
  input_schema: {
    type: "object" as const,
    properties: Object.fromEntries(
      Object.entries((def.parameters as { shape: Record<string, { description?: string }> }).shape ?? {}).map(([key, val]) => [
        key,
        { type: "string", description: (val as { description?: string }).description ?? "" },
      ])
    ),
    required: Object.keys((def.parameters as { shape: Record<string, unknown> }).shape ?? {}).filter(
      (k) => !(def.parameters as { shape: Record<string, { isOptional?: () => boolean }> }).shape[k]?.isOptional?.()
    ),
  },
}));

async function runAgentWithTools(
  system: string,
  messages: Anthropic.MessageParam[],
  useTools: boolean = true
): Promise<string> {
  let currentMessages = [...messages];
  let iterations = 0;
  const maxIterations = 5;

  while (iterations < maxIterations) {
    iterations++;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system,
      messages: currentMessages,
      ...(useTools ? { tools: anthropicTools } : {}),
    });

    if (response.stop_reason === "end_turn" || !useTools) {
      const textBlocks = response.content.filter((b) => b.type === "text");
      return textBlocks.map((b) => b.text).join("\n");
    }

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    if (toolUseBlocks.length === 0) {
      const textBlocks = response.content.filter((b) => b.type === "text");
      return textBlocks.map((b) => b.text).join("\n");
    }

    currentMessages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((toolUse) => ({
      type: "tool_result" as const,
      tool_use_id: toolUse.id,
      content: JSON.stringify(executeTool(toolUse.name, toolUse.input as Record<string, unknown>)),
    }));

    currentMessages.push({ role: "user", content: toolResults });
  }

  return "I've gathered the data. Let me summarize my findings.";
}

export async function runKnowledgeMapper(userMessage: string): Promise<string> {
  return runAgentWithTools(
    KNOWLEDGE_MAPPER_SYSTEM,
    [{ role: "user", content: userMessage }],
    true
  );
}

export async function runKnowledgeCapturer(
  messages: { role: "user" | "assistant"; content: string }[],
  expertContext: string
): Promise<string> {
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return runAgentWithTools(
    KNOWLEDGE_CAPTURER_SYSTEM + "\n\nEXPERT CONTEXT:\n" + expertContext,
    anthropicMessages,
    false
  );
}

export async function runTalentStrategist(userMessage: string): Promise<string> {
  return runAgentWithTools(
    TALENT_STRATEGIST_SYSTEM,
    [{ role: "user", content: userMessage }],
    true
  );
}
