"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleDot,
  FileText,
  GitCommitHorizontal,
  Network,
  Play,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TicketCheck,
  Users,
  X
} from "lucide-react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow
} from "@xyflow/react";
import type { HiringSpec, RankedExpert } from "@/lib/expertise";
import { companyData, getRankedExperts, hiringSpec as fallbackHiringSpec } from "@/lib/expertise";

type View = "dashboard" | "search" | "graph" | "simulation";
type GraphNodeData = {
  label: string;
  caption: string;
  kind: "person" | "system" | "asset";
  risk?: boolean;
  faded?: boolean;
};

const sarah = getRankedExperts("Authentication")[0];
const rankedExperts = getRankedExperts("Authentication");
const alternatives = rankedExperts.filter((expert) => expert.id !== "emp_sarah").slice(0, 3);

const evidence = [
  { icon: GitCommitHorizontal, text: "43 commits to auth-service" },
  { icon: TicketCheck, text: "17 OAuth/OIDC Jira tickets" },
  { icon: FileText, text: "Authored Authentication Architecture doc" },
  { icon: ShieldAlert, text: "Led 3 auth-related incidents" },
  { icon: Check, text: "Reviewed SSO gateway migration PRs" }
];

const riskDomains = [
  { name: "Authentication", owner: "Sarah Chen", score: 92, trend: "+18", level: "Critical" },
  { name: "Payments", owner: "Lena Ortiz", score: 76, trend: "+04", level: "High" },
  { name: "Mobile Login", owner: "Priya Patel", score: 69, trend: "+11", level: "Elevated" },
  { name: "Data Pipeline", owner: "James Walker", score: 61, trend: "-03", level: "Elevated" }
];

function NodeCard({ data }: NodeProps<Node<GraphNodeData>>) {
  const isPerson = data.kind === "person";
  return (
    <div
      className={`relative min-w-[150px] rounded-xl border px-3 py-2.5 transition-all ${
        data.faded
          ? "border-red-400/30 bg-red-400/5 opacity-40 grayscale"
          : data.risk
            ? "border-red-400/60 bg-red-400/10 shadow-[0_0_28px_rgba(250,110,98,.14)]"
            : isPerson
              ? "border-[#64e6c1]/50 bg-[#102a30] shadow-[0_0_24px_rgba(100,230,193,.12)]"
              : "border-white/15 bg-[#10212e]"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-[#5e7482]" />
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-[#5e7482]" />
      <div className="flex items-center gap-2">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${
            data.risk ? "bg-red-400/15 text-red-300" : isPerson ? "bg-[#64e6c1]/15 text-[#64e6c1]" : "bg-white/5 text-[#8da2ae]"
          }`}
        >
          {isPerson ? "SC" : data.kind === "asset" ? "DOC" : "SYS"}
        </span>
        <span>
          <span className="block text-[11px] font-bold text-[#eaf5f6]">{data.label}</span>
          <span className="mt-0.5 block text-[9px] uppercase tracking-[0.14em] text-[#78909d]">{data.caption}</span>
        </span>
      </div>
      {data.risk && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-[#fa6e62] bg-[#fa6e62] pulse-soft" />}
    </div>
  );
}

const nodeTypes = { card: NodeCard };

function buildGraph(isSimulated: boolean): { nodes: Node<GraphNodeData>[]; edges: Edge[] } {
  const nodes: Node<GraphNodeData>[] = [
    { id: "sarah", type: "card", position: { x: 20, y: 150 }, data: { label: "Sarah Chen", caption: isSimulated ? "departed expert" : "top expert · 94", kind: "person", faded: isSimulated } },
    { id: "auth", type: "card", position: { x: 250, y: 55 }, data: { label: "Auth Service", caption: "critical system", kind: "system", risk: isSimulated } },
    { id: "sso", type: "card", position: { x: 250, y: 165 }, data: { label: "SSO Gateway", caption: "critical system", kind: "system", risk: isSimulated } },
    { id: "doc", type: "card", position: { x: 250, y: 275 }, data: { label: "Architecture Doc", caption: "knowledge asset", kind: "asset", risk: isSimulated } },
    { id: "oauth", type: "card", position: { x: 490, y: 85 }, data: { label: "OAuth Refresh Flow", caption: "identity workflow", kind: "system", risk: isSimulated } },
    { id: "mobile", type: "card", position: { x: 490, y: 205 }, data: { label: "Mobile Login", caption: "customer surface", kind: "system", risk: isSimulated } },
    { id: "runbook", type: "card", position: { x: 490, y: 315 }, data: { label: "Incident Runbook", caption: "knowledge asset", kind: "asset", risk: isSimulated } }
  ];
  const color = isSimulated ? "#d86b62" : "#4a7a7d";
  const edge = (id: string, source: string, target: string, label: string): Edge => ({
    id, source, target, label,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color },
    style: { stroke: color, strokeWidth: 1.4 },
    labelStyle: { fill: "#8399a6", fontSize: 10 },
    labelBgStyle: { fill: "#0b1722", fillOpacity: 0.85 }
  });
  return {
    nodes,
    edges: [
      edge("e1", "sarah", "auth", "owns"),
      edge("e2", "sarah", "sso", "owns"),
      edge("e3", "sarah", "doc", "authored"),
      edge("e4", "auth", "oauth", "depends on"),
      edge("e5", "sso", "oauth", "depends on"),
      edge("e6", "auth", "mobile", "supports"),
      edge("e7", "doc", "runbook", "informs")
    ]
  };
}

function RiskRing({ score, label, compact = false }: { score: number; label: string; compact?: boolean }) {
  const color = score >= 85 ? "#fa6e62" : score >= 70 ? "#f5a949" : "#64e6c1";
  return (
    <div
      className={`risk-ring relative grid place-items-center ${compact ? "h-16 w-16" : "h-28 w-28"}`}
      style={{ "--score": score, "--ring-color": color } as React.CSSProperties}
    >
      <div className="text-center">
        <div className={`${compact ? "text-lg" : "text-3xl"} font-bold tracking-tight`}>{score}</div>
        {!compact && <div className="mt-0.5 text-[9px] uppercase tracking-widest muted">{label}</div>}
      </div>
    </div>
  );
}

function SideNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  const links: { id: View; label: string; icon: typeof BarChart3 }[] = [
    { id: "dashboard", label: "Overview", icon: BarChart3 },
    { id: "search", label: "Expertise Search", icon: Search },
    { id: "graph", label: "Knowledge Graph", icon: Network },
    { id: "simulation", label: "Risk Simulator", icon: ShieldAlert }
  ];
  return (
    <aside className="flex w-[224px] shrink-0 flex-col border-r hairline bg-[#08131d]/90 px-4 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#64e6c1]/15 text-[#64e6c1]"><Activity size={17} /></div>
        <div>
          <div className="text-sm font-bold leading-none">Expertise Risk</div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.23em] text-[#64e6c1]">AI Intelligence</div>
        </div>
      </div>
      <div className="mt-11 px-2 tiny-label">Command Center</div>
      <nav className="mt-3 space-y-1">
        {links.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition ${view === id ? "bg-[#17313a] text-[#8bf0d1]" : "text-[#8295a3] hover:bg-white/5 hover:text-white"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-[#64e6c1]/15 bg-[#64e6c1]/5 p-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#64e6c1]"><CircleDot size={11} /> Live index</div>
        <p className="mt-2 text-[10px] leading-relaxed text-[#8397a2]">Synthetic engineering org<br />Last synced 4 min ago</p>
      </div>
    </aside>
  );
}

function Header({ view }: { view: View }) {
  const titles = {
    dashboard: ["Knowledge Risk Overview", "Organization intelligence · Engineering"],
    search: ["Expertise Search", "Evidence-backed organizational search"],
    graph: ["Authentication Knowledge Graph", "Ownership, dependencies, and knowledge assets"],
    simulation: ["Departure Risk Simulator", "Model the impact of critical expertise loss"]
  };
  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between border-b hairline px-7">
      <div>
        <h1 className="text-lg font-bold tracking-tight">{titles[view][0]}</h1>
        <p className="mt-1 text-[11px] muted">{titles[view][1]}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-[#64e6c1]/20 bg-[#64e6c1]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64e6c1]">Demo Environment</span>
        <div className="grid h-8 w-8 place-items-center rounded-full bg-[#193342] text-[10px] font-bold text-[#a4bbc4]">NT</div>
      </div>
    </header>
  );
}

function MetricCard({ label, value, detail, icon: Icon, warning }: { label: string; value: string; detail: string; icon: typeof Users; warning?: boolean }) {
  return (
    <div className="panel rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="tiny-label">{label}</span>
        <Icon size={15} className={warning ? "text-[#f5a949]" : "text-[#64e6c1]"} />
      </div>
      <div className="mt-5 text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] muted">{detail}</div>
    </div>
  );
}

function Dashboard({ onStart }: { onStart: () => void }) {
  return (
    <div className="p-7">
      <section className="panel relative overflow-hidden rounded-2xl p-6">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#64e6c1]/5 blur-3xl" />
        <div className="relative flex items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 tiny-label text-[#64e6c1]"><Sparkles size={13} /> Organizational intelligence</div>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em]">Know what breaks <span className="text-[#64e6c1]">before</span><br />your experts walk out the door.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed muted">Map critical knowledge, simulate expertise loss, and turn organizational gaps into evidence-based hiring requirements.</p>
            <button onClick={onStart} className="mt-5 flex items-center gap-2 rounded-lg bg-[#64e6c1] px-4 py-2.5 text-xs font-bold text-[#07201e] transition hover:bg-[#8bf0d1]">
              <Play size={14} fill="currentColor" /> Start Demo <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-5 pr-4">
            <RiskRing score={78} label="Risk score" />
            <div>
              <div className="tiny-label">Knowledge risk score</div>
              <div className="mt-2 text-sm font-bold text-[#f5a949]">Elevated risk</div>
              <p className="mt-1 max-w-[170px] text-[11px] leading-relaxed muted">5 single-point experts require mitigation planning.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-4 grid grid-cols-4 gap-4">
        <MetricCard label="Critical areas" value="12" detail="Across 6 engineering domains" icon={Target} />
        <MetricCard label="Single-point experts" value="05" detail="+2 identified this quarter" icon={Users} warning />
        <MetricCard label="High-risk systems" value="04" detail="Immediate mitigation needed" icon={ShieldAlert} warning />
        <MetricCard label="Knowledge assets" value="83" detail="74% documentation coverage" icon={BookOpen} />
      </section>
      <section className="mt-4 grid grid-cols-[1fr_300px] gap-4">
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div><h3 className="text-sm font-bold">Top Risk Domains</h3><p className="mt-1 text-[11px] muted">Knowledge concentration and succession readiness</p></div>
            <span className="tiny-label">Risk index</span>
          </div>
          <div className="mt-4">
            {riskDomains.map((domain) => (
              <div key={domain.name} className="grid grid-cols-[1.1fr_1fr_1fr_55px] items-center border-t hairline py-3 text-xs">
                <div><div className="font-bold">{domain.name}</div><div className="mt-1 text-[10px] muted">Primary: {domain.owner}</div></div>
                <div className="pr-7"><div className="h-1.5 rounded-full bg-white/5"><div className={`h-full rounded-full ${domain.score > 80 ? "bg-[#fa6e62]" : domain.score > 70 ? "bg-[#f5a949]" : "bg-[#e2c05b]"}`} style={{ width: `${domain.score}%` }} /></div></div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${domain.score > 80 ? "red" : "amber"}`}>{domain.level}</div>
                <div className={`text-right text-[11px] font-bold ${domain.trend.startsWith("+") ? "red" : "mint"}`}>{domain.trend}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel rounded-xl p-5">
          <h3 className="text-sm font-bold">Signal Coverage</h3>
          <p className="mt-1 text-[11px] muted">Evidence sources indexed</p>
          <div className="mt-5 space-y-4">
            {[["Git activity", "94%", "2,413 signals"], ["Jira tickets", "87%", "891 signals"], ["Knowledge docs", "74%", "83 assets"], ["Incidents", "100%", "48 reports"]].map(([name, pct, sub]) => (
              <div key={name}>
                <div className="flex justify-between text-[11px]"><span className="font-bold">{name}</span><span className="mint">{pct}</span></div>
                <div className="mt-1 text-[10px] muted">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SearchView({ onSimulate, onGraph }: { onSimulate: () => void; onGraph: () => void }) {
  const [query, setQuery] = useState("Who knows authentication best?");
  const [searched, setSearched] = useState(true);
  return (
    <div className="p-7">
      <div className="mx-auto max-w-5xl">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-[#64e6c1]" size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && setSearched(true)} className="w-full rounded-xl border border-[#64e6c1]/25 bg-[#0d1d28] py-3.5 pl-12 pr-32 text-sm text-white outline-none transition placeholder:text-[#6d818c] focus:border-[#64e6c1]/60" />
          <button onClick={() => setSearched(true)} className="absolute right-1.5 top-1.5 rounded-lg bg-[#64e6c1] px-4 py-2 text-xs font-bold text-[#06201d]">Analyze</button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] muted"><Sparkles size={12} className="mint" /> Parsed intent: Find strongest expertise signal for <b className="text-[#bcd0d5]">Authentication</b></div>
        {searched && (
          <div className="mt-5 grid grid-cols-[1.35fr_.65fr] gap-4">
            <section className="panel glow-mint rounded-xl p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#64e6c1]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#64e6c1]">Top expert match</span>
                <span className="tiny-label">Authentication</span>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#64e6c1]/15 text-sm font-bold text-[#64e6c1]">SC</div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{sarah.name}</h2>
                  <p className="mt-1 text-xs muted">{sarah.role} · {sarah.team}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-3xl font-bold tracking-tight mint">{sarah.score}<span className="text-sm text-[#8ba0a9]">/100</span></div>
                  <div className="mt-1 tiny-label">Expertise confidence</div>
                </div>
              </div>
              <div className="mt-5 border-t hairline pt-4">
                <div className="tiny-label">Evidence signals</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {evidence.map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-2 rounded-lg border hairline bg-white/[.025] p-2.5 text-[11px] text-[#b8c9ce]"><Icon size={13} className="shrink-0 text-[#64e6c1]" />{text}</div>)}
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={onSimulate} className="flex items-center gap-2 rounded-lg bg-[#fa6e62] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#ff8176]"><ShieldAlert size={14} /> Simulate Sarah Leaving</button>
                <button onClick={onGraph} className="flex items-center gap-2 rounded-lg border hairline px-4 py-2.5 text-xs font-bold text-[#aec1c7] transition hover:bg-white/5"><Network size={14} /> View Knowledge Graph</button>
              </div>
            </section>
            <section className="panel rounded-xl p-5">
              <div className="tiny-label">Ranked alternatives</div>
              <p className="mt-2 text-[11px] leading-relaxed muted">Internal experts with adjacent authentication knowledge.</p>
              <div className="mt-4 space-y-2">
                {alternatives.map((expert, index) => <ExpertRow key={expert.id} expert={expert} rank={index + 2} />)}
              </div>
              <div className="mt-4 rounded-lg border border-[#f5a949]/20 bg-[#f5a949]/5 p-3 text-[10px] leading-relaxed text-[#d4bd93]"><AlertTriangle size={13} className="mb-1.5 text-[#f5a949]" />No alternative currently meets the 70-point successor readiness threshold.</div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpertRow({ expert, rank }: { expert: RankedExpert; rank: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border hairline bg-white/[.02] p-3">
      <span className="text-[10px] font-bold muted">0{rank}</span>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-[10px] font-bold text-[#9fb4bd]">{expert.initials}</div>
      <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-bold">{expert.name}</div><div className="mt-1 truncate text-[10px] muted">{expert.role}</div></div>
      <div className="text-sm font-bold text-[#dbe8e9]">{expert.score}</div>
    </div>
  );
}

function GraphPanel({ isSimulated, onSimulate }: { isSimulated: boolean; onSimulate: () => void }) {
  const graph = useMemo(() => buildGraph(isSimulated), [isSimulated]);
  return (
    <div className="p-7">
      <div className="flex items-center justify-between">
        <div><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${isSimulated ? "bg-[#fa6e62]/10 text-[#fa6e62]" : "bg-[#64e6c1]/10 text-[#64e6c1]"}`}>{isSimulated ? "Risk state · simulated" : "Current state · stable"}</span><p className="mt-3 text-xs muted">{isSimulated ? "Sarah's departure creates cascading exposure across authentication infrastructure." : "Sarah is the primary expertise owner across authentication infrastructure."}</p></div>
        {!isSimulated && <button onClick={onSimulate} className="flex items-center gap-2 rounded-lg bg-[#fa6e62] px-4 py-2.5 text-xs font-bold"><ShieldAlert size={14} /> Simulate Sarah Leaving</button>}
      </div>
      <div className="panel grid-bg mt-5 h-[560px] overflow-hidden rounded-xl">
        <ReactFlow nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.15 }} minZoom={0.7} maxZoom={1.3}>
          <Background variant={BackgroundVariant.Dots} color="#31505b" gap={18} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

function Simulation({ isSimulated, onSimulate, onGenerate, generated }: { isSimulated: boolean; onSimulate: () => void; onGenerate: () => void; generated: boolean }) {
  if (!isSimulated) {
    return (
      <div className="grid h-[calc(100vh-76px)] place-items-center p-7">
        <div className="panel max-w-lg rounded-2xl p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f5a949]/10 text-[#f5a949]"><ShieldAlert size={24} /></div>
          <h2 className="mt-5 text-xl font-bold">Model Sarah Chen&apos;s departure</h2>
          <p className="mt-3 text-sm leading-relaxed muted">Run a controlled scenario to reveal impacted systems, knowledge gaps, and internal successor readiness.</p>
          <button onClick={onSimulate} className="mx-auto mt-6 flex items-center gap-2 rounded-lg bg-[#fa6e62] px-5 py-3 text-xs font-bold"><Play size={14} fill="currentColor" /> Simulate Sarah Leaving</button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-7">
      <div className="panel glow-red flex items-center justify-between rounded-xl border-[#fa6e62]/30 p-5">
        <div className="flex items-center gap-4">
          <RiskRing score={92} label="Risk score" />
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#fa6e62]"><AlertTriangle size={16} /> Critical Knowledge Exposure</div>
            <h2 className="mt-2 text-xl font-bold">Authentication resilience is compromised.</h2>
            <p className="mt-2 text-xs muted">Sarah owns 72% of authentication knowledge. No strong internal successor found.</p>
          </div>
        </div>
        <button onClick={onGenerate} className="flex items-center gap-2 rounded-lg bg-[#64e6c1] px-4 py-3 text-xs font-bold text-[#06201d]"><Sparkles size={14} /> {generated ? "View Hiring Spec" : "Generate Hiring Spec"}</button>
      </div>
      <div className="mt-4 grid grid-cols-[.92fr_1.08fr] gap-4">
        <div className="space-y-4">
          <section className="panel rounded-xl p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Risk Analysis</h3><span className="rounded-full bg-[#fa6e62]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#fa6e62]">Critical</span></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[["Knowledge concentration", "72%"], ["Impacted systems", "04"], ["Successor readiness", "Low"], ["Onboarding burden", "High"]].map(([label, value]) => <div key={label} className="rounded-lg border hairline bg-white/[.02] p-3"><div className="tiny-label">{label}</div><div className={`mt-2 text-lg font-bold ${value === "72%" || value === "Low" ? "red" : ""}`}>{value}</div></div>)}
            </div>
          </section>
          <section className="panel rounded-xl p-5">
            <div className="tiny-label">Impacted systems</div>
            <div className="mt-3 space-y-2">{companyData.systems.filter((system) => system.primaryExpert === "emp_sarah").map((system) => <div key={system.id} className="flex items-center gap-2 rounded-lg border border-[#fa6e62]/15 bg-[#fa6e62]/5 p-2.5 text-[11px] font-bold text-[#e9c1bd]"><AlertTriangle size={12} className="text-[#fa6e62]" />{system.name}<span className="ml-auto text-[9px] uppercase tracking-wider text-[#fa6e62]">{system.criticality}</span></div>)}</div>
          </section>
        </div>
        <section className="panel rounded-xl p-5">
          <div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">Internal Successor Analysis</h3><p className="mt-1 text-[11px] muted">Minimum readiness threshold: 70/100</p></div><Users size={16} className="text-[#8295a3]" /></div>
          <div className="mt-4 space-y-3">{alternatives.map((expert, index) => <div key={expert.id} className="rounded-lg border hairline bg-white/[.02] p-3"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-[10px] font-bold">{expert.initials}</div><div className="flex-1"><div className="text-xs font-bold">{expert.name}</div><div className="mt-1 text-[10px] muted">{index === 0 ? "SSO integrations · Platform APIs" : index === 1 ? "Mobile login · Session management" : "Infrastructure · API reliability"}</div></div><span className="text-lg font-bold">{expert.score}<small className="text-[10px] muted">/100</small></span></div><div className="mt-3 h-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-[#f5a949]" style={{ width: `${expert.score}%` }} /></div></div>)}</div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#f5a949]/20 bg-[#f5a949]/5 p-3 text-[11px] leading-relaxed text-[#d9c39a]"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#f5a949]" /><span><b>No internal employee meets the successor threshold.</b><br />An external hiring specification is recommended.</span></div>
        </section>
      </div>
    </div>
  );
}

function HiringDrawer({ spec, onClose }: { spec: HiringSpec; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-[2px]">
      <aside className="h-full w-[610px] overflow-y-auto border-l border-[#64e6c1]/20 bg-[#091720] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b hairline bg-[#091720]/95 px-6 py-4 backdrop-blur">
          <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#64e6c1]"><Sparkles size={13} /> AI-generated action plan</div><h2 className="mt-2 text-xl font-bold">Authentication Hiring Spec</h2></div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border hairline text-[#8da0a9] hover:bg-white/5"><X size={16} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div className="rounded-lg border border-[#64e6c1]/20 bg-[#64e6c1]/5 p-3 text-[11px] leading-relaxed text-[#b7d7d2]"><BriefcaseBusiness size={14} className="mb-2 text-[#64e6c1]" />Generated from 4 impacted systems, 5 missing knowledge areas, and 3 successor readiness signals.</div>
          <SpecSection title="Missing Knowledge"><BulletList items={spec.missingKnowledge} /></SpecSection>
          <SpecSection title="Required Skills"><div className="flex flex-wrap gap-2">{spec.requiredSkills.map((skill) => <span key={skill} className="rounded-md border border-[#54bcea]/20 bg-[#54bcea]/5 px-2 py-1.5 text-[10px] font-bold text-[#a8d6e7]">{skill}</span>)}</div></SpecSection>
          <SpecSection title="Ideal Candidate Profile"><p className="text-[11px] leading-relaxed text-[#b5c6cc]">{spec.idealCandidateProfile}</p></SpecSection>
          <SpecSection title="Interview Assessment"><ol className="space-y-2">{spec.interviewAssessment.map((item, index) => <li key={item} className="flex gap-2 text-[11px] leading-relaxed text-[#b5c6cc]"><span className="mint font-bold">{index + 1}.</span>{item}</li>)}</ol></SpecSection>
          <SpecSection title="30-Day Onboarding Plan"><div className="space-y-2">{spec.onboardingPlan.map(({ week, goal }) => <div key={week} className="flex gap-3 rounded-lg bg-white/[.025] p-2.5 text-[11px]"><span className="w-12 shrink-0 font-bold mint">{week}</span><span className="leading-relaxed text-[#b5c6cc]">{goal}</span></div>)}</div></SpecSection>
          <SpecSection title="Job Description Snippet"><p className="rounded-lg bg-white/[.025] p-3 text-[11px] leading-relaxed text-[#b5c6cc]">{spec.jobDescriptionSnippet}</p></SpecSection>
        </div>
      </aside>
    </div>
  );
}

function SpecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel rounded-xl p-4"><h3 className="tiny-label text-[#64e6c1]">{title}</h3><div className="mt-3">{children}</div></section>;
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="space-y-2">{items.map((item) => <li key={item} className="flex items-center gap-2 text-[11px] text-[#b5c6cc]"><ChevronRight size={12} className="mint" />{item}</li>)}</ul>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [isSimulated, setIsSimulated] = useState(false);
  const [spec, setSpec] = useState<HiringSpec | null>(null);

  function simulate() {
    setIsSimulated(true);
    setView("simulation");
    void fetch("/api/simulate-departure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: "emp_sarah" })
    });
  }

  async function generateSpec() {
    if (spec) return;
    try {
      const response = await fetch("/api/generate-hiring-spec", { method: "POST" });
      if (!response.ok) throw new Error("Unable to generate hiring spec");
      setSpec((await response.json()) as HiringSpec);
    } catch {
      setSpec(fallbackHiringSpec);
    }
  }

  return (
    <main className="flex min-h-screen overflow-hidden bg-[#071019]">
      <SideNav view={view} setView={setView} />
      <div className="min-w-0 flex-1">
        <Header view={view} />
        <div className="h-[calc(100vh-76px)] overflow-y-auto">
          {view === "dashboard" && <Dashboard onStart={() => setView("search")} />}
          {view === "search" && <SearchView onSimulate={simulate} onGraph={() => setView("graph")} />}
          {view === "graph" && <GraphPanel isSimulated={isSimulated} onSimulate={simulate} />}
          {view === "simulation" && <Simulation isSimulated={isSimulated} onSimulate={simulate} onGenerate={generateSpec} generated={Boolean(spec)} />}
        </div>
      </div>
      {spec && <HiringDrawer spec={spec} onClose={() => setSpec(null)} />}
    </main>
  );
}
