import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "../hooks/useLang";

const LIMIT = 10;

export default function ScatterRiskReturn({ positions }) {
  const { lang } = useLang();

  if (!positions || positions.length === 0) return null;

  const total = positions.reduce((s, p) => s + p.value, 0);

  const data = positions.map((p) => ({
    symbol: p.symbol,
    weight: Number(((p.value / total) * 100).toFixed(2)),
    return: p.roi != null ? Number((p.roi * 100).toFixed(2)) : 0,
    value: p.value,
    sector: p.sector,
  }));

  const labels = {
    title:
      lang === "es"
        ? "Peso del Portafolio (%) vs Retorno (%)"
        : "Portfolio Weight (%) vs Return (%)",
    weight: lang === "es" ? "Peso" : "Weight",
    return: lang === "es" ? "Retorno" : "Return",
    assets: lang === "es" ? "Activos" : "Assets",
    hint:
      lang === "es"
        ? "Rojo = posición grande (más de 10%) que está perdiendo."
        : "Red = large position (over 10%) that is losing money.",
  };

  const colorFor = (d) =>
    d.weight > LIMIT && d.return < 0 ? "#c0392b" : "#1a6b4a";

  return (
    <div style={{ marginTop: 8, width: "100%" }}>
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
        <ScatterChart margin={{ top: 10, right: 24, bottom: 10, left: 0 }}>
          <CartesianGrid stroke="#edecea" />
          <XAxis
            type="number"
            dataKey="weight"
            name={labels.weight}
            unit="%"
            domain={[0, (max) => Math.max(LIMIT + 2, Math.ceil(max + 1))]}
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
          <ReferenceLine x={LIMIT} stroke="#c0392b" strokeDasharray="5 4" />
          <ReferenceLine y={0} stroke="#7a8394" strokeDasharray="5 4" />
          <Scatter name={labels.assets} data={data} fill="#1a6b4a">
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d)} />
            ))}
            <LabelList
              dataKey="symbol"
              position="top"
              style={{ fontSize: 10, fill: "#3d4450" }}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p
        style={{
          textAlign: "center",
          fontSize: "0.72rem",
          color: "var(--ink-muted)",
          marginTop: 6,
        }}
      >
        {labels.hint}
      </p>
    </div>
  );
}
