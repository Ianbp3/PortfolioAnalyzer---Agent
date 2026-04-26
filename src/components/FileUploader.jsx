import React from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

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

// ── Core parsing (shared between Excel and CSV paths) ────────────────────────

function processRows(json, onPortfolioParsed) {
  if (!json || json.length < 2) {
    message.error("El archivo parece estar vacío o sin datos.");
    return;
  }

  // Filter out fully-empty rows (XLSX sometimes emits them)
  const nonEmpty = json.filter((row) =>
    Array.isArray(row) ? row.some((cell) => cell !== "" && cell != null) : true
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
        `Encabezados detectados: ${detected}`
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
      "No se pudieron leer posiciones válidas. Revisa que las filas tengan símbolo, cantidad y precio."
    );
    return;
  }

  onPortfolioParsed(positions);
  message.success(`Portafolio cargado: ${positions.length} posiciones.`);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FileUploader({ onPortfolioParsed }) {
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
    <Upload
      beforeUpload={handleFile}
      showUploadList={false}
      accept=".xlsx,.xls,.csv"
    >
      <Button icon={<UploadOutlined />}>
        Subir portafolio (Excel o CSV)
      </Button>
    </Upload>
  );
}
