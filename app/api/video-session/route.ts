import { NextResponse } from "next/server";

/**
 * Video Session API
 * 
 * This endpoint manages the video avatar session for knowledge capture.
 * It supports two modes:
 * 
 * 1. TAVUS MODE (production) — Real-time conversational video via Tavus CVI
 *    - Creates a Tavus conversation session
 *    - Returns a conversation_url that the frontend embeds
 *    - Tavus handles: STT → LLM → TTS → face animation
 *    - We provide: system prompt + tools (via Tavus webhook)
 * 
 * 2. AUDIO MODE (development/fallback) — OpenAI TTS + text
 *    - Uses OpenAI Realtime API or TTS for voice output
 *    - Frontend plays audio + shows simple animation
 *    - Cheaper for testing
 */

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_PERSONA_ID = process.env.TAVUS_PERSONA_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action: "create" | "end" | "tts";
    employeeId?: string;
    text?: string;
  };

  if (body.action === "create") {
    return createVideoSession(body.employeeId ?? "emp_sarah");
  }

  if (body.action === "tts") {
    return generateTTS(body.text ?? "");
  }

  if (body.action === "end") {
    return NextResponse.json({ status: "ended" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

async function createVideoSession(employeeId: string) {
  // If Tavus is configured, create a real video session
  if (TAVUS_API_KEY && TAVUS_PERSONA_ID) {
    try {
      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "x-api-key": TAVUS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona_id: TAVUS_PERSONA_ID,
          conversational_context: buildConversationContext(employeeId),
          properties: {
            max_call_duration: 1800, // 30 minutes
            enable_transcription: true,
            language: "english",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json({
        mode: "video",
        provider: "tavus",
        conversationId: data.conversation_id,
        conversationUrl: data.conversation_url,
      });
    } catch (error) {
      console.error("Tavus session creation failed:", error);
      // Fall through to audio mode
    }
  }

  // Fallback: audio-only mode with OpenAI TTS
  return NextResponse.json({
    mode: "audio",
    provider: "openai-tts",
    sessionId: `session_${Date.now()}`,
    message: "Video avatar not configured. Using audio mode. Set TAVUS_API_KEY and TAVUS_PERSONA_ID for full video experience.",
  });
}

async function generateTTS(text: string) {
  if (!OPENAI_API_KEY || !text) {
    return NextResponse.json({ error: "TTS not available or no text provided" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS generation failed:", error);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}

function buildConversationContext(employeeId: string) {
  return `You are an AI Knowledge Capture Specialist conducting a structured interview. 

Your role is to extract critical institutional knowledge from a departing engineering expert. You ask one question at a time, probe for specifics (file paths, configuration values, failure modes), and ensure nothing critical is lost.

You are interviewing the primary expert for the Authentication domain. Focus on:
1. OAuth token refresh architecture — there is NO documentation for this critical system
2. SSO enterprise integration patterns — 200+ clients depend on this
3. Incident response procedures — the expert has led all 12 auth incidents
4. Architecture decision history — why systems were built the way they are

Be conversational, warm, and efficient. Acknowledge answers, then probe deeper. Flag undocumented insights explicitly.`;
}
