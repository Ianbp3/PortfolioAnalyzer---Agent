import React, { useState, useEffect } from "react";
import { Upload, Button, message, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useLang } from "../hooks/useLang";

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeHeader(header) {
  if (!header) return "";
  return String(header)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents (precio → precio, símbolo → simbolo)
}

function parseROI(value) {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "string" && value.includes("%")) {
    const num = Number(value.replace("%", "").trim());
    if (!isNaN(num)) return num / 100;
  }

  const num = Number(value);
  if (!isNaN(num)) return num; // already decimal (e.g. 0.12)

  return null;
}

/**
 * Map normalized column names to logical field names.
 * Covers English, Spanish, and whatever the sample CSV uses.
 */
const HEADER_MAP_RULES = {
  symbol: ["symbol", "ticker", "activo", "simbolo", "asset"],
  shares: ["shares", "cantidad", "units", "acciones", "qty", "quantity"],
  price: ["price", "precio", "cost", "costo", "valor_unitario"],
  sector: ["sector", "industry", "industria"],
  roi: ["roi", "return", "rendimiento", "retorno", "ytd", "rendimientoytd"],
};

function buildHeaderMap(headerRow) {
  return headerRow.reduce((acc, colName, idx) => {
    const h = normalizeHeader(colName);
    for (const [field, aliases] of Object.entries(HEADER_MAP_RULES)) {
      if (aliases.includes(h) && acc[field] === undefined) {
        acc[field] = idx;
      }
    }
    return acc;
  }, {});
}

// ── Core parsing (shared between Excel, CSV and pasted-text paths) ───────────

function processRows(json, onPortfolioParsed) {
  if (!json || json.length < 2) {
    message.error("El archivo parece estar vacío o sin datos.");
    return;
  }

  // Filter out fully-empty rows (XLSX sometimes emits them)
  const nonEmpty = json.filter((row) =>
    Array.isArray(row) ? row.some((cell) => cell !== "" && cell != null) : true,
  );

  const [headerRow, ...rows] = nonEmpty;

  if (!headerRow || headerRow.length === 0) {
    message.error("No se encontró una fila de encabezados válida.");
    return;
  }

  const headerMap = buildHeaderMap(headerRow);

  if (
    headerMap.symbol === undefined ||
    headerMap.shares === undefined ||
    headerMap.price === undefined
  ) {
    const detected = headerRow.map(normalizeHeader).join(", ");
    message.error(
      `El archivo debe tener columnas para símbolo, cantidad y precio.\n` +
        `Encabezados detectados: ${detected}`,
    );
    return;
  }

  const positions = rows
    .map((row) => {
      const symbol = row[headerMap.symbol];
      const shares = Number(row[headerMap.shares] ?? 0);
      const price = Number(row[headerMap.price] ?? 0);

      if (!symbol || isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0)
        return null;

      const sector =
        headerMap.sector !== undefined
          ? String(row[headerMap.sector] || "Sin sector")
          : "Sin sector";

      const roi =
        headerMap.roi !== undefined ? parseROI(row[headerMap.roi]) : null;

      return {
        symbol: String(symbol).toUpperCase().trim(),
        shares,
        price,
        value: shares * price,
        sector,
        roi,
      };
    })
    .filter(Boolean);

  if (positions.length === 0) {
    message.error(
      "No se pudieron leer posiciones válidas. Revisa que las filas tengan símbolo, cantidad y precio.",
    );
    return;
  }

  onPortfolioParsed(positions);
  message.success(`Portafolio cargado: ${positions.length} posiciones.`);
}

// Parse a raw CSV string (e.g. pasted from an AI chat) through the same pipeline.
function parseCsvText(rawText, onPortfolioParsed, lang) {
  let text = (rawText || "").trim();

  // Strip markdown code fences if the user pasted a ``` block
  text = text
    .replace(/^```[a-zA-Z]*\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  if (!text) {
    message.warning(
      lang === "es"
        ? "Pega primero el texto CSV."
        : "Paste the CSV text first.",
    );
    return;
  }

  try {
    const workbook = XLSX.read(text, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    processRows(json, onPortfolioParsed);
  } catch (err) {
    console.error(err);
    message.error(
      lang === "es"
        ? "No se pudo leer el texto. Verifica que sea un CSV válido."
        : "Couldn't read the text. Make sure it's valid CSV.",
    );
  }
}

// ── Sample portfolio ─────────────────────────────────────────────────────────
// Loaded automatically when the dashboard is opened with ?sample=1 (the
// "Try our sample file" link on the How it works page). Looks diversified on
// the surface (12 holdings, several sectors, two index ETFs) but is tech-heavy
// on purpose: QQQ and SPYG are themselves tech-concentrated, so once you look
// through them, Technology is ~49% of the portfolio. This showcases the
// look-through overlap and the "you're overweight tech" lesson, while also
// having a loser with real weight (TSLA) for the dead-weight feature.
const SAMPLE_CSV = `symbol,shares,price,sector,roi
AAPL,22,227.00,Technology,0.16
NVDA,28,178.00,Technology,0.44
MSFT,9,500.00,Technology,0.23
AVGO,18,196.00,Technology,0.31
QQQ,14,555.00,ETF,0.27
SPYG,50,120.00,ETF,0.20
AMZN,15,233.00,Consumer Discretionary,0.11
TSLA,13,346.00,Consumer Discretionary,-0.15
JPM,16,250.00,Financials,0.07
JNJ,16,156.00,Healthcare,-0.08
KO,32,62.50,Consumer Staples,0.04
XOM,18,111.00,Energy,-0.06`;

// Module-level guard so the sample loads at most once per page load, even
// though FileUploader is mounted twice (full empty-state + compact header).
let sampleAutoLoaded = false;

// ── Component ─────────────────────────────────────────────────────────────────

export default function FileUploader({ onPortfolioParsed }) {
  const { lang } = useLang();
  const [showPaste, setShowPaste] = useState(false);
  const [pastedText, setPastedText] = useState("");

  // Auto-load the sample portfolio when arriving via /dashboard?sample=1
  // (or ?demo). Fills the paste box so the format is visible, then runs the
  // same analysis path as a normal upload. Strips the query param afterwards
  // so a refresh won't overwrite the user's own data.
  useEffect(() => {
    if (sampleAutoLoaded) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("sample") && !params.has("demo")) return;

    sampleAutoLoaded = true;
    try {
      window.history.replaceState({}, "", window.location.pathname);
    } catch (e) {
      /* ignore: replaceState may fail in some embedded contexts */
    }

    setShowPaste(true);
    setPastedText(SAMPLE_CSV);
    parseCsvText(SAMPLE_CSV, onPortfolioParsed, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      // Read as plain text so XLSX can parse the CSV string
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: "string" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          processRows(json, onPortfolioParsed);
        } catch (err) {
          console.error(err);
          message.error("Error leyendo el CSV. Verifica el formato.");
        }
      };
      reader.onerror = () => message.error("No se pudo leer el archivo.");
      reader.readAsText(file);
    } else {
      // Excel (.xlsx / .xls)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          processRows(json, onPortfolioParsed);
        } catch (err) {
          console.error(err);
          message.error("Error leyendo el Excel. Verifica el formato.");
        }
      };
      reader.onerror = () => message.error("No se pudo leer el archivo.");
      reader.readAsArrayBuffer(file);
    }

    return false; // prevent antd's default upload behaviour
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <Upload
        beforeUpload={handleFile}
        showUploadList={false}
        accept=".xlsx,.xls,.csv"
      >
        <Button icon={<UploadOutlined />}>
          {lang === "es"
            ? "Subir portafolio (Excel o CSV)"
            : "Upload portfolio (Excel or CSV)"}
        </Button>
      </Upload>

      <button
        onClick={() => setShowPaste((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: "var(--ink-muted)",
          fontFamily: "var(--font-body)",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {showPaste
          ? lang === "es"
            ? "Ocultar"
            : "Hide"
          : lang === "es"
            ? "o pega el texto CSV de tu IA"
            : "or paste CSV text from your AI"}
      </button>

      {showPaste && (
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Input.TextArea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={6}
            placeholder={
              "symbol,shares,price,sector,roi\nAAPL,12,185.32,Technology,0.14\nMSFT,8,402.10,Technology,0.21"
            }
            style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
          />
          <Button
            type="primary"
            onClick={() => parseCsvText(pastedText, onPortfolioParsed, lang)}
          >
            {lang === "es" ? "Analizar texto pegado" : "Analyze pasted text"}
          </Button>
        </div>
      )}
    </div>
  );
}
