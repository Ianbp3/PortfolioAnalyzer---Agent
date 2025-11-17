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
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#5DADE2",
  "#48C9B0",
  "#F5B041",
  "#DC7633",
];

export default function PortfolioCharts({ data }) {
  if (!data || data.length === 0) return null;

  // --- 🔥 CALCULAR PORCENTAJES CORRECTAMENTE ---
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
        gap: "40px",
        justifyContent: "center",
        marginTop: 32,
      }}
    >
      {/* PIE CHART */}
      <div>
        <h3 style={{ textAlign: "center" }}>Distribución del Portafolio</h3>
        <PieChart width={350} height={350}>
          <Pie
            data={finalData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            dataKey="percentage"
            label={(entry) => `${entry.name} (${entry.percentage}%)`}
          >
            {finalData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* BAR CHART */}
      <div>
        <h3 style={{ textAlign: "center" }}>Porcentaje por Activo</h3>
        <BarChart width={400} height={350} data={finalData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="percentage">
            {finalData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </div>
    </div>
  );
}
