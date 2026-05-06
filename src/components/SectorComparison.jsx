import React from "react";
import { useLang } from "../hooks/useLang";

const SECTOR_EMOJIS = {
  Technology: "💻",
  Financials: "🏦",
  Healthcare: "🏥",
  "Consumer Discretionary": "🛍️",
  "Communication Services": "📡",
  Industrials: "🏭",
  "Consumer Staples": "🛒",
  Energy: "⚡",
  Materials: "⛏️",
  "Real Estate": "🏠",
  Utilities: "💡",
  Other: "📦",
};

const LABELS = {
  en: {
    title: "Sector Exposure vs S&P 500",
    subtitle: "Your blended exposure (direct holdings + ETF exposure) compared to the S&P 500 benchmark.",
    you: "You",
    sp500: "S&P 500",
    overweight: "Overweight",
    underweight: "Underweight",
    inline: "In line",
    direct: "direct",
    via_etf: "via ETF",
    sp500_note: "Includes implied exposure from your S&P 500 ETF holdings.",
    dead_weight_title: "Dead Weight",
    dead_weight_sub: "These positions are losing money and represent a significant share of your portfolio.",
    roi: "ROI",
    weight: "Weight",
  },
  es: {
    title: "Exposición por Sector vs S&P 500",
    subtitle: "Tu exposición combinada (posiciones directas + ETFs) comparada con el índice S&P 500.",
    you: "Tú",
    sp500: "S&P 500",
    overweight: "Sobreexpuesto",
    underweight: "Subexpuesto",
    inline: "En línea",
    direct: "directo",
    via_etf: "vía ETF",
    sp500_note: "Incluye exposición implícita de tus ETFs del S&P 500.",
    dead_weight_title: "Peso Muerto",
    dead_weight_sub: "Estas posiciones están en pérdida y representan una porción significativa de tu portafolio.",
    roi: "ROI",
    weight: "Peso",
  },
};

function DeltaBadge({ delta, l }) {
  if (Math.abs(delta) < 2) {
    return (
      <span style={{ fontSize: "0.7rem", color: "#7a8394", fontWeight: 600 }}>
        {l.inline}
      </span>
    );
  }
  const over = delta > 0;
  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        color: over ? "#c0392b" : "#2a9b6a",
        background: over ? "rgba(192,57,43,0.08)" : "rgba(42,155,106,0.08)",
        borderRadius: 99,
        padding: "2px 8px",
      }}
    >
      {over ? "+" : ""}{delta}% {over ? l.overweight : l.underweight}
    </span>
  );
}

export default function SectorComparison({ analysis }) {
  const { lang } = useLang();
  const l = LABELS[lang] || LABELS.en;

  if (!analysis?.sectorVsSP500) return null;

  // Sort by user's blended exposure descending
  const rows = Object.entries(analysis.sectorVsSP500)
    .filter(([, s]) => s.userPct > 0 || s.sp500Pct > 0)
    .sort(([, a], [, b]) => b.userPct - a.userPct);

  const maxPct = Math.max(...rows.map(([, s]) => Math.max(s.userPct, s.sp500Pct)), 1);
  const hasSP500 = analysis.sp500Weight > 0.05;

  return (
    <div style={{ marginTop: 8 }}>
      <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginBottom: 20, lineHeight: 1.5 }}>
        {l.subtitle}
        {hasSP500 && (
          <span style={{ display: "block", marginTop: 4, fontStyle: "italic" }}>
            {l.sp500_note}
          </span>
        )}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(([sector, data]) => {
          const userBarWidth = (data.userPct / maxPct) * 100;
          const sp500BarWidth = (data.sp500Pct / maxPct) * 100;
          const emoji = SECTOR_EMOJIS[sector] || "📦";

          return (
            <div key={sector}>
              {/* Sector label + delta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {emoji} {sector}
                </span>
                <DeltaBadge delta={data.delta} l={l} />
              </div>

              {/* User bar */}
              <div style={{ marginBottom: 3 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)", width: 48 }}>
                    {l.you}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 10,
                      background: "var(--paper-warm)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${userBarWidth}%`,
                        height: "100%",
                        background: "var(--accent)",
                        borderRadius: 99,
                        transition: "width 0.4s ease",
                        position: "relative",
                      }}
                    >
                      {/* Show direct vs ETF breakdown inside the bar if both exist */}
                      {hasSP500 && data.impliedPct > 0 && data.directPct > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            height: "100%",
                            width: `${(data.impliedPct / data.userPct) * 100}%`,
                            background: "rgba(255,255,255,0.35)",
                            borderRadius: "0 99px 99px 0",
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--ink)",
                      width: 38,
                      textAlign: "right",
                    }}
                  >
                    {data.userPct}%
                  </span>
                </div>

                {/* Breakdown hint if ETF exposure exists */}
                {hasSP500 && data.impliedPct > 0 && (
                  <div
                    style={{
                      paddingLeft: 56,
                      fontSize: "0.68rem",
                      color: "var(--ink-muted)",
                      marginBottom: 2,
                    }}
                  >
                    {data.directPct > 0 && (
                      <span style={{ marginRight: 8 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "var(--accent)",
                            marginRight: 3,
                          }}
                        />
                        {data.directPct}% {l.direct}
                      </span>
                    )}
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "rgba(26,107,74,0.35)",
                          marginRight: 3,
                        }}
                      />
                      {data.impliedPct}% {l.via_etf}
                    </span>
                  </div>
                )}
              </div>

              {/* S&P 500 reference bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)", width: 48 }}>
                  {l.sp500}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "var(--paper-warm)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${sp500BarWidth}%`,
                      height: "100%",
                      background: "#c9993a",
                      borderRadius: 99,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--ink-muted)",
                    width: 38,
                    textAlign: "right",
                  }}
                >
                  {data.sp500Pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dead weight section */}
      {analysis.deadWeight?.length > 0 && (
        <div
          style={{
            marginTop: 28,
            padding: "14px 16px",
            background: "rgba(192,57,43,0.05)",
            border: "1px solid rgba(192,57,43,0.15)",
            borderRadius: "var(--radius)",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#c0392b",
              marginBottom: 6,
            }}
          >
            ⚠️ {l.dead_weight_title}
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--ink-muted)",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            {l.dead_weight_sub}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {analysis.deadWeight.map((d) => (
              <div
                key={d.symbol}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.82rem",
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                  {d.symbol}
                </span>
                <span style={{ color: "#c0392b", fontWeight: 600 }}>
                  {l.roi}: {d.roi}% &nbsp;·&nbsp; {l.weight}: {d.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
