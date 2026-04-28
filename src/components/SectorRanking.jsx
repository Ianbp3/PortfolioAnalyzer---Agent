import React from "react";
import { useLang } from "../hooks/useLang";

export default function SectorRanking({ positions }) {
  const { t } = useLang();

  if (!positions || positions.length === 0) return null;

  const sectorMap = {};
  positions.forEach((p) => {
    if (!sectorMap[p.sector]) {
      sectorMap[p.sector] = { totalROI: 0, count: 0, totalValue: 0 };
    }
    sectorMap[p.sector].totalROI += p.roi || 0;
    sectorMap[p.sector].count += 1;
    sectorMap[p.sector].totalValue += p.value;
  });

  const sorted = Object.entries(sectorMap)
    .map(([sector, d]) => ({
      sector,
      avgROI: d.totalROI / d.count,
      positions: d.count,
      value: d.totalValue,
    }))
    .sort((a, b) => b.avgROI - a.avgROI);

  return (
    <div style={{ marginTop: 32 }}>
      <h4
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "var(--ink)",
          marginBottom: 12,
        }}
      >
        {t.sector_ranking_title}
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((item) => (
          <div
            key={item.sector}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "var(--paper)",
              border: "1px solid var(--paper-warm)",
              borderRadius: "var(--radius)",
            }}
          >
            <div>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontSize: "0.9rem",
                }}
              >
                {item.sector || "—"}
              </span>
              <span
                style={{
                  color: "var(--ink-muted)",
                  fontSize: "0.78rem",
                  marginLeft: 8,
                }}
              >
                {item.positions} {t.sector_assets}
              </span>
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.875rem",
                color: item.avgROI >= 0 ? "#1a6b4a" : "#c0392b",
                background: item.avgROI >= 0 ? "#e8f5ef" : "#fdecea",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              {(item.avgROI * 100).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
