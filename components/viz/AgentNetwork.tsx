"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface AgentNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color: string;
  radius: number;
  description: string;
}

interface AgentLink extends d3.SimulationLinkDatum<AgentNode> {
  source: string | AgentNode;
  target: string | AgentNode;
  type: "provides" | "challenges" | "reports" | "triggers";
  label: string;
  color: string;
  dashed?: boolean;
}

const agents: AgentNode[] = [
  { id: "evidence", label: "Evidence Agent", color: "#3b82f6", radius: 24, description: "Gathers and validates factual evidence from organizational data" },
  { id: "expertise", label: "Expertise Agent", color: "#8b5cf6", radius: 24, description: "Maps skills, tacit knowledge, and domain expertise across teams" },
  { id: "risk", label: "Risk Agent", color: "#ef4444", radius: 24, description: "Identifies knowledge concentration risks and single points of failure" },
  { id: "skeptic", label: "Skeptic Agent", color: "#f59e0b", radius: 24, description: "Challenges assumptions and demands stronger evidence for claims" },
  { id: "question", label: "Question Agent", color: "#06b6d4", radius: 24, description: "Generates targeted interview questions to fill knowledge gaps" },
  { id: "judge", label: "Judge Agent", color: "#1e1b4b", radius: 32, description: "Synthesizes all agent findings into final risk assessments" },
];

const links: AgentLink[] = [
  { source: "evidence", target: "expertise", type: "provides", label: "provides data", color: "#3b82f6" },
  { source: "evidence", target: "risk", type: "provides", label: "provides data", color: "#3b82f6" },
  { source: "skeptic", target: "evidence", type: "challenges", label: "challenges", color: "#ef4444", dashed: true },
  { source: "skeptic", target: "expertise", type: "challenges", label: "challenges", color: "#ef4444", dashed: true },
  { source: "risk", target: "judge", type: "reports", label: "reports", color: "#94a3b8" },
  { source: "evidence", target: "judge", type: "reports", label: "reports", color: "#94a3b8" },
  { source: "expertise", target: "judge", type: "reports", label: "reports", color: "#94a3b8" },
  { source: "skeptic", target: "judge", type: "reports", label: "reports", color: "#94a3b8" },
  { source: "judge", target: "question", type: "triggers", label: "triggers interview", color: "#8b5cf6" },
];

export default function AgentNetwork() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "drop-shadow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feDropShadow").attr("dx", 0).attr("dy", 1).attr("stdDeviation", 3).attr("flood-opacity", 0.15);

    const arrowTypes = [
      { id: "arrow-provides", color: "#3b82f6" },
      { id: "arrow-challenges", color: "#ef4444" },
      { id: "arrow-reports", color: "#94a3b8" },
      { id: "arrow-triggers", color: "#8b5cf6" },
    ];

    arrowTypes.forEach(({ id, color }) => {
      defs.append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 28)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    });

    const nodeData: AgentNode[] = agents.map(a => ({ ...a, x: width / 2, y: height / 2 }));
    const linkData: AgentLink[] = links.map(l => ({ ...l }));

    const simulation = d3.forceSimulation<AgentNode>(nodeData)
      .force("link", d3.forceLink<AgentNode, AgentLink>(linkData).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<AgentNode>().radius(d => d.radius + 20))
      .alpha(1)
      .alphaDecay(0.01)
      .alphaMin(0.005)
      .velocityDecay(0.4);

    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    const linkElements = linkGroup.selectAll<SVGLineElement, AgentLink>("line")
      .data(linkData)
      .join("line")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", d => d.dashed ? "6 4" : "none")
      .attr("marker-end", d => `url(#arrow-${d.type})`)
      .attr("opacity", 0.7)
      .classed("challenge-edge", d => !!d.dashed);

    const nodeElements = nodeGroup.selectAll<SVGGElement, AgentNode>("g")
      .data(nodeData)
      .join("g")
      .attr("class", d => `agent-node ${d.id === "skeptic" ? "skeptic-shake" : ""}`)
      .call(d3.drag<SVGGElement, AgentNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.1).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.005);
          d.fx = null;
          d.fy = null;
        })
      );

    nodeElements.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("filter", "url(#drop-shadow)")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    nodeElements.append("text")
      .text(d => d.label.replace(" Agent", ""))
      .attr("text-anchor", "middle")
      .attr("dy", d => d.radius + 14)
      .attr("font-size", "11px")
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", "#64748b")
      .attr("font-weight", "500");

    nodeElements
      .on("mouseenter", function (_event, d) {
        nodeElements.attr("opacity", n => {
          const connected = linkData.some(
            l => (l.source as AgentNode).id === d.id && (l.target as AgentNode).id === n.id ||
                 (l.target as AgentNode).id === d.id && (l.source as AgentNode).id === n.id ||
                 n.id === d.id
          );
          return connected ? 1 : 0.25;
        });
        linkElements.attr("opacity", l =>
          (l.source as AgentNode).id === d.id || (l.target as AgentNode).id === d.id ? 1 : 0.1
        );
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (svgRect && d.x && d.y) {
          const scaleX = svgRect.width / width;
          const scaleY = svgRect.height / height;
          setTooltip({ x: d.x * scaleX, y: d.y * scaleY - d.radius - 10, text: d.description });
        }
      })
      .on("mouseleave", function () {
        nodeElements.attr("opacity", 1);
        linkElements.attr("opacity", 0.7);
        setTooltip(null);
      });

    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => Math.max(30, Math.min(width - 30, (d.source as AgentNode).x!)))
        .attr("y1", d => Math.max(30, Math.min(height - 30, (d.source as AgentNode).y!)))
        .attr("x2", d => Math.max(30, Math.min(width - 30, (d.target as AgentNode).x!)))
        .attr("y2", d => Math.max(30, Math.min(height - 30, (d.target as AgentNode).y!)));

      nodeElements.attr("transform", d =>
        `translate(${Math.max(30, Math.min(width - 30, d.x!))},${Math.max(30, Math.min(height - 30, d.y!))})`
      );
    });

    return () => { simulation.stop(); };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 300 }}>
      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        .challenge-edge {
          animation: dash-flow 0.8s linear infinite;
        }
        @keyframes subtle-shake {
          0%, 90%, 100% { transform: translate(0, 0); }
          92% { transform: translate(-1.5px, 0); }
          94% { transform: translate(1.5px, 0); }
          96% { transform: translate(-1px, 0); }
          98% { transform: translate(1px, 0); }
        }
        .skeptic-shake {
          animation: subtle-shake 3s ease-in-out infinite;
        }
      `}</style>
      <svg
        ref={svgRef}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none px-2.5 py-1.5 rounded-md text-xs text-white bg-slate-800 shadow-lg max-w-[200px] text-center z-10"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
