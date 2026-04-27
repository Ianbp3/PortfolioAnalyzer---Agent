import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

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

export default function SectorPieChart({ sectors }) {
  if (!sectors) return null;

  const data = Object.entries(sectors).map(([name, info]) => ({
    name,
    value: info.value,
  }));

  return (
    <div
      style={{
        marginTop: 24,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
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
          Valor por sector
        </h4>
        <PieChart width={420} height={320}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={52}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
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
              fontSize: "0.8rem",
              color: "#3d4450",
            }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`$${v.toFixed(2)}`, "Valor"]}
          />
        </PieChart>
      </div>
    </div>
  );
}
