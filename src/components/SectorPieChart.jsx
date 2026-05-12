import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
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
];

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #edecea",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.85rem",
  boxShadow: "0 2px 16px rgba(13,17,23,0.08)",
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
  if (percent < 0.06) return null; // skip tiny slices
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
        fontSize: "0.72rem",
        fontWeight: 700,
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function SectorPieChart({ sectors }) {
  if (!sectors) return null;

  const data = Object.entries(sectors).map(([name, info]) => ({
    name,
    value: info.value,
  }));

  return (
    <div style={{ marginTop: 24, width: "100%" }}>
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
        Valor por sector
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={44}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              color: "#3d4450",
              paddingTop: 8,
            }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`$${v.toFixed(2)}`, "Valor"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
