import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";

export default function PortfolioRadar({ analysis }) {
  if (!analysis) return null;

  const total = analysis.totalValue;

  const techWeight = analysis.sectors?.Technology
    ? (analysis.sectors.Technology.value / total) * 100
    : 0;

  const data = [
    { attribute: "Riesgo", value: analysis.riskScore },
    { attribute: "Concentración", value: analysis.concentration * 100 },
    {
      attribute: "Diversificación",
      value: Math.min(analysis.diversification * 10, 100),
    },
    { attribute: "Tecnología", value: techWeight },
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
        <h3 style={{ textAlign: "center" }}>Perfil del Portafolio</h3>

        <RadarChart outerRadius={120} width={500} height={400} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="attribute" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Perfil"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip />
        </RadarChart>
      </div>
    </div>
  );
}
