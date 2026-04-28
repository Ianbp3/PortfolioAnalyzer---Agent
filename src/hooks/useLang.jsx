/**
 * useLang — React language context for FolioSense dashboard
 * Syncs with the same localStorage key as the landing i18n.js
 * so language set on landing carries into the app.
 */
import { createContext, useContext, useState, useEffect } from "react";

// ── All UI strings ────────────────────────────────────────────────────────────
const T = {
  en: {
    // Header
    back_link:        "foliosenseapp.com",
    chat_open:        "AI Advisor",
    chat_close:       "Close advisor",
    lang_toggle:      "ES",

    // Upload card
    upload_title:     "Upload your portfolio",
    upload_desc_pre:  "An",
    upload_desc_or:   "or",
    upload_desc_post: "file with columns:",
    upload_opt:       "and optionally",
    portfolio_loaded: "Portfolio loaded",
    assets:           "assets",
    analyzing:        "Analyzing your portfolio…",
    error_connect:    "Could not connect to the analysis server. Try again.",

    // Section titles
    sect_overview:    "Overview",
    sect_risk:        "Risk score",
    sect_sectors:     "Sectors",
    sect_distribution:"Portfolio distribution",
    sect_rankings:    "Asset ranking",
    sect_risk_label_high: "High",
    sect_risk_label_mid:  "Moderate",
    sect_risk_label_low:  "Low",

    // Chat
    chat_header:      "AI Advisor",
    chat_powered:     "Powered by Groq",
    chat_ready:       "Your portfolio is ready. What do you want to know?",
    chat_upload_first:"Upload your portfolio to start chatting.",
    chat_placeholder: "Ask something about your portfolio…",
    chat_error:       "Connection error. Try again.",
    quick_prompts: [
      "What is my biggest risk?",
      "Where should I diversify?",
      "Which asset has the best return?",
      "Summarize my portfolio in 3 points.",
    ],

    // Article widget
    art_heading:      "Learn more",
    art_read:         "Read →",
    art_sub:          "Articles that might help you interpret your results.",
  },

  es: {
    // Header
    back_link:        "foliosenseapp.com",
    chat_open:        "Asesor IA",
    chat_close:       "Cerrar asesor",
    lang_toggle:      "EN",

    // Upload card
    upload_title:     "Sube tu portafolio",
    upload_desc_pre:  "Archivo",
    upload_desc_or:   "o",
    upload_desc_post: "con columnas:",
    upload_opt:       "y opcionalmente",
    portfolio_loaded: "Portafolio cargado",
    assets:           "activos",
    analyzing:        "Analizando tu portafolio…",
    error_connect:    "No se pudo conectar con el servidor de análisis. Intenta de nuevo.",

    // Section titles
    sect_overview:    "Resumen",
    sect_risk:        "Puntaje de riesgo",
    sect_sectors:     "Sectores",
    sect_distribution:"Distribución del portafolio",
    sect_rankings:    "Ranking de activos",
    sect_risk_label_high: "Alto",
    sect_risk_label_mid:  "Moderado",
    sect_risk_label_low:  "Bajo",

    // Chat
    chat_header:      "Asesor IA",
    chat_powered:     "Powered by Groq",
    chat_ready:       "Tu portafolio está listo. ¿Qué quieres saber?",
    chat_upload_first:"Sube tu portafolio para empezar a chatear.",
    chat_placeholder: "Pregunta algo sobre tu portafolio…",
    chat_error:       "Error de conexión. Intenta de nuevo.",
    quick_prompts: [
      "¿Cuál es mi mayor riesgo?",
      "¿Dónde debería diversificar?",
      "¿Qué activo tiene mejor rendimiento?",
      "Resume mi portafolio en 3 puntos.",
    ],

    // Article widget
    art_heading:      "Aprende más",
    art_read:         "Leer →",
    art_sub:          "Artículos que pueden ayudarte a interpretar tus resultados.",
  },
};

// ── Context ───────────────────────────────────────────────────────────────────
const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem("foliosense_lang");
    if (stored === "en" || stored === "es") return stored;
    return (navigator.language || "en").slice(0, 2) === "es" ? "es" : "en";
  });

  function setLang(l) {
    setLangState(l);
    localStorage.setItem("foliosense_lang", l);
  }

  function toggleLang() {
    setLang(lang === "en" ? "es" : "en");
  }

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t: T[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
