import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import { useLang } from "../hooks/useLang";

export default function PortfolioRadar({ analysis }) {
  const { t } = useLang();

  if (!analysis) return null;

  const total = analysis.totalValue;
  const techWeight = analysis.sectors?.Technology
    ? (analysis.sectors.Technology.value / total) * 100
    : 0;

  const data = [
    { attribute: t.radar_risk, value: analysis.riskScore },
    { attribute: t.radar_concentration, value: analysis.concentration * 100 },
    {
      attribute: t.radar_diversification,
      value: Math.min(analysis.diversification * 10, 100),
    },
    { attribute: t.radar_technology, value: techWeight },
  ];

  return (
    <div
      style={{
        marginTop: 40,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div>
        <h3
          style={{
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "var(--ink)",
            marginBottom: 16,
          }}
        >
          {t.radar_title}
        </h3>
        <RadarChart outerRadius={120} width={500} height={400} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="attribute" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name={t.radar_series}
            dataKey="value"
            stroke="#1a6b4a"
            fill="#1a6b4a"
            fillOpacity={0.5}
          />
          <Tooltip />
        </RadarChart>
      </div>
    </div>
  );
}
