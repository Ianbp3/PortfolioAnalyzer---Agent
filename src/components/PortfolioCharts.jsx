import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#1a6b4a",
  "#c9993a",
  "#3d4450",
  "#2a9b6a",
  "#7a8394",
  "#0d5c3e",
  "#e8a040",
  "#5a6882",
  "#4ab585",
];

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #edecea",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.85rem",
  boxShadow: "0 2px 16px rgba(13,17,23,0.08)",
};

export default function PortfolioCharts({ data }) {
  if (!data || data.length === 0) return null;

  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

  const finalData = data.map((item) => ({
    name: item.symbol,
    value: item.value,
    percentage:
      totalValue > 0 ? Number(((item.value / totalValue) * 100).toFixed(2)) : 0,
  }));

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
          Distribución
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
            formatter={(v) => [`${v}%`, "Peso"]}
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
          Peso por activo
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
            formatter={(v) => [`${v}%`, "Peso"]}
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
