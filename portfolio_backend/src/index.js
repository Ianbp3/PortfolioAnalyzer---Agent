import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { analyzePortfolio } from "./services/portfolioAnalyzer.js";

const app = express();
const port = process.env.PORT || 4000;

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or same-origin requests (no Origin header)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// ── RATE LIMITING ────────────────────────────────────────────────────────────
// General API limiter — protects all endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in 15 minutes." },
});

// Tighter limit on /api/chat to protect Groq credits
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Chat rate limit reached. Please wait a moment." },
});

app.use("/api/", apiLimiter);

// ── ROUTES ───────────────────────────────────────────────────────────────────
app.post("/api/analyze", (req, res) => {
  try {
    const { positions } = req.body;
    const analysis = analyzePortfolio(positions || []);
    return res.json(analysis);
  } catch (err) {
    console.error("[/api/analyze]", err);
    res.status(500).json({ error: "Error analyzing portfolio" });
  }
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    const { message, analysis, positions = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set");
      return res.status(503).json({ error: "LLM service not configured." });
    }

    // Build scatter data for the prompt (same logic as before)
    const totalValue = positions.reduce((sum, p) => sum + (p.value || 0), 0);
    const scatterData =
      totalValue > 0
        ? positions.map((p) => ({
            symbol: p.symbol,
            sector: p.sector,
            riesgo_pct: Number(((p.value / totalValue) * 100).toFixed(2)),
            retorno_pct:
              p.roi != null ? Number((p.roi * 100).toFixed(2)) : null,
          }))
        : [];

    // System prompt — same rules as before, now as a proper system message
    const systemPrompt = `Eres un asesor financiero profesional con una opinión clara sobre portafolios bien construidos.

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
${JSON.stringify(scatterData, null, 2)}`;

    // ── Groq API call (OpenAI-compatible) ───────────────────────────────────
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile", // free-tier model on Groq
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message.trim() },
          ],
          max_tokens: 1024,
          temperature: 0.7,
          stream: false,
        }),
      }
    );

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error(`[Groq] HTTP ${groqRes.status}:`, errBody);
      return res
        .status(502)
        .json({ error: "LLM service unavailable. Please try again." });
    }

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Strip any markdown formatting the model may still emit
    const clean = raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return res.json({ response: clean });
  } catch (err) {
    console.error("[/api/chat]", err);
    res.status(500).json({ error: "Chat error. Please try again." });
  }
});

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
