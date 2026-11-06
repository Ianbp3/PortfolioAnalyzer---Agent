import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useLang } from "../hooks/useLang";

const GREEN = "#1a6b4a";
const RED = "#c0392b";
const GRAY = "#7a8394";
const LIMIT = 10; // % guideline for a single stock

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #edecea",
  borderRadius: 8,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
};

// Index funds we "look through" for hidden overlap. Weights are approximations
// (mid-2026), refresh periodically together with portfolioAnalyzer.js.
const LOOKTHROUGH_FUNDS = [
  {
    key: "SP500",
    tickers: [
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
    ],
    dualClass: [
      {
        classes: ["GOOG", "GOOGL"],
        combined: 0.039,
        perClass: { GOOG: 0.018, GOOGL: 0.021 },
      },
    ],
    constituents: {
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
    },
  },
  {
    key: "SP500_GROWTH",
    tickers: ["SPYG", "VOOG", "IVW"],
    dualClass: [
      {
        classes: ["GOOG", "GOOGL"],
        combined: 0.067,
        perClass: { GOOG: 0.027, GOOGL: 0.04 },
      },
    ],
    constituents: {
      NVDA: 0.147,
      MSFT: 0.089,
      AAPL: 0.061,
      AVGO: 0.058,
      META: 0.045,
      AMZN: 0.04,
      TSLA: 0.028,
      LLY: 0.02,
      NFLX: 0.014,
      COST: 0.014,
      ORCL: 0.013,
      V: 0.012,
      PLTR: 0.012,
      CRM: 0.011,
      MA: 0.01,
      HD: 0.01,
      AMD: 0.01,
      WMT: 0.01,
      ABBV: 0.008,
      PG: 0.008,
      INTU: 0.008,
      NOW: 0.007,
      GE: 0.007,
      ISRG: 0.006,
      BKNG: 0.006,
      ADBE: 0.006,
      AXP: 0.006,
      UBER: 0.006,
      QCOM: 0.005,
    },
  },
  {
    key: "NASDAQ100",
    tickers: ["QQQ", "QQQM"],
    dualClass: [
      {
        classes: ["GOOG", "GOOGL"],
        combined: 0.049,
        perClass: { GOOG: 0.024, GOOGL: 0.025 },
      },
    ],
    constituents: {
      NVDA: 0.084,
      AAPL: 0.075,
      MSFT: 0.075,
      AMZN: 0.055,
      AVGO: 0.045,
      META: 0.038,
      TSLA: 0.025,
      NFLX: 0.025,
      COST: 0.025,
      PLTR: 0.013,
      TMUS: 0.013,
      AMD: 0.012,
      PEP: 0.012,
      CSCO: 0.011,
      ADBE: 0.01,
      INTU: 0.01,
      AMGN: 0.009,
      ISRG: 0.009,
      BKNG: 0.009,
      QCOM: 0.008,
      TXN: 0.008,
      MU: 0.008,
      INTC: 0.007,
      AMAT: 0.007,
      HON: 0.007,
      CMCSA: 0.006,
      LRCX: 0.006,
      KLAC: 0.006,
      PANW: 0.006,
      GILD: 0.006,
      ADP: 0.006,
      SBUX: 0.006,
      MELI: 0.006,
      ADI: 0.005,
      VRTX: 0.005,
      MDLZ: 0.005,
      MAR: 0.004,
      REGN: 0.004,
    },
  },
];

const ALL_FUND_TICKERS = new Set(LOOKTHROUGH_FUNDS.flatMap((f) => f.tickers));

const LABELS = {
  en: {
    top3: "Top 3 holdings",
    ofPortfolio: "of your portfolio",
    limit: "Dashed line = 10% guideline for a single stock",
    over: "Above the guideline",
    fund: "Index fund (basket, not flagged)",
  },
  es: {
    top3: "Top 3 posiciones",
    ofPortfolio: "de tu portafolio",
    limit: "Línea punteada = guía del 10% para una sola acción",
    over: "Sobre la guía",
    fund: "Fondo índice (canasta, sin alerta)",
  },
};

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
            <div style={{ fontWeight: 700, color: GREEN, marginTop: 2 }}>
              {t.chart_true_exposure}: {row.trueExposure}%
            </div>
          </>
        )}
      </div>
    );
  };
}

export default function PortfolioCharts({ data }) {
  const { t, lang } = useLang();
  const l = LABELS[lang] || LABELS.en;

  if (!data || data.length === 0) return null;

  const totalValue = data.reduce((s, p) => s + (p.value || 0), 0);
  const heldSymbols = new Set(data.map((p) => (p.symbol || "").toUpperCase()));

  function familyWeight(fund) {
    if (totalValue <= 0) return 0;
    return data.reduce(
      (s, p) =>
        fund.tickers.includes((p.symbol || "").toUpperCase())
          ? s + (p.value || 0) / totalValue
          : s,
      0,
    );
  }
  const fundWeights = LOOKTHROUGH_FUNDS.map((fund) => ({
    fund,
    weight: familyWeight(fund),
  })).filter((f) => f.weight > 0);

  function constituentWeightFor(sym, fund) {
    for (const g of fund.dualClass || []) {
      if (g.classes.includes(sym)) {
        const heldClasses = g.classes.filter((c) => heldSymbols.has(c));
        if (heldClasses.length <= 1) return g.combined;
        return g.perClass[sym] ?? g.combined / g.classes.length;
      }
    }
    return fund.constituents[sym] || 0;
  }

  function impliedExposureFor(sym) {
    return fundWeights.reduce(
      (s, { fund, weight }) => s + weight * constituentWeightFor(sym, fund),
      0,
    );
  }

  const rows = data
    .map((item) => {
      const sym = (item.symbol || "").toUpperCase();
      const isFund = ALL_FUND_TICKERS.has(sym);
      const direct =
        totalValue > 0
          ? Number(((item.value / totalValue) * 100).toFixed(2))
          : 0;
      const implied = isFund
        ? 0
        : Number((impliedExposureFor(sym) * 100).toFixed(2));
      const trueExposure = Number((direct + implied).toFixed(2));
      return {
        name: item.symbol,
        direct,
        implied,
        trueExposure,
        isFund,
        over: !isFund && trueExposure > LIMIT,
      };
    })
    .sort((a, b) => b.trueExposure - a.trueExposure);

  const hasGhost = rows.some((d) => d.implied > 0);
  const hasOver = rows.some((d) => d.over);
  const hasFund = rows.some((d) => d.isFund);

  // Concentration summary: share of the portfolio held in the 3 biggest positions
  const top3 = [...rows]
    .sort((a, b) => b.direct - a.direct)
    .slice(0, 3)
    .reduce((s, r) => s + r.direct, 0);

  const colorFor = (r) => (r.over ? RED : r.isFund ? GRAY : GREEN);
  const maxTrue = Math.max(...rows.map((r) => r.trueExposure));
  const xMax = Math.max(LIMIT + 2, Math.ceil(maxTrue + 1));
  const chartHeight = Math.max(260, rows.length * 30 + 40);

  return (
    <div style={{ width: "100%" }}>
      <h4
        style={{
          textAlign: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: "var(--ink)",
          marginBottom: 6,
          fontSize: "0.9rem",
        }}
      >
        {t.chart_by_asset}
      </h4>
      <p
        style={{
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.8rem",
          color: "var(--ink-muted)",
          marginBottom: 12,
        }}
      >
        {l.top3}:{" "}
        <strong style={{ color: "var(--ink)" }}>{top3.toFixed(1)}%</strong>{" "}
        {l.ofPortfolio}
      </p>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 10, right: 24, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#edecea"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, xMax]}
            tick={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fill: "#7a8394",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={56}
            tick={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fill: "#3d4450",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={makeBarTooltip(t)} cursor={{ fill: "#f7f6f2" }} />
          <ReferenceLine
            x={LIMIT}
            stroke={RED}
            strokeDasharray="5 4"
            label={{
              value: `${LIMIT}%`,
              position: "top",
              fontSize: 10,
              fill: RED,
            }}
          />
          {/* Solid: what you actually own */}
          <Bar dataKey="direct" stackId="exposure">
            {rows.map((r, i) => (
              <Cell key={`d-${i}`} fill={colorFor(r)} />
            ))}
          </Bar>
          {/* Ghost: extra exposure hidden inside your index ETFs */}
          <Bar
            dataKey="implied"
            stackId="exposure"
            fillOpacity={0.32}
            radius={[0, 6, 6, 0]}
          >
            {rows.map((r, i) => (
              <Cell key={`i-${i}`} fill={colorFor(r)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div
        style={{
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.72rem",
          color: "#7a8394",
          marginTop: 8,
          lineHeight: 1.6,
        }}
      >
        <div>{l.limit}</div>
        {hasGhost && (
          <div>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: GREEN,
                opacity: 0.32,
                verticalAlign: "middle",
                marginRight: 6,
              }}
            />
            {t.chart_ghost_hint}
          </div>
        )}
        {hasOver && (
          <div>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: RED,
                verticalAlign: "middle",
                marginRight: 6,
              }}
            />
            {l.over}
          </div>
        )}
        {hasFund && (
          <div>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: GRAY,
                verticalAlign: "middle",
                marginRight: 6,
              }}
            />
            {l.fund}
          </div>
        )}
      </div>
    </div>
  );
}
