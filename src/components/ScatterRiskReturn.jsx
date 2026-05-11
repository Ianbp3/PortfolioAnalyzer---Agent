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
  ResponsiveContainer,
} from "recharts";
import { useLang } from "../hooks/useLang";

export default function ScatterRiskReturn({ positions }) {
  const { lang } = useLang();

  if (!positions || positions.length === 0) return null;

  const total = positions.reduce((s, p) => s + p.value, 0);

  const data = positions.map((p) => ({
    symbol: p.symbol,
    weight: Number(((p.value / total) * 100).toFixed(2)),
    return: p.roi !== null ? Number((p.roi * 100).toFixed(2)) : 0,
    value: p.value,
    sector: p.sector,
  }));

  const labels = {
    title:
      lang === "es"
        ? "Scatter: Peso del Portafolio (%) vs Retorno (%)"
        : "Scatter: Portfolio Weight (%) vs Return (%)",
    weight: lang === "es" ? "Peso" : "Weight",
    return: lang === "es" ? "Retorno" : "Return",
    assets: lang === "es" ? "Activos" : "Assets",
  };

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
        {labels.title}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="weight"
            name={labels.weight}
            unit="%"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="return"
            name={labels.return}
            unit="%"
            tick={{ fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="value" range={[40, 300]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          <Scatter name={labels.assets} data={data} fill="#1a6b4a" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
