import React, { useState } from "react";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { message } from "antd";
import { generatePortfolioPdf } from "../utils/generatePortfolioPdf";

/**
 * DownloadPdfButton — pill button matching the dashboard header style.
 * Disabled until an analysis exists. Generates the snapshot entirely in the
 * browser via generatePortfolioPdf().
 *
 * Usage:
 *   <DownloadPdfButton analysis={analysis} positions={positions} lang={lang} />
 */
export default function DownloadPdfButton({
  analysis,
  positions,
  lang = "en",
}) {
  const [busy, setBusy] = useState(false);
  const disabled = !analysis || busy;

  const label = "PDF";
  const ariaLabel =
    lang === "es" ? "Descargar PDF del portafolio" : "Download portfolio PDF";

  const handleClick = async () => {
    if (disabled) return;
    setBusy(true);
    try {
      // Let the spinner paint before the capture work begins
      await new Promise((r) => requestAnimationFrame(() => r()));
      await generatePortfolioPdf(analysis, positions, lang);
    } catch (err) {
      console.error("PDF generation failed:", err);
      message.error(
        lang === "es"
          ? "No se pudo generar el PDF. Intenta de nuevo."
          : "Couldn't generate the PDF. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="dash-pdf-btn"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        background: "transparent",
        border: "1.5px solid var(--paper-warm)",
        borderRadius: 99,
        padding: "0 14px",
        height: 32,
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: "0.8rem",
        color: disabled ? "var(--ink-muted)" : "var(--ink-soft)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        transition: "color 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.color = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = "var(--paper-warm)";
        e.currentTarget.style.color = "var(--ink-soft)";
      }}
    >
      {busy ? <LoadingOutlined /> : <DownloadOutlined />}
      <span className="dash-pdf-text">{label}</span>
    </button>
  );
}
