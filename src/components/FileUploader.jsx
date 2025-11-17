import React from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

function normalizeHeader(header) {
  if (!header) return "";
  return String(header).toLowerCase().trim();
}

function parseROI(value) {
  if (!value) return null;

  if (typeof value === "string" && value.includes("%")) {
    const num = Number(value.replace("%", "").trim());
    if (!isNaN(num)) return num / 100;
  }

  const num = Number(value);
  if (!isNaN(num)) return num; // Ya viene como decimal (ej: 0.12)

  return null;
}

export default function FileUploader({ onPortfolioParsed }) {
  const handleFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!json || json.length < 2) {
          message.error("El archivo parece estar vacío o sin datos.");
          return;
        }

        const [headerRow, ...rows] = json;

        const headerMap = headerRow.reduce((acc, colName, idx) => {
          const h = normalizeHeader(colName);
          if (["symbol", "ticker", "activo"].includes(h)) acc.symbol = idx;
          if (["shares", "cantidad", "units", "acciones"].includes(h))
            acc.shares = idx;
          if (["price", "precio"].includes(h)) acc.price = idx;
          if (["sector"].includes(h)) acc.sector = idx;
          if (["roi", "return", "rendimiento", "retorno"].includes(h))
            acc.roi = idx;
          return acc;
        }, {});

        if (
          headerMap.symbol === undefined ||
          headerMap.shares === undefined ||
          headerMap.price === undefined
        ) {
          message.error(
            "El archivo debe incluir columnas: symbol, shares y price."
          );
          return;
        }

        const positions = rows
          .map((row) => {
            const symbol = row[headerMap.symbol];
            const shares = Number(row[headerMap.shares] || 0);
            const price = Number(row[headerMap.price] || 0);

            const sector =
              headerMap.sector !== undefined
                ? row[headerMap.sector] || "Sin sector"
                : "Sin sector";

            const roi =
              headerMap.roi !== undefined ? parseROI(row[headerMap.roi]) : null;

            if (!symbol || isNaN(shares) || isNaN(price)) return null;

            return {
              symbol: String(symbol),
              shares,
              price,
              value: shares * price,
              sector,
              roi, // <-- YA MANDAMOS EL ROI
            };
          })
          .filter(Boolean);

        if (positions.length === 0) {
          message.error("No se pudieron leer posiciones válidas del archivo.");
          return;
        }

        onPortfolioParsed(positions);
        message.success("Portafolio cargado correctamente.");
      } catch (err) {
        console.error(err);
        message.error("Error leyendo el archivo. Verifica el formato.");
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  return (
    <Upload beforeUpload={handleFile} showUploadList={false}>
      <Button icon={<UploadOutlined />}>Subir portafolio (Excel)</Button>
    </Upload>
  );
}
