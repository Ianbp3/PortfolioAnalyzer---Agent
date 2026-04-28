import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useLang } from "../hooks/useLang";

export default function ScatterRiskReturn({ positions }) {
  const { lang } = useLang();

  if (!positions || positions.length === 0) return null;

  const total = positions.reduce((s, p) => s + p.value, 0);

  const data = positions.map((p) => ({
    symbol: p.symbol,
    risk: Number(((p.value / total) * 100).toFixed(2)),
    return: p.roi !== null ? Number((p.roi * 100).toFixed(2)) : 0,
    value: p.value,
    sector: p.sector,
  }));

  const labels = {
    title:
      lang === "es"
        ? "Scatter: Riesgo (peso %) vs Retorno (%)"
        : "Scatter: Risk (weight %) vs Return (%)",
    risk: lang === "es" ? "Riesgo" : "Risk",
    return: lang === "es" ? "Retorno" : "Return",
    assets: lang === "es" ? "Activos" : "Assets",
  };

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
          {labels.title}
        </h3>
        <ScatterChart width={600} height={400}>
          <CartesianGrid />
          <XAxis type="number" dataKey="risk" name={labels.risk} unit="%" />
          <YAxis type="number" dataKey="return" name={labels.return} unit="%" />
          <ZAxis type="number" dataKey="value" range={[60, 400]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          <Scatter name={labels.assets} data={data} fill="#1a6b4a" />
        </ScatterChart>
      </div>
    </div>
  );
}
