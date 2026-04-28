import React from "react";
import { useLang } from "../hooks/useLang";

function RankList({ title, items, color }) {
  return (
    <div style={{ flex: 1 }}>
      <h4
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "var(--ink)",
          marginBottom: 12,
        }}
      >
        {title}
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => (
          <div
            key={item.symbol}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              background: "var(--paper)",
              border: "1px solid var(--paper-warm)",
              borderRadius: "var(--radius)",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "var(--ink)",
                fontSize: "0.875rem",
              }}
            >
              {item.symbol}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color,
                background: color === "#1a6b4a" ? "#e8f5ef" : "#fdecea",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              {item.roi != null ? (item.roi * 100).toFixed(2) + "%" : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssetRanking({ positions }) {
  const { t } = useLang();

  if (!positions || positions.length === 0) return null;

  const sorted = [...positions].sort((a, b) => (b.roi || 0) - (a.roi || 0));
  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-5).reverse();

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <RankList title={t.asset_top5} items={top} color="#1a6b4a" />
        <RankList title={t.asset_bottom5} items={bottom} color="#c0392b" />
      </div>
    </div>
  );
}
