import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "../hooks/useLang";

export default function PortfolioRadar({ analysis }) {
  const { t } = useLang();

  if (!analysis) return null;

  // Technology: prefer blended exposure (direct + ETF implied) from sectorVsSP500
  const techWeight =
    analysis.sectorVsSP500?.Technology?.userPct ??
    (analysis.sectors?.Technology
      ? (analysis.sectors.Technology.value / analysis.totalValue) * 100
      : 0);

  // Diversification: count sectors with >2% blended exposure out of 11 GICS sectors.
  // This is far more meaningful than raw symbol count — 10 tech stocks ≠ diversified.
  // S&P 500 ETFs with >10% weight automatically push this to 11 via the analyzer.
  const sectorsCovered = analysis.sectorVsSP500
    ? Object.values(analysis.sectorVsSP500).filter((s) => s.userPct > 2).length
    : Math.min(analysis.diversification, 11);
  const diversificationValue = Math.round((sectorsCovered / 11) * 100);

  const data = [
    { attribute: t.radar_risk, value: analysis.riskScore },
    {
      attribute: t.radar_concentration,
      value: Math.round(analysis.concentration * 100),
    },
    { attribute: t.radar_diversification, value: diversificationValue },
    { attribute: t.radar_technology, value: Math.round(techWeight) },
  ];

  return (
    <div style={{ marginTop: 40, width: "100%" }}>
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
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart outerRadius={100} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9 }}
          />
          <Radar
            name={t.radar_series}
            dataKey="value"
            stroke="#1a6b4a"
            fill="#1a6b4a"
            fillOpacity={0.5}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
