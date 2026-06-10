import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY || "local-key",
  baseURL: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
});

const MODEL = process.env.LLM_MODEL || "gpt-4o";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function runLLM(
  messages: Message[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { temperature = 0.2, maxTokens = 2048 } = options;

  const res = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return res.choices[0]?.message?.content ?? "";
}

export async function runLLMStructured<T>(
  messages: Message[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<T> {
  const raw = await runLLM(messages, options);

  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;

  return JSON.parse(jsonStr) as T;
}
