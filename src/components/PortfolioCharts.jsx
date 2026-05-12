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
  ResponsiveContainer,
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

function renderLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.7rem",
        fontWeight: 700,
      }}
    >
      {name}
    </text>
  );
}

export default function PortfolioCharts({ data }) {
  const { t } = useLang();

  if (!data || data.length === 0) return null;

  const totalValue = data.reduce((s, p) => s + (p.value || 0), 0);
  const finalData = data.map((item) => ({
    name: item.symbol,
    percentage:
      totalValue > 0 ? Number(((item.value / totalValue) * 100).toFixed(2)) : 0,
  }));

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {/* PIE */}
      <div style={{ flex: "1 1 260px", minWidth: 220 }}>
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
          {t.chart_distribution}
        </h4>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={finalData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={44}
              dataKey="percentage"
              labelLine={false}
              label={renderLabel}
            >
              {finalData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [`${v}%`, t.chart_weight]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* BAR */}
      <div style={{ flex: "2 1 300px", minWidth: 260 }}>
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
          {t.chart_by_asset}
        </h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={finalData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
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
              formatter={(v) => [`${v}%`, t.chart_weight]}
              cursor={{ fill: "#f7f6f2" }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
              {finalData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
