"use client";

import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Mic,
  MicOff,
  MonitorPlay,
  Play,
  Sparkles,
  Video,
  Volume2,
} from "lucide-react";
import type { View } from "@/app/page";
import { getKnowledgeCaptureTopics, getEmployee } from "@/lib/expertise";

const session = getKnowledgeCaptureTopics("emp_sarah");
const sarah = getEmployee("emp_sarah")!;

type SessionMode = "setup" | "active";
type VideoMode = "video" | "audio" | "text";
type Message = { role: "user" | "assistant"; content: string };

export default function KnowledgeCapture({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [sessionMode, setSessionMode] = useState<SessionMode>("setup");
  const [videoMode, setVideoMode] = useState<VideoMode>("text");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(async (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/agents/knowledge-capturer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: "emp_sarah", messages: newMessages }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages([...newMessages, { role: "assistant", content: data.response }]);

        if (data.response.includes("CRITICAL INSIGHT") || data.response.includes("⚡")) {
          setInsightCount((c) => c + 1);
        }

        if (videoMode === "audio") {
          synthesizeSpeech(data.response.slice(0, 500));
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([...newMessages, { role: "assistant", content: "I encountered an error. Let me rephrase my question. Could you tell me more about the system architecture?" }]);
    } finally {
      setIsLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, videoMode]);

  const startSession = useCallback(async () => {
    try {
      const res = await fetch("/api/video-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", employeeId: "emp_sarah" }),
      });
      const data = await res.json();

      if (data.mode === "video" && data.conversationUrl) {
        setVideoMode("video");
        setVideoUrl(data.conversationUrl);
      } else if (data.mode === "audio") {
        setVideoMode("audio");
      } else {
        setVideoMode("text");
      }
    } catch {
      setVideoMode("text");
    }

    setSessionMode("active");
    setIsLoading(true);
    try {
      const res = await fetch("/api/agents/knowledge-capturer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: "emp_sarah",
          messages: [{ role: "user", content: "Start the knowledge capture session. Begin with the highest-priority topic. Introduce yourself briefly and ask your first question." }],
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages([{ role: "assistant", content: data.response }]);
      } else {
        setMessages([{ role: "assistant", content: "Hello! I'm here to help capture your expertise before your transition. Let's start with the most critical topic — the OAuth token refresh flow. Can you walk me through what happens end-to-end when a mobile client's token expires?" }]);
      }
    } catch (err) {
      console.error("Session start error:", err);
      setMessages([{ role: "assistant", content: "Hello! I'm here to help capture your expertise. Let's start with the OAuth token refresh flow — can you walk me through what happens end-to-end when a mobile client's token expires?" }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const synthesizeSpeech = async (text: string) => {
    try {
      const res = await fetch("/api/video-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tts", text }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch(() => {});
      }
    } catch { /* TTS not available */ }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const W = window as unknown as { webkitSpeechRecognition?: new () => unknown; SpeechRecognition?: new () => unknown };
    const SpeechRecognitionCtor = W.webkitSpeechRecognition || W.SpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor() as { continuous: boolean; interimResults: boolean; lang: string; onresult: ((event: { results: { transcript: string }[][] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void };
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  };

  if (sessionMode === "setup") {
    return <SetupScreen onStart={startSession} onNavigate={onNavigate} />;
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSessionMode("setup")}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="text-sm font-bold">Knowledge Capture — {sarah.name}</div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                {videoMode === "video" ? <Video size={11} /> : videoMode === "audio" ? <Volume2 size={11} /> : <MonitorPlay size={11} />}
                {videoMode === "video" ? "Video Mode (Tavus)" : videoMode === "audio" ? "Audio Mode (TTS)" : "Text Mode (Claude)"}
              </span>
              <span>·</span>
              <span>{messages.filter(m => m.role === "assistant").length} exchanges</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-purple">
            <Sparkles size={11} /> {insightCount} Insights
          </span>
          <button
            onClick={() => onNavigate("onboarding")}
            className="flex items-center gap-1 rounded-lg bg-[var(--color-primary-600)] px-3 py-2 text-xs font-bold text-white"
          >
            End & Generate Plan <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Area */}
        <div className="flex flex-1 flex-col">
          {/* Video Embed */}
          {videoMode === "video" && videoUrl && (
            <div className="shrink-0 border-b border-[var(--color-border)] bg-black">
              <iframe
                ref={iframeRef}
                src={videoUrl}
                className="h-[300px] w-full"
                allow="camera; microphone; autoplay"
              />
            </div>
          )}

          {/* Audio Mode Visual */}
          {videoMode === "audio" && (
            <div className="flex shrink-0 items-center justify-center border-b border-[var(--color-border)] bg-gradient-to-b from-[var(--color-primary-50)] to-white py-8">
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                  <Volume2 size={32} className={isLoading ? "animate-pulse" : ""} />
                </div>
                <p className="mt-3 text-xs font-medium text-[var(--color-primary-700)]">
                  {isLoading ? "AI is responding..." : "Waiting for input..."}
                </p>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                      msg.role === "assistant"
                        ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {msg.role === "assistant" ? "AI" : "SC"}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-white border border-[var(--color-border)] text-[var(--color-text-primary)]"
                        : "bg-[var(--color-primary-600)] text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-700)]">AI</div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary-300)] animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary-300)] animate-bounce [animation-delay:0.1s]" />
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary-300)] animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[var(--color-border)] bg-white px-6 py-4">
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-center gap-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                  isListening
                    ? "bg-red-100 text-red-600 animate-pulse"
                    : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                {isListening ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type Sarah's response (or click mic to speak)..."
                className="flex-1 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary-300)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-[var(--color-primary-600)] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--color-primary-700)] disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] shrink-0 overflow-y-auto border-l border-[var(--color-border)] bg-white p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Interview Topics
          </h3>
          <div className="mt-3 space-y-1.5">
            {session?.topics.map((topic, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] ${
                  idx === 0
                    ? "bg-[var(--color-primary-50)] font-bold text-[var(--color-primary-700)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {idx === 0 ? (
                  <Circle size={12} fill="currentColor" className="text-[var(--color-primary-600)]" />
                ) : (
                  <Circle size={12} />
                )}
                <span className="truncate">{topic.topic}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--color-border)] pt-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Session Stats
            </h3>
            <div className="mt-3 space-y-2">
              <StatRow label="Insights captured" value={String(insightCount)} />
              <StatRow label="Messages" value={String(messages.length)} />
              <StatRow label="Mode" value={videoMode} />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-3">
            <p className="text-[11px] font-medium leading-relaxed text-[var(--color-primary-800)]">
              <strong>Video Mode:</strong> Set <code className="rounded bg-white px-1 text-[10px]">TAVUS_API_KEY</code> in .env.local for real-time video avatar. The AI interviewer appears as a live video feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupScreen({ onStart, onNavigate }: { onStart: () => void; onNavigate: (v: View) => void }) {
  return (
    <div className="px-10 py-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("dashboard")}
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Knowledge Capture Session
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            AI-powered video interview to preserve expertise
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <div className="card p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <Video size={28} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-[var(--color-text-primary)]">
            Interview with {sarah.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {sarah.role} · {sarah.team} · {sarah.tenure} tenure
          </p>
          <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            The AI interviewer will conduct a structured 20-30 minute video conversation to extract critical knowledge. Topics are generated from Sarah&apos;s actual system data — PRs, incidents, and ownership signals.
          </p>

          <div className="mx-auto mt-6 max-w-md text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              AI-Generated Topics (from signals analysis)
            </div>
            <div className="mt-3 space-y-2">
              {session?.topics.map((topic, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
                  <span className={`badge ${topic.priority === "critical" ? "badge-critical" : topic.priority === "high" ? "badge-warning" : "badge-purple"}`}>
                    {topic.priority}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-semibold text-[var(--color-text-primary)]">{topic.topic}</div>
                    <div className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">{topic.reason.slice(0, 70)}...</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left">
            <Check size={16} className="shrink-0 text-emerald-500" />
            <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
              {sarah.name} reviews all outputs before they are shared. She can skip questions or redact answers.
            </p>
          </div>

          <button
            onClick={onStart}
            className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
          >
            <Play size={16} fill="currentColor" /> Start Video Interview
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="font-bold text-[var(--color-primary-700)]">{value}</span>
    </div>
  );
}
