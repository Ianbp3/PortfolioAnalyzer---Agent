import express from "express";
import cors from "cors";
import { analyzePortfolio } from "./services/portfolioAnalyzer.js";

const app = express();
const port = 4000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.post("/api/analyze", (req, res) => {
  try {
    const { positions } = req.body;
    const analysis = analyzePortfolio(positions || []);
    return res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error analyzing portfolio" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, analysis, positions = [] } = req.body;

    // --- construir datos tipo scatter (riesgo vs retorno) ---
    const totalValue = positions.reduce((sum, p) => sum + (p.value || 0), 0);

    const scatterData =
      totalValue > 0
        ? positions.map((p) => ({
            symbol: p.symbol,
            sector: p.sector,
            riesgo_pct: Number(((p.value / totalValue) * 100).toFixed(2)), // eje X
            retorno_pct:
              p.roi != null ? Number((p.roi * 100).toFixed(2)) : null, // eje Y
          }))
        : [];

    const prompt = `
Eres un asesor financiero profesional con una opinión clara sobre portafolios bien construidos.

Reglas:
- Un buen portafolio suele tener 40%-60% en un ETF amplio tipo SP500.
- Ninguna posición individual debería superar el 10% del portafolio.
- La suma de todas las posiciones en crypto no debe exceder el 10%.
- Cuando el portafolio cumple buenas prácticas, felicita al usuario.
- Cuando hay concentraciones o riesgos altos, advierte con claridad.

Siempre:
- Responde en texto simple, en español.
- NO uses markdown, ni asteriscos, ni código.
- Escribe párrafos claros con saltos de línea.
- Sé directo y evita repetir frases.
- Usa SIEMPRE los datos que se te dan sobre el portafolio, ROI, sectores y scatter.

Si el usuario pregunta por el portafolio o los gráficos:
- Usa el análisis numérico.
- Usa la lista de posiciones con ROI.
- Usa los datos del scatter: eje X = riesgo_pct (peso %), eje Y = retorno_pct (ROI %).
- Da ejemplos concretos de activos (por símbolo), sectores y pesos.

ANÁLISIS DEL PORTAFOLIO:
${JSON.stringify(analysis, null, 2)}

POSICIONES DETALLADAS (incluye ROI):
${JSON.stringify(positions, null, 2)}

DATOS DEL GRÁFICO SCATTER
(cada punto: symbol, sector, riesgo_pct = eje X, retorno_pct = eje Y):
${JSON.stringify(scatterData, null, 2)}

PREGUNTA DEL USUARIO:
${message}

RESPUESTA:
`.trim();

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        prompt,
        stream: false,
      }),
    });

    const data = await ollamaResponse.json();

    const clean = (data.response || "")
      .replace(/\s+/g, " ")
      .replace(/([a-zA-Z])\1{2,}/g, "$1")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    return res.json({ response: clean });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Chat error" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
