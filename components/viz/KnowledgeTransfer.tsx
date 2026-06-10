"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Props {
  animate?: boolean;
}

interface KNode {
  id: string;
  size: number;
  color: string;
  x?: number;
  y?: number;
}

const beforeState: KNode[] = [
  { id: "Sarah", size: 50, color: "#ef4444" },
  { id: "Auth", size: 8, color: "#f4f4f5" },
  { id: "Redis", size: 8, color: "#f4f4f5" },
  { id: "Incidents", size: 8, color: "#f4f4f5" },
  { id: "OAuth", size: 6, color: "#f4f4f5" },
  { id: "Token Mgmt", size: 6, color: "#f4f4f5" },
  { id: "SAML", size: 5, color: "#f4f4f5" },
  { id: "Mike", size: 6, color: "#d4d4d8" },
  { id: "James", size: 6, color: "#d4d4d8" },
  { id: "Anika", size: 6, color: "#d4d4d8" },
];

const afterState: KNode[] = [
  { id: "Sarah", size: 14, color: "#d4d4d8" },
  { id: "Auth", size: 12, color: "#6ee7b7" },
  { id: "Redis", size: 12, color: "#6ee7b7" },
  { id: "Incidents", size: 12, color: "#6ee7b7" },
  { id: "OAuth", size: 10, color: "#6ee7b7" },
  { id: "Token Mgmt", size: 10, color: "#6ee7b7" },
  { id: "SAML", size: 8, color: "#bef264" },
  { id: "Mike", size: 16, color: "#818cf8" },
  { id: "James", size: 20, color: "#818cf8" },
  { id: "Anika", size: 14, color: "#818cf8" },
];

const links = [
  { source: "Sarah", target: "Auth" },
  { source: "Sarah", target: "Redis" },
  { source: "Sarah", target: "Incidents" },
  { source: "Sarah", target: "OAuth" },
  { source: "Sarah", target: "Token Mgmt" },
  { source: "Sarah", target: "SAML" },
  { source: "Mike", target: "Auth" },
  { source: "James", target: "Auth" },
  { source: "James", target: "Redis" },
  { source: "James", target: "Incidents" },
  { source: "James", target: "Token Mgmt" },
  { source: "Anika", target: "SAML" },
  { source: "Anika", target: "Incidents" },
  { source: "Mike", target: "OAuth" },
];

const beforeLinks = [
  { source: "Sarah", target: "Auth" },
  { source: "Sarah", target: "Redis" },
  { source: "Sarah", target: "Incidents" },
  { source: "Sarah", target: "OAuth" },
  { source: "Sarah", target: "Token Mgmt" },
  { source: "Sarah", target: "SAML" },
];

export default function KnowledgeTransfer({ animate = true }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setShowAfter(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const cx = width / 2;
    const cy = height / 2;

    svg.selectAll("*").remove();

    const currentNodes = showAfter ? afterState : beforeState;
    const currentLinks = showAfter ? links : beforeLinks;

    // Position nodes using force simulation (simple radial)
    const nodePositions = new Map<string, { x: number; y: number }>();
    const sarahAngle = 0;
    const people = ["Mike", "James", "Anika"];
    const domains = ["Auth", "Redis", "Incidents", "OAuth", "Token Mgmt", "SAML"];

    if (!showAfter) {
      // Before: Sarah in center, everything orbits her
      nodePositions.set("Sarah", { x: cx, y: cy });
      domains.forEach((d, i) => {
        const angle = (i / domains.length) * Math.PI * 2 - Math.PI / 2;
        const r = 80;
        nodePositions.set(d, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      });
      people.forEach((p, i) => {
        const angle = (i / people.length) * Math.PI * 2 + Math.PI / 6;
        const r = 130;
        nodePositions.set(p, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      });
    } else {
      // After: distributed — Sarah moves to edge, James/Mike/Anika take center area
      nodePositions.set("Sarah", { x: cx + 120, y: cy - 60 });
      nodePositions.set("James", { x: cx - 30, y: cy - 30 });
      nodePositions.set("Mike", { x: cx + 50, y: cy + 40 });
      nodePositions.set("Anika", { x: cx - 70, y: cy + 50 });

      const domainPositions = [
        { x: cx - 90, y: cy - 70 },
        { x: cx + 10, y: cy - 80 },
        { x: cx - 110, y: cy },
        { x: cx + 100, y: cy + 10 },
        { x: cx - 40, y: cy + 80 },
        { x: cx + 60, y: cy - 50 },
      ];
      domains.forEach((d, i) => {
        nodePositions.set(d, domainPositions[i]);
      });
    }

    // Draw links
    const linkGroup = svg.append("g");
    currentLinks.forEach((link, i) => {
      const s = nodePositions.get(link.source);
      const t = nodePositions.get(link.target);
      if (!s || !t) return;

      const sourceNode = currentNodes.find((n) => n.id === link.source);
      const isStrong = showAfter && (link.source !== "Sarah");

      linkGroup.append("line")
        .attr("x1", s.x)
        .attr("y1", s.y)
        .attr("x2", s.x)
        .attr("y2", s.y)
        .attr("stroke", showAfter ? (isStrong ? "#818cf8" : "#e4e4e7") : "#fca5a5")
        .attr("stroke-width", isStrong ? 1.5 : 1)
        .attr("opacity", 0)
        .transition()
        .delay(i * 40)
        .duration(500)
        .attr("x2", t.x)
        .attr("y2", t.y)
        .attr("opacity", showAfter ? (isStrong ? 0.5 : 0.2) : 0.4);
    });

    // Draw nodes
    const nodeGroup = svg.append("g");
    currentNodes.forEach((node, i) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      nodeGroup.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", 0)
        .attr("fill", node.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .transition()
        .delay(i * 60 + 200)
        .duration(500)
        .ease(d3.easeElasticOut.amplitude(1).period(0.5))
        .attr("r", node.size / 2.5);

      nodeGroup.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y + node.size / 2.5 + 12)
        .attr("text-anchor", "middle")
        .attr("font-size", node.id === "Sarah" || people.includes(node.id) ? "9px" : "7px")
        .attr("font-weight", "500")
        .attr("fill", "#71717a")
        .attr("opacity", 0)
        .text(node.id)
        .transition()
        .delay(i * 60 + 500)
        .duration(200)
        .attr("opacity", 1);
    });

    // Title
    svg.append("text")
      .attr("x", 12)
      .attr("y", 16)
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", showAfter ? "#818cf8" : "#ef4444")
      .attr("opacity", 0)
      .text(showAfter ? "AFTER — Knowledge Distributed" : "BEFORE — Knowledge Concentrated")
      .transition()
      .duration(300)
      .attr("opacity", 1);

  }, [showAfter]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: "260px" }}
      />
      <button
        onClick={() => setShowAfter(!showAfter)}
        className="absolute bottom-3 right-3 rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-[10px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition"
      >
        {showAfter ? "Show Before" : "Show After"}
      </button>
    </div>
  );
}
