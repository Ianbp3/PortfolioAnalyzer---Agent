import React from "react";
import { useLang } from "../hooks/useLang";

const LABELS = {
  en: {
    title: "What drives your risk score",
    total: "Risk score",
    biggest: "Biggest driver",
    items: {
      concentration: {
        name: "Position concentration",
        hint: "How much weight sits in a few single stocks",
      },
      sector: {
        name: "Sector concentration",
        hint: "How much of the portfolio sits in your top sector",
      },
      breadth: {
        name: "Sector breadth",
        hint: "How few of the 11 sectors you cover",
      },
      volatility: {
        name: "Return dispersion",
        hint: "How spread out your positions' returns are",
      },
    },
  },
  es: {
    title: "Qué impulsa tu puntaje de riesgo",
    total: "Puntaje de riesgo",
    biggest: "Mayor impulsor",
    items: {
      concentration: {
        name: "Concentración por posición",
        hint: "Cuánto peso hay en pocas acciones individuales",
      },
      sector: {
        name: "Concentración por sector",
        hint: "Cuánto del portafolio está en tu sector principal",
      },
      breadth: {
        name: "Amplitud sectorial",
        hint: "Qué tan pocos de los 11 sectores cubres",
      },
      volatility: {
        name: "Dispersión de retornos",
        hint: "Qué tan dispares son los retornos de tus posiciones",
      },
    },
  },
};

const ORDER = ["concentration", "sector", "breadth", "volatility"];

function barColor(ratio) {
  if (ratio >= 0.7) return "#c0392b";
  if (ratio >= 0.4) return "#c9993a";
  return "#1a6b4a";
}

export default function RiskBreakdown({ analysis }) {
  const { lang } = useLang();
  const l = LABELS[lang] || LABELS.en;

  const breakdown = analysis?.riskBreakdown;
  if (!breakdown || !breakdown.concentration) return null;

  const rows = ORDER.map((key) => ({
    key,
    points: breakdown[key].points,
    max: breakdown[key].max,
    ratio: breakdown[key].max ? breakdown[key].points / breakdown[key].max : 0,
  }));

  const biggest = [...rows].sort((a, b) => b.points - a.points)[0];

  return (
    <div style={{ marginTop: 8, width: "100%" }}>
      <h3
        style={{
          textAlign: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "var(--ink)",
          marginBottom: 6,
        }}
      >
        {l.title}
      </h3>
      <p
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--ink-muted)",
          marginBottom: 20,
        }}
      >
        {l.total}:{" "}
        <strong style={{ color: "var(--ink)" }}>
          {analysis.riskScore}/100
        </strong>
        {"  ·  "}
        {l.biggest}:{" "}
        <strong style={{ color: "var(--ink)" }}>
          {l.items[biggest.key].name}
        </strong>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rows.map((r) => (
          <div key={r.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                {l.items[r.key].name}
              </span>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: barColor(r.ratio),
                }}
              >
                {r.points} / {r.max}
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "var(--paper-warm)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, r.ratio * 100)}%`,
                  height: "100%",
                  background: barColor(r.ratio),
                  borderRadius: 99,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--ink-muted)",
                marginTop: 4,
              }}
            >
              {l.items[r.key].hint}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
