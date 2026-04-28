import { createContext, useContext, useState } from "react";

const T = {
  en: {
    back_link: "foliosenseapp.com",
    chat_open: "AI Advisor",
    chat_close: "Close advisor",
    lang_toggle: "ES",

    upload_title: "Upload your portfolio",
    upload_desc_pre: "An",
    upload_desc_or: "or",
    upload_desc_post: "file with columns:",
    upload_opt: "and optionally",
    portfolio_loaded: "Portfolio loaded",
    assets: "assets",
    analyzing: "Analyzing your portfolio…",
    error_connect: "Could not connect to the analysis server. Try again.",

    sect_risk: "Risk score",
    sect_sectors: "Sectors",
    sect_distribution: "Portfolio distribution",
    sect_risk_label_high: "High",
    sect_risk_label_mid: "Moderate",
    sect_risk_label_low: "Low",

    stat_total_value: "Total value",
    stat_assets: "Assets",
    stat_max_concentration: "Max. concentration",

    chart_distribution: "Distribution",
    chart_by_asset: "Weight by asset",
    chart_weight: "Weight",

    radar_title: "Portfolio Profile",
    radar_risk: "Risk",
    radar_concentration: "Concentration",
    radar_diversification: "Diversification",
    radar_technology: "Technology",
    radar_series: "Profile",

    scatter_title: "Scatter: Risk (weight %) vs Return (%)",
    scatter_risk: "Risk",
    scatter_return: "Return",
    scatter_assets: "Assets",

    sector_ranking_title: "Sector Ranking (Avg ROI)",
    sector_assets: "assets",

    asset_top5: "Top 5 Assets by ROI",
    asset_bottom5: "Bottom 5 Assets by ROI",

    // Analyzer notes
    note_no_positions: "No positions received.",
    note_high_concentration: "High concentration (>40%) in a single asset.",
    note_low_diversification:
      "Low diversification — consider adding more assets.",
    note_good_balance: "Good overall balance.",

    chat_header: "AI Advisor",
    chat_powered: "Powered by Groq",
    chat_ready: "Your portfolio is ready. What do you want to know?",
    chat_upload_first: "Upload your portfolio to start chatting.",
    chat_placeholder: "Ask something about your portfolio…",
    chat_error: "Connection error. Try again.",
    quick_prompts: [
      "What is my biggest risk?",
      "Where should I diversify?",
      "Which asset has the best return?",
      "Summarize my portfolio in 3 points.",
    ],

    art_heading: "Learn more",
    art_read: "Read →",
    art_sub: "Articles that might help you interpret your results.",
  },

  es: {
    back_link: "foliosenseapp.com",
    chat_open: "Asesor IA",
    chat_close: "Cerrar asesor",
    lang_toggle: "EN",

    upload_title: "Sube tu portafolio",
    upload_desc_pre: "Archivo",
    upload_desc_or: "o",
    upload_desc_post: "con columnas:",
    upload_opt: "y opcionalmente",
    portfolio_loaded: "Portafolio cargado",
    assets: "activos",
    analyzing: "Analizando tu portafolio…",
    error_connect: "No se pudo conectar con el servidor. Intenta de nuevo.",

    sect_risk: "Puntaje de riesgo",
    sect_sectors: "Sectores",
    sect_distribution: "Distribución del portafolio",
    sect_risk_label_high: "Alto",
    sect_risk_label_mid: "Moderado",
    sect_risk_label_low: "Bajo",

    stat_total_value: "Valor total",
    stat_assets: "Activos",
    stat_max_concentration: "Concentración máx.",

    chart_distribution: "Distribución",
    chart_by_asset: "Peso por activo",
    chart_weight: "Peso",

    radar_title: "Perfil del Portafolio",
    radar_risk: "Riesgo",
    radar_concentration: "Concentración",
    radar_diversification: "Diversificación",
    radar_technology: "Tecnología",
    radar_series: "Perfil",

    scatter_title: "Scatter: Riesgo (peso %) vs Retorno (%)",
    scatter_risk: "Riesgo",
    scatter_return: "Retorno",
    scatter_assets: "Activos",

    sector_ranking_title: "Ranking por Sector (ROI Promedio)",
    sector_assets: "activos",

    asset_top5: "Top 5 Activos por ROI",
    asset_bottom5: "Peores 5 Activos por ROI",

    // Analyzer notes
    note_no_positions: "No se recibieron posiciones.",
    note_high_concentration: "Alta concentración (>40%) en un solo activo.",
    note_low_diversification:
      "Poca diversificación — considera agregar más activos.",
    note_good_balance: "Buen balance general.",

    chat_header: "Asesor IA",
    chat_powered: "Powered by Groq",
    chat_ready: "Tu portafolio está listo. ¿Qué quieres saber?",
    chat_upload_first: "Sube tu portafolio para empezar a chatear.",
    chat_placeholder: "Pregunta algo sobre tu portafolio…",
    chat_error: "Error de conexión. Intenta de nuevo.",
    quick_prompts: [
      "¿Cuál es mi mayor riesgo?",
      "¿Dónde debería diversificar?",
      "¿Qué activo tiene mejor rendimiento?",
      "Resume mi portafolio en 3 puntos.",
    ],

    art_heading: "Aprende más",
    art_read: "Leer →",
    art_sub: "Artículos que pueden ayudarte a interpretar tus resultados.",
  },
};

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
