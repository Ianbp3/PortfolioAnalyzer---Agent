import React, { useState } from "react";
import { Layout, Spin, Alert } from "antd";
import {
  ArrowLeftOutlined,
  MessageOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import FileUploader from "./components/FileUploader";
import Chat from "./components/chat";
import PortfolioCharts from "./components/PortfolioCharts";
import SectorPieChart from "./components/SectorPieChart";
import PortfolioRadar from "./components/PortfolioRadar";
import SectorRanking from "./components/SectorRanking";
import AssetRanking from "./components/AssetRanking";
import ScatterRiskReturn from "./components/ScatterRiskReturn";
import ArticleWidget from "./components/ArticleWidget";
import { analyzePortfolio } from "./api/chat";
import { useLang } from "./hooks/useLang";

const { Header, Content } = Layout;

function riskColor(score) {
  if (score >= 70) return "#c0392b";
  if (score >= 40) return "#c9993a";
  return "#1a6b4a";
}

function formatPercent(v) {
  return (v * 100).toFixed(1) + "%";
}

function formatCurrency(v) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

export default function App() {
  const { toggleLang, t } = useLang();

  const [positions, setPositions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);

  function riskLabel(s) {
    if (s >= 70) return t.sect_risk_label_high;
    if (s >= 40) return t.sect_risk_label_mid;
    return t.sect_risk_label_low;
  }

  const handlePortfolioParsed = async (parsed) => {
    setPositions(parsed);
    setAnalysis(null);
    setAnalyzeError(null);
    setLoadingAnalysis(true);
    try {
      const data = await analyzePortfolio(parsed);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setAnalyzeError(t.error_connect);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Translate noteKeys from backend into current language
  const notes = (analysis?.noteKeys || []).map((k) => t[k] || k);

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--paper)" }}>
      {/* NAV */}
      <Header
        style={{
          background: "rgba(247,246,242,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--paper-warm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 32,
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 64,
          lineHeight: "normal",
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--ink-muted)",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--ink-muted)")
          }
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} />
          {t.back_link}
        </a>

        <a
          href="/"
          style={{
            textDecoration: "none",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "var(--ink)",
          }}
        >
          Folio<span style={{ color: "var(--accent)" }}>Sense</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={toggleLang}
            style={{
              background: "transparent",
              border: "1.5px solid var(--paper-warm)",
              borderRadius: 99,
              padding: "7px 14px",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "0.78rem",
              color: "var(--ink-soft)",
              cursor: "pointer",
              letterSpacing: "0.06em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--paper-warm)";
              e.currentTarget.style.color = "var(--ink-soft)";
            }}
          >
            {t.lang_toggle}
          </button>

          <button
            onClick={() => setChatOpen((v) => !v)}
            style={{
              background: chatOpen ? "var(--ink)" : "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: 99,
              padding: "9px 20px",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {chatOpen ? <CloseOutlined /> : <MessageOutlined />}
            {chatOpen ? t.chat_close : t.chat_open}
          </button>
        </div>
      </Header>

      <Content style={{ padding: "32px", background: "var(--paper)" }}>
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <div style={{ flex: 3, minWidth: 0 }}>
            {/* UPLOAD */}
            <div className="section-card">
              {!analysis && !loadingAnalysis ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "var(--accent-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      fontSize: 32,
                    }}
                  >
                    📊
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "1.5rem",
                      color: "var(--ink)",
                      margin: "0 0 8px",
                    }}
                  >
                    {t.upload_title}
                  </h2>
                  <p
                    style={{
                      color: "var(--ink-muted)",
                      fontSize: "0.95rem",
                      maxWidth: 460,
                      margin: "0 auto 28px",
                      lineHeight: 1.6,
                    }}
                  >
                    {t.upload_desc_pre} <strong>Excel (.xlsx)</strong>{" "}
                    {t.upload_desc_or} <strong>CSV</strong> {t.upload_desc_post}{" "}
                    <code
                      style={{
                        background: "var(--paper-warm)",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: "0.85em",
                      }}
                    >
                      symbol
                    </code>
                    ,{" "}
                    <code
                      style={{
                        background: "var(--paper-warm)",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: "0.85em",
                      }}
                    >
                      shares
                    </code>
                    ,{" "}
                    <code
                      style={{
                        background: "var(--paper-warm)",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: "0.85em",
                      }}
                    >
                      price
                    </code>{" "}
                    {t.upload_opt}{" "}
                    <code
                      style={{
                        background: "var(--paper-warm)",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: "0.85em",
                      }}
                    >
                      sector
                    </code>
                    ,{" "}
                    <code
                      style={{
                        background: "var(--paper-warm)",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: "0.85em",
                      }}
                    >
                      roi
                    </code>
                    .
                  </p>
                  <FileUploader onPortfolioParsed={handlePortfolioParsed} />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "var(--ink)",
                      }}
                    >
                      {t.portfolio_loaded}
                    </span>
                    <span
                      style={{
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                        borderRadius: 99,
                        padding: "3px 12px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {positions.length} {t.assets}
                    </span>
                  </div>
                  <FileUploader onPortfolioParsed={handlePortfolioParsed} />
                </div>
              )}
              {loadingAnalysis && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    marginTop: 16,
                  }}
                >
                  <Spin size="large" />
                  <p
                    style={{
                      marginTop: 16,
                      color: "var(--ink-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {t.analyzing}
                  </p>
                </div>
              )}
              {analyzeError && (
                <Alert
                  style={{ marginTop: 16 }}
                  type="error"
                  message={analyzeError}
                  showIcon
                />
              )}
            </div>

            {/* STATS ROW */}
            {analysis && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <div className="stat-card">
                  <div className="stat-label">{t.stat_total_value}</div>
                  <div className="stat-value">
                    {formatCurrency(analysis.totalValue)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t.stat_assets}</div>
                  <div className="stat-value">{analysis.diversification}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t.stat_max_concentration}</div>
                  <div className="stat-value">
                    {formatPercent(analysis.concentration)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t.sect_risk}</div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      className="stat-value"
                      style={{ color: riskColor(analysis.riskScore) }}
                    >
                      {analysis.riskScore}
                    </div>
                    <span
                      className="risk-badge"
                      style={{
                        background: riskColor(analysis.riskScore) + "1a",
                        color: riskColor(analysis.riskScore),
                      }}
                    >
                      {riskLabel(analysis.riskScore)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* RISK BAR */}
            {analysis && (
              <div className="section-card">
                <h3 className="section-title">{t.sect_risk}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      color: riskColor(analysis.riskScore),
                    }}
                  >
                    {analysis.riskScore}
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "var(--ink-muted)",
                        fontWeight: 400,
                      }}
                    >
                      /100
                    </span>
                  </div>
                  <span
                    className="risk-badge"
                    style={{
                      background: riskColor(analysis.riskScore) + "1a",
                      color: riskColor(analysis.riskScore),
                      fontSize: "0.9rem",
                      padding: "4px 14px",
                    }}
                  >
                    {riskLabel(analysis.riskScore)}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    height: 4,
                    background: "var(--paper-warm)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${analysis.riskScore}%`,
                      height: "100%",
                      background: riskColor(analysis.riskScore),
                      borderRadius: 99,
                      transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* SECTORS */}
            {analysis && (
              <div className="section-card">
                <h3 className="section-title">{t.sect_sectors}</h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  {Object.entries(analysis.sectors || {}).map(
                    ([sector, info]) => (
                      <span
                        key={sector}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 99,
                          background: "var(--accent-light)",
                          color: "var(--accent)",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        {sector} · {info.positions} pos · $
                        {info.value.toFixed(0)}
                      </span>
                    ),
                  )}
                </div>
                {notes.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    {notes.map((n, i) => (
                      <p
                        key={i}
                        style={{
                          color: "var(--ink-soft)",
                          fontSize: "0.875rem",
                          margin: "4px 0",
                        }}
                      >
                        • {n}
                      </p>
                    ))}
                  </div>
                )}
                <SectorPieChart sectors={analysis.sectors} />
                <SectorRanking positions={positions} />
              </div>
            )}

            {/* DISTRIBUTION */}
            {positions.length > 0 && (
              <div className="section-card">
                <h3 className="section-title">{t.sect_distribution}</h3>
                <PortfolioCharts data={positions} />
              </div>
            )}

            {/* ARTICLE WIDGET */}
            {analysis && (
              <ArticleWidget
                tags={["risk", "concentration", "diversification"]}
              />
            )}

            {/* RADAR + SCATTER */}
            {analysis && positions.length > 0 && (
              <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                <div
                  className="section-card"
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <PortfolioRadar analysis={analysis} />
                </div>
                <div
                  className="section-card"
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <ScatterRiskReturn positions={positions} />
                </div>
              </div>
            )}

            {/* ASSET RANKING */}
            {positions.length > 0 && (
              <div className="section-card">
                <AssetRanking positions={positions} />
              </div>
            )}
          </div>

          {/* CHAT */}
          {chatOpen && (
            <div
              style={{
                flex: 1,
                maxWidth: 380,
                minWidth: 300,
                position: "sticky",
                top: 80,
                height: "calc(100vh - 112px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Chat analysis={analysis} positions={positions} />
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
