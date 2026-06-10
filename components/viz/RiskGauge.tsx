"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface RiskGaugeProps {
  level: RiskLevel;
  percentage: number;
  animated?: boolean;
}

const LEVEL_COLORS: Record<RiskLevel, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#dc2626",
};

const ARC_DEGREES = 270;
const START_ANGLE = (-ARC_DEGREES / 2) * (Math.PI / 180);
const END_ANGLE = (ARC_DEGREES / 2) * (Math.PI / 180);

export default function RiskGauge({
  level,
  percentage,
  animated = true,
}: RiskGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 200;
    const outerRadius = 80;
    const innerRadius = 62;
    const color = LEVEL_COLORS[level];

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const bgArc = d3
      .arc<unknown>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(START_ANGLE)
      .endAngle(END_ANGLE)
      .cornerRadius(4);

    g.append("path")
      .attr("d", bgArc as unknown as string)
      .attr("fill", "#f1f0f9");

    const targetAngle =
      START_ANGLE + (percentage / 100) * (END_ANGLE - START_ANGLE);

    const fillArc = d3
      .arc<{ endAngle: number }>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(START_ANGLE)
      .cornerRadius(4);

    const fillPath = g
      .append("path")
      .datum({ endAngle: animated ? START_ANGLE : targetAngle })
      .attr("fill", color)
      .attr("d", (d) => fillArc.endAngle(d.endAngle)(d) ?? "");

    if (level === "CRITICAL") {
      fillPath.attr("filter", "url(#critical-glow)");

      const defs = svg.append("defs");
      const filter = defs
        .append("filter")
        .attr("id", "critical-glow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "blur");
      filter
        .append("feFlood")
        .attr("flood-color", color)
        .attr("flood-opacity", "0.6")
        .attr("result", "color");
      filter
        .append("feComposite")
        .attr("in", "color")
        .attr("in2", "blur")
        .attr("operator", "in")
        .attr("result", "shadow");

      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "shadow");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    const levelText = g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -4)
      .attr("font-size", "22px")
      .attr("font-weight", "700")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("fill", color)
      .text(level)
      .attr("opacity", animated ? 0 : 1);

    const subtitleText = g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 16)
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("fill", "#6b7280")
      .text("Knowledge Risk")
      .attr("opacity", animated ? 0 : 1);

    const confidenceText = g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 32)
      .attr("font-size", "11px")
      .attr("font-weight", "400")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("fill", "#9ca3af")
      .text(`${percentage}% confidence`)
      .attr("opacity", animated ? 0 : 1);

    if (animated) {
      const duration = 1500;
      const textDelay = duration * 0.6;

      fillPath
        .transition()
        .duration(duration)
        .ease(d3.easeElasticOut.amplitude(1).period(0.4))
        .attrTween("d", function () {
          const interpolate = d3.interpolate(START_ANGLE, targetAngle);
          return (t: number) => {
            return fillArc.endAngle(interpolate(t))({ endAngle: interpolate(t) }) ?? "";
          };
        });

      levelText
        .transition()
        .delay(textDelay)
        .duration(400)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);

      subtitleText
        .transition()
        .delay(textDelay + 100)
        .duration(400)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);

      confidenceText
        .transition()
        .delay(textDelay + 200)
        .duration(400)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);
    }
  }, [level, percentage, animated]);

  return (
    <div className="inline-flex flex-col items-center">
      <svg
        ref={svgRef}
        width={200}
        height={200}
        style={
          level === "CRITICAL"
            ? { animation: "riskGaugePulse 2s ease-in-out infinite" }
            : undefined
        }
      />
    </div>
  );
}

if (typeof document !== "undefined") {
  const styleId = "risk-gauge-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes riskGaugePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.82; }
      }
    `;
    document.head.appendChild(style);
  }
}
