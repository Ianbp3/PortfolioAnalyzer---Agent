import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "../hooks/useLang";

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
  value,
}) {
  // `value` is the sector's real % of the portfolio (matches the breakdown
  // below). `percent` is recharts' share-of-drawn-slices — we only use it to
  // decide whether the slice is big enough to fit a label.
  if (percent < 0.05) return null; // skip tiny slices
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
      {`${Math.round(value)}%`}
    </text>
  );
}

export default function SectorPieChart({ analysis }) {
  const { lang } = useLang();
  if (!analysis) return null;

  // Show your TRUE sector exposure: direct holdings looked through EVERY index
  // fund you hold (S&P 500, S&P 500 Growth, Nasdaq-100, ...). Falls back to the
  // S&P-500-only blend, then to raw direct sectors, for older analysis payloads.
  // The slice value is each sector's total exposure as % of the portfolio.
  let data;
  const exposure = analysis.sectorExposure;
  const blended = analysis.sectorVsSP500;

  if (exposure && Object.keys(exposure).length) {
    data = Object.entries(exposure)
      .filter(([, s]) => s.userPct > 0)
      .sort(([, a], [, b]) => b.userPct - a.userPct)
      .map(([name, s]) => ({ name, value: s.userPct }));
  } else if (blended && Object.keys(blended).length) {
    data = Object.entries(blended)
      .filter(([, s]) => s.userPct > 0)
      .sort(([, a], [, b]) => b.userPct - a.userPct)
      .map(([name, s]) => ({ name, value: s.userPct }));
  } else if (analysis.sectors && Object.keys(analysis.sectors).length) {
    // Fallback (no blended data): normalise raw sector values to percentages.
    const total =
      Object.values(analysis.sectors).reduce(
        (sum, x) => sum + (x.value || 0),
        0,
      ) || 1;
    data = Object.entries(analysis.sectors)
      .map(([name, info]) => ({
        name,
        value: Number((((info.value || 0) / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  } else {
    return null;
  }

  if (!data.length) return null;

  const title = lang === "es" ? "Exposición por sector" : "Sector exposure";
  const tipLabel = lang === "es" ? "Exposición" : "Exposure";
  const otherLabel = lang === "es" ? "Otros" : "Other";

  // The blended sector percentages may not reach 100% (some portfolio value
  // sits outside the tracked GICS sectors). Add a neutral remainder slice so
  // each slice's drawn area matches its real-% label and the ring closes.
  const sum = data.reduce((s, d) => s + d.value, 0);
  const remainder = Number((100 - sum).toFixed(1));
  if (remainder >= 1) {
    data = [...data, { name: otherLabel, value: remainder, isRemainder: true }];
  }

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
        {title}
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
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isRemainder ? "#d8dae0" : COLORS[i % COLORS.length]}
              />
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
            formatter={(v) => [`${Number(v).toFixed(1)}%`, tipLabel]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
