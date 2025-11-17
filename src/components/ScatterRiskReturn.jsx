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

export default function ScatterRiskReturn({ positions }) {
  if (!positions || positions.length === 0) return null;

  // Esto normaliza riesgo basado en peso del activo
  const total = positions.reduce((s, p) => s + p.value, 0);

  const data = positions.map((p) => ({
    symbol: p.symbol,
    risk: Number(((p.value / total) * 100).toFixed(2)), // "riesgo relativo"
    return: p.roi !== null ? Number((p.roi * 100).toFixed(2)) : 0,
    value: p.value,
    sector: p.sector,
  }));

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
        <h3 style={{ textAlign: "center" }}>
          Scatter Plot: Riesgo (peso %) vs Retorno (%)
        </h3>

        <ScatterChart width={600} height={400}>
          <CartesianGrid />
          <XAxis type="number" dataKey="risk" name="Riesgo" unit="%" />
          <YAxis type="number" dataKey="return" name="Retorno" unit="%" />
          <ZAxis type="number" dataKey="value" range={[60, 400]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />

          <Scatter name="Activos" data={data} fill="#8884d8" />
        </ScatterChart>
      </div>
    </div>
  );
}
