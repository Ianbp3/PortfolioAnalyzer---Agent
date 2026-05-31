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

// ─────────────────────────────────────────────────────────────────────────────
// S&P 500 trackers — same set the backend analyzer uses. Holding these means
// you also own a slice of every constituent below.
// ─────────────────────────────────────────────────────────────────────────────
const SP500_ETFS = new Set([
  "SPY",
  "VOO",
  "IVV",
  "SPLG",
  "FXAIX",
  "VFIAX",
  "SWPPX",
  "CSPX",
  "WFSPX",
  "BSPIX",
  "SNXFX",
  "MEISX",
  "PREIX",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Approximate weight of each company INSIDE the S&P 500 (fraction of the index,
// as of early 2025). Used to compute "look-through" exposure: if you hold VOO,
// your true exposure to e.g. MSFT = (your VOO weight) × (MSFT weight in the index).
// The index is very top-heavy, so the top ~40 names capture nearly all overlap.
// NOTE: multi-share-class companies (e.g. Alphabet's GOOG/GOOGL) are NOT listed
// here — they're handled by DUAL_CLASS_GROUPS below so they count as one company.
// Refresh these periodically (same as SP500_SECTOR_WEIGHTS in the backend).
// ─────────────────────────────────────────────────────────────────────────────
const SP500_CONSTITUENT_WEIGHTS = {
  AAPL: 0.07,
  MSFT: 0.063,
  NVDA: 0.065,
  AMZN: 0.039,
  META: 0.026,
  AVGO: 0.02,
  TSLA: 0.018,
  "BRK.B": 0.017,
  LLY: 0.014,
  JPM: 0.014,
  UNH: 0.01,
  XOM: 0.01,
  V: 0.009,
  MA: 0.008,
  COST: 0.008,
  HD: 0.008,
  WMT: 0.008,
  NFLX: 0.008,
  PG: 0.007,
  JNJ: 0.007,
  ABBV: 0.007,
  BAC: 0.007,
  CRM: 0.006,
  ORCL: 0.006,
  CVX: 0.006,
  KO: 0.005,
  MRK: 0.005,
  AMD: 0.005,
  PEP: 0.005,
  ADBE: 0.005,
  LIN: 0.005,
  WFC: 0.005,
  ACN: 0.005,
  MCD: 0.005,
  CSCO: 0.005,
  TMO: 0.004,
  ABT: 0.004,
  DIS: 0.004,
  INTU: 0.004,
  QCOM: 0.004,
  TXN: 0.004,
  IBM: 0.004,
  GE: 0.004,
  NOW: 0.004,
  VZ: 0.004,
  CMCSA: 0.004,
  PFE: 0.003,
  PYPL: 0.003,
  LULU: 0.001,
};

// ─────────────────────────────────────────────────────────────────────────────
// Companies that appear in the index under more than one share class.
// `combined` = the company's total weight in the S&P 500 (what one economic
// position is worth). `perClass` = each class's own weight, used ONLY to avoid
// double-counting when you happen to hold more than one class at the same time.
// To add another (e.g. Fox FOX/FOXA, News Corp NWS/NWSA), just append an entry.
// ─────────────────────────────────────────────────────────────────────────────
const DUAL_CLASS_GROUPS = [
  {
    classes: ["GOOG", "GOOGL"], // Alphabet
    combined: 0.039,
    perClass: { GOOG: 0.018, GOOGL: 0.021 },
  },
];

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

// Custom tooltip for the bar chart: shows direct, via-ETF and true exposure.
function makeBarTooltip(t) {
  return function BarTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    return (
      <div style={{ ...TOOLTIP_STYLE, padding: "8px 10px" }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: "#3d4450" }}>
          {row.name}
        </div>
        <div style={{ color: "#3d4450" }}>
          {t.chart_direct}: {row.direct}%
        </div>
        {row.implied > 0 && (
          <>
            <div style={{ color: "#7a8394" }}>
              {t.chart_via_etf}: +{row.implied}%
            </div>
            <div style={{ fontWeight: 700, color: "#1a6b4a", marginTop: 2 }}>
              {t.chart_true_exposure}: {row.trueExposure}%
            </div>
          </>
        )}
      </div>
    );
  };
}

export default function PortfolioCharts({ data }) {
  const { t } = useLang();

  if (!data || data.length === 0) return null;

  const totalValue = data.reduce((s, p) => s + (p.value || 0), 0);

  // Fraction of the whole portfolio sitting in S&P 500 ETFs (0–1).
  const sp500Weight =
    totalValue > 0
      ? data.reduce(
          (s, p) =>
            SP500_ETFS.has((p.symbol || "").toUpperCase())
              ? s + (p.value || 0) / totalValue
              : s,
          0,
        )
      : 0;

  // Symbols the portfolio actually holds — used to resolve dual-class companies.
  const heldSymbols = new Set(data.map((p) => (p.symbol || "").toUpperCase()));

  // Effective S&P 500 weight for a symbol, treating a multi-class company as one
  // position — and splitting it only if you happen to hold more than one class.
  function constituentWeightFor(sym) {
    for (const g of DUAL_CLASS_GROUPS) {
      if (g.classes.includes(sym)) {
        const heldClasses = g.classes.filter((c) => heldSymbols.has(c));
        if (heldClasses.length <= 1) return g.combined; // count as one company
        return g.perClass[sym] ?? g.combined / g.classes.length; // split, no double-count
      }
    }
    return SP500_CONSTITUENT_WEIGHTS[sym] || 0;
  }

  const finalData = data.map((item) => {
    const sym = (item.symbol || "").toUpperCase();
    const isEtf = SP500_ETFS.has(sym);
    const direct =
      totalValue > 0 ? Number(((item.value / totalValue) * 100).toFixed(2)) : 0;

    // Implied exposure this holding ALSO has hidden inside your S&P 500 ETFs.
    // ETFs themselves get no ghost (they are the wrapper, not a constituent).
    const constituentWeight = constituentWeightFor(sym);
    const implied = isEtf
      ? 0
      : Number((sp500Weight * constituentWeight * 100).toFixed(2));

    return {
      name: item.symbol,
      percentage: direct, // used by the pie (what you actually hold)
      direct, // solid segment of the bar
      implied, // translucent "ghost" segment stacked on top
      trueExposure: Number((direct + implied).toFixed(2)),
    };
  });

  const hasGhost = finalData.some((d) => d.implied > 0);

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {/* PIE — direct holdings only */}
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

      {/* BAR — direct holding (solid) + true look-through exposure (ghost) */}
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
            <Tooltip content={makeBarTooltip(t)} cursor={{ fill: "#f7f6f2" }} />
            {/* Solid: what you actually own */}
            <Bar dataKey="direct" stackId="exposure" radius={[0, 0, 0, 0]}>
              {finalData.map((_, i) => (
                <Cell key={`d-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
            {/* Ghost: extra exposure hidden inside your S&P 500 ETFs */}
            <Bar
              dataKey="implied"
              stackId="exposure"
              fillOpacity={0.32}
              radius={[6, 6, 0, 0]}
            >
              {finalData.map((_, i) => (
                <Cell key={`i-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Hint — only shown when there's hidden exposure to explain */}
        {hasGhost && (
          <p
            style={{
              textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem",
              color: "#7a8394",
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#1a6b4a",
                opacity: 0.32,
                verticalAlign: "middle",
                marginRight: 6,
              }}
            />
            {t.chart_ghost_hint}
          </p>
        )}
      </div>
    </div>
  );
}
