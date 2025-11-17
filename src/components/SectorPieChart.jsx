import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#5DADE2",
  "#48C9B0",
  "#F5B041",
];

export default function SectorPieChart({ sectors }) {
  if (!sectors) return null;

  const data = Object.entries(sectors).map(([name, info]) => ({
    name,
    value: info.value,
  }));

  return (
    <div
      style={{
        marginTop: 32,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div>
        <h3 style={{ textAlign: "center" }}>Distribución por Sector</h3>
        <PieChart width={450} height={350}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={130}
            dataKey="value"
            label
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
}
