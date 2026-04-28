import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useLang } from "../hooks/useLang";

const COLORS = [
  "#1a6b4a",
  "#2a9b6a",
  "#c9993a",
  "#3d4450",
  "#7a8394",
  "#c0392b",
  "#8e44ad",
  "#2980b9",
  "#16a085",
  "#d35400",
];

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #edecea",
  borderRadius: 8,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
};

export default function PortfolioCharts({ data }) {
  const { lang } = useLang();

  if (!data || data.length === 0) return null;

  const totalValue = data.reduce((s, p) => s + (p.value || 0), 0);

  const finalData = data.map((item) => ({
    name: item.symbol,
    percentage:
      totalValue > 0 ? Number(((item.value / totalValue) * 100).toFixed(2)) : 0,
  }));

  const labels = {
    distribution: lang === "es" ? "Distribución" : "Distribution",
    byAsset: lang === "es" ? "Peso por activo" : "Weight by asset",
    weight: lang === "es" ? "Peso" : "Weight",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {/* PIE */}
      <div>
        <h4
          style={{
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "var(--ink)",
            marginBottom: 16,
            fontSize: "0.9rem",
          }}
        >
          {labels.distribution}
        </h4>
        <PieChart width={320} height={320}>
          <Pie
            data={finalData}
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={48}
            dataKey="percentage"
            label={({ name, percentage }) => `${name} ${percentage}%`}
            labelLine={false}
          >
            {finalData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`, labels.weight]}
          />
        </PieChart>
      </div>

      {/* BAR */}
      <div>
        <h4
          style={{
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "var(--ink)",
            marginBottom: 16,
            fontSize: "0.9rem",
          }}
        >
          {labels.byAsset}
        </h4>
        <BarChart
          width={380}
          height={320}
          data={finalData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#edecea"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fill: "#7a8394",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fill: "#7a8394",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`, labels.weight]}
            cursor={{ fill: "#f7f6f2" }}
          />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
            {finalData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </div>
    </div>
  );
}
