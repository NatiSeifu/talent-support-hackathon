"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface KnowledgeRadarProps {
  showAfter?: boolean;
}

const DATA = [
  { axis: "OAuth Flows", before: 25, after: 85 },
  { axis: "Redis Token Store", before: 10, after: 75 },
  { axis: "Incident Response", before: 20, after: 80 },
  { axis: "SAML/SSO", before: 45, after: 60 },
  { axis: "API Gateway", before: 70, after: 75 },
  { axis: "Documentation", before: 18, after: 67 },
];

const SIZE = 350;
const MARGIN = 50;
const RADIUS = (SIZE - MARGIN * 2) / 2;
const CENTER = SIZE / 2;
const LEVELS = [25, 50, 75, 100];
const ANGLE_SLICE = (Math.PI * 2) / DATA.length;

function pointOnAxis(axisIndex: number, value: number): [number, number] {
  const angle = ANGLE_SLICE * axisIndex - Math.PI / 2;
  const r = (value / 100) * RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function polygonPath(values: number[]): string {
  const points = values.map((v, i) => pointOnAxis(i, v));
  return d3.line<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(d3.curveLinearClosed)(points) as string;
}

function centerPath(): string {
  const points = DATA.map((_, i) => pointOnAxis(i, 0));
  return d3.line<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(d3.curveLinearClosed)(points) as string;
}

export default function KnowledgeRadar({ showAfter = false }: KnowledgeRadarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const afterDrawn = useRef(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    afterDrawn.current = false;

    const g = svg.append("g");

    // Concentric rings
    LEVELS.forEach((level) => {
      const r = (level / 100) * RADIUS;
      g.append("circle")
        .attr("cx", CENTER)
        .attr("cy", CENTER)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1);
    });

    // Axis lines and labels
    DATA.forEach((d, i) => {
      const [x, y] = pointOnAxis(i, 100);

      g.append("line")
        .attr("x1", CENTER)
        .attr("y1", CENTER)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1);

      const labelOffset = 14;
      const angle = ANGLE_SLICE * i - Math.PI / 2;
      const lx = CENTER + (RADIUS + labelOffset) * Math.cos(angle);
      const ly = CENTER + (RADIUS + labelOffset) * Math.sin(angle);

      let anchor: string = "middle";
      if (Math.cos(angle) > 0.1) anchor = "start";
      else if (Math.cos(angle) < -0.1) anchor = "end";

      g.append("text")
        .attr("x", lx)
        .attr("y", ly)
        .attr("text-anchor", anchor)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("font-family", "Inter, system-ui, sans-serif")
        .attr("fill", "#6b7280")
        .text(d.axis);
    });

    // "Before" polygon — animates from center on mount
    const beforeValues = DATA.map((d) => d.before);
    const beforeTarget = polygonPath(beforeValues);
    const center = centerPath();

    g.append("path")
      .attr("d", center)
      .attr("fill", "#ef4444")
      .attr("fill-opacity", 0.2)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .transition()
      .duration(800)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr("d", beforeTarget);

    // "After" polygon placeholder (hidden until triggered)
    g.append("path")
      .attr("class", "after-polygon")
      .attr("d", center)
      .attr("fill", "#10b981")
      .attr("fill-opacity", 0)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 0)
      .attr("stroke-opacity", 0);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const afterPath = svg.select<SVGPathElement>(".after-polygon");
    if (afterPath.empty()) return;

    if (showAfter && !afterDrawn.current) {
      afterDrawn.current = true;
      const afterValues = DATA.map((d) => d.after);
      const afterTarget = polygonPath(afterValues);

      afterPath
        .attr("fill-opacity", 0.2)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        .transition()
        .duration(1200)
        .ease(d3.easeBackOut.overshoot(1.7))
        .attr("d", afterTarget);
    } else if (!showAfter && afterDrawn.current) {
      afterDrawn.current = false;
      const center = centerPath();

      afterPath
        .transition()
        .duration(600)
        .ease(d3.easeCubicIn)
        .attr("d", center)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);
    }
  }, [showAfter]);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="w-full max-w-[350px] h-auto"
      />
      <div className="flex items-center gap-5 text-xs font-medium text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
          Before Audit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          After Audit + Interview
        </span>
      </div>
    </div>
  );
}
