import React, { useState, useEffect } from "react";
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
import { Icon } from "./components/Icons";
import SectorComparison from "./components/SectorComparison";
import { analyzePortfolio } from "./api/chat";
import { useLang } from "./hooks/useLang";
import { usePersistedState } from "./hooks/usePersistedState";
import DownloadPdfButton from "./components/DownloadPdfButton";

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
  const { toggleLang, t, lang } = useLang();

  // Persisted to localStorage so the portfolio survives a page reload / revisit.
  // Data lives only in the user's browser — it is never sent to a server.
  const [positions, setPositions] = usePersistedState(
    "foliosense_positions",
    [],
  );
  const [analysis, setAnalysis] = usePersistedState(
    "foliosense_analysis",
    null,
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);

  function riskLabel(s) {
    if (s >= 70) return t.sect_risk_label_high;
    if (s >= 40) return t.sect_risk_label_mid;
    return t.sect_risk_label_low;
  }

  async function handlePositionsLoaded(newPositions) {
    setPositions(newPositions);
    setAnalysis(null);
    setAnalyzeError(null);
    setLoadingAnalysis(true);
    try {
      const result = await analyzePortfolio(newPositions);
      setAnalysis(result);
    } catch (err) {
      setAnalyzeError(t.error_connect);
    } finally {
      setLoadingAnalysis(false);
    }
  }

  function handleClear() {
    setPositions([]);
    setAnalysis(null);
    setAnalyzeError(null);
  }

  // Safety net: if the user reloaded while analysis was still computing, we'll
  // have restored positions but no analysis. Re-run it once on mount so the
  // dashboard always shows a complete, consistent state.
  useEffect(() => {
    if (positions.length > 0 && !analysis && !loadingAnalysis) {
      handlePositionsLoaded(positions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notes = analysis?.noteKeys?.map((k) => t[k]).filter(Boolean) || [];

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Header
        className="dash-header"
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--paper-warm)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <a
          href="https://www.foliosenseapp.com"
          className="dash-back"
          style={{
            textDecoration: "none",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "var(--ink-muted)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--ink-muted)")
          }
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} />
          <span className="dash-back-text">{t.back_link}</span>
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

        <div
          className="dash-actions"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <a
            href="https://www.foliosenseapp.com/how-it-works"
            className="dash-howto"
            style={{
              background: "transparent",
              border: "1.5px solid var(--paper-warm)",
              borderRadius: 99,
              padding: "0 14px",
              height: 32,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "var(--ink-soft)",
              textDecoration: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
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
            {lang === "es" ? "Cómo funciona" : "How it works"}
          </a>

          <button
            onClick={toggleLang}
            style={{
              background: "transparent",
              border: "1.5px solid var(--paper-warm)",
              borderRadius: 99,
              padding: "0 12px",
              height: 32,
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "0.75rem",
              color: "var(--ink-soft)",
              cursor: "pointer",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
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

          <DownloadPdfButton
            analysis={analysis}
            positions={positions}
            lang={lang}
          />

          <button
            className="dash-chat-toggle"
            onClick={() => setChatOpen((v) => !v)}
            style={{
              background: chatOpen ? "var(--ink)" : "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: 99,
              padding: "0 14px",
              height: 32,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {chatOpen ? <CloseOutlined /> : <MessageOutlined />}
            <span className="dash-chat-toggle-text">
              {chatOpen ? t.chat_close : t.chat_open}
            </span>
          </button>
        </div>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5965745153374411"
          crossorigin="anonymous"
        ></script>
      </Header>

      <Content
        className="dash-content"
        style={{ padding: "32px", background: "var(--paper)" }}
      >
        <div
          className="dash-grid"
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
                      color: "var(--accent)",
                    }}
                  >
                    <Icon name="docChart" size={32} stroke={1.6} />
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
                  </p>
                  <FileUploader onPortfolioParsed={handlePositionsLoaded} />
                </div>
              ) : (
                <div>
                  {analysis && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--ink)",
                          fontSize: "0.95rem",
                        }}
                      >
                        <Icon
                          name="checkLine"
                          size={14}
                          stroke={2.2}
                          color="var(--accent)"
                          style={{
                            display: "inline-block",
                            verticalAlign: "-2px",
                            marginRight: 6,
                          }}
                        />
                        {t.portfolio_loaded} · {positions.length} {t.assets}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <button
                          onClick={handleClear}
                          style={{
                            background: "transparent",
                            border: "1.5px solid var(--paper-warm)",
                            borderRadius: 99,
                            padding: "4px 14px",
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            color: "var(--ink-muted)",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "color 0.2s, border-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--danger)";
                            e.currentTarget.style.color = "var(--danger)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--paper-warm)";
                            e.currentTarget.style.color = "var(--ink-muted)";
                          }}
                        >
                          {lang === "es" ? "Borrar" : "Clear"}
                        </button>
                        <FileUploader
                          onPortfolioParsed={handlePositionsLoaded}
                          compact
                        />
                      </div>
                    </div>
                  )}
                  {loadingAnalysis && (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                      <Spin size="large" />
                      <p style={{ marginTop: 16, color: "var(--ink-muted)" }}>
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
              )}
            </div>

            {/* STATS ROW */}
            {analysis && (
              <div
                className="dash-stats"
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
                <SectorPieChart analysis={analysis} />
                <SectorComparison analysis={analysis} />
              </div>
            )}

            {/* DISTRIBUTION */}
            {positions.length > 0 && (
              <div className="section-card" data-pdf-chart="distribution">
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
              <div
                className="dash-charts-row"
                style={{ display: "flex", gap: 24, marginBottom: 24 }}
              >
                <div
                  className="section-card"
                  style={{ flex: 1, marginBottom: 0 }}
                  data-pdf-chart="radar"
                >
                  <PortfolioRadar analysis={analysis} />
                </div>
                <div
                  className="section-card"
                  style={{ flex: 1, marginBottom: 0 }}
                  data-pdf-chart="scatter"
                >
                  <ScatterRiskReturn positions={positions} />
                </div>
              </div>
            )}

            {/* SECTOR RANKING */}
            {positions.length > 0 && (
              <div className="section-card" data-pdf-chart="sector-ranking">
                <SectorRanking positions={positions} />
              </div>
            )}

            {/* ASSET RANKING */}
            {positions.length > 0 && (
              <div className="section-card" data-pdf-chart="asset-ranking">
                <AssetRanking positions={positions} />
              </div>
            )}
          </div>

          {/* CHAT */}
          {chatOpen && (
            <div
              className="dash-chat"
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
