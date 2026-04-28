/**
 * FolioSense i18n — vanilla JS, zero dependencies
 * Drop this in /landing/ and include it in every HTML page.
 *
 * Usage:
 *   1. Add data-i18n="key" to any element whose textContent should be translated.
 *   2. Add data-i18n-href="key" to <a> tags whose href should change per language.
 *   3. Add id="lang-toggle" to the toggle button in the nav.
 *   4. <script src="/i18n.js"></script> at the END of <body>.
 */

const TRANSLATIONS = {
  en: {
    // ── NAV ──────────────────────────────────────────────────────
    nav_how:       "How it works",
    nav_why:       "Why invest",
    nav_glossary:  "Glossary",
    nav_blog:      "Blog",
    nav_cta:       "Launch app →",

    // ── INDEX hero ───────────────────────────────────────────────
    hero_badge:    "Free · No account needed",
    hero_h1:       "Understand your portfolio\nin 30 seconds.",
    hero_sub:      "Upload your CSV or Excel file. Get instant risk analysis, sector charts, and an AI advisor that knows your exact holdings.",
    hero_cta:      "Analyze my portfolio — free",
    hero_learn:    "See how it works →",

    // ── SOCIAL PROOF ─────────────────────────────────────────────
    proof_works:   "Works with stocks from",

    // ── FEATURES ─────────────────────────────────────────────────
    feat_badge:         "Features",
    feat_h2:            "Everything you need.\nNothing you don't.",
    feat_sub:           "No spreadsheets. No finance degree required. Just upload and understand.",
    feat1_title:        "Instant analysis",
    feat1_desc:         "Upload your CSV or Excel file and get a full breakdown in seconds. Risk score, sector distribution, top and worst performers — all calculated automatically.",
    feat2_title:        "AI chat advisor",
    feat2_desc:         "Ask anything about your portfolio in plain language. "Am I too concentrated in tech?" "What's my biggest risk?" Get clear, specific answers based on your actual holdings.",
    feat3_title:        "Visual breakdowns",
    feat3_desc:         "Pie charts, bar charts, scatter plots, and radar profiles. Every chart is interactive so you can see exactly where your money is and how it's performing.",
    feat4_title:        "Completely free",
    feat4_desc:         "No subscription. No account. No credit card. FolioSense is free forever for personal portfolio analysis.",

    // ── HOW IT WORKS page ────────────────────────────────────────
    hiw_badge:     "How it works",
    hiw_h1:        "From spreadsheet to strategy in 30 seconds.",
    hiw_sub:       "FolioSense is designed to be the fastest way to understand what your investments are actually doing — and what to do about it.",

    // ── WHY INVEST page ──────────────────────────────────────────
    wi_badge:      "The basics",
    wi_h1:         "Why your money should be working while you sleep.",
    wi_sub:        "A plain-language guide to why investing matters — and what happens to people who skip it.",

    // ── GLOSSARY page ────────────────────────────────────────────
    gl_badge:      "Reference",
    gl_h1:         "Investment terms, finally explained.",
    gl_sub:        "Every term you'll encounter when managing a portfolio — defined in plain language with real examples. No finance degree required.",
    gl_search:     "Search terms…",

    // ── BLOG ─────────────────────────────────────────────────────
    blog_badge:    "Blog",
    blog_h1:       "Learn to read your portfolio.",
    blog_sub:      "Plain-language guides on risk, diversification, and smarter investing.",
    blog_newest:   "Newest articles",
    blog_related:  "Related articles",
    blog_read:     "Read article →",
    blog_try_cta:  "Try it with your own portfolio →",

    // ── FOOTER ───────────────────────────────────────────────────
    footer_copy:   "© 2026 FolioSense. Not financial advice.",
    footer_privacy:"Privacy policy",

    // ── LANG TOGGLE ──────────────────────────────────────────────
    lang_toggle:   "ES",
  },

  es: {
    // ── NAV ──────────────────────────────────────────────────────
    nav_how:       "Cómo funciona",
    nav_why:       "Por qué invertir",
    nav_glossary:  "Glosario",
    nav_blog:      "Blog",
    nav_cta:       "Abrir app →",

    // ── INDEX hero ───────────────────────────────────────────────
    hero_badge:    "Gratis · Sin cuenta",
    hero_h1:       "Entiende tu portafolio\nen 30 segundos.",
    hero_sub:      "Sube tu archivo CSV o Excel. Obtén análisis de riesgo, gráficos por sector y un asesor IA que conoce exactamente lo que tienes.",
    hero_cta:      "Analizar mi portafolio — gratis",
    hero_learn:    "Ver cómo funciona →",

    // ── SOCIAL PROOF ─────────────────────────────────────────────
    proof_works:   "Funciona con acciones de",

    // ── FEATURES ─────────────────────────────────────────────────
    feat_badge:         "Funciones",
    feat_h2:            "Todo lo que necesitas.\nNada más.",
    feat_sub:           "Sin hojas de cálculo. Sin título en finanzas. Solo sube y entiende.",
    feat1_title:        "Análisis instantáneo",
    feat1_desc:         "Sube tu archivo CSV o Excel y obtén un desglose completo en segundos. Puntaje de riesgo, distribución por sector, mejores y peores posiciones — todo calculado automáticamente.",
    feat2_title:        "Asesor IA por chat",
    feat2_desc:         "Pregunta lo que quieras sobre tu portafolio en lenguaje común. "¿Estoy demasiado concentrado en tecnología?" "¿Cuál es mi mayor riesgo?" Respuestas claras basadas en tus datos reales.",
    feat3_title:        "Gráficos visuales",
    feat3_desc:         "Gráficos de pastel, barras, dispersión y perfiles radar. Cada gráfico es interactivo para que veas exactamente dónde está tu dinero y cómo se desempeña.",
    feat4_title:        "Completamente gratis",
    feat4_desc:         "Sin suscripción. Sin cuenta. Sin tarjeta de crédito. FolioSense es gratis para siempre para análisis personales.",

    // ── HOW IT WORKS page ────────────────────────────────────────
    hiw_badge:     "Cómo funciona",
    hiw_h1:        "De hoja de cálculo a estrategia en 30 segundos.",
    hiw_sub:       "FolioSense está diseñado para ser la forma más rápida de entender lo que realmente están haciendo tus inversiones — y qué hacer al respecto.",

    // ── WHY INVEST page ──────────────────────────────────────────
    wi_badge:      "Lo básico",
    wi_h1:         "Por qué tu dinero debería trabajar mientras duermes.",
    wi_sub:        "Una guía en lenguaje simple sobre por qué invertir importa — y qué les pasa a quienes no lo hacen.",

    // ── GLOSSARY page ────────────────────────────────────────────
    gl_badge:      "Referencia",
    gl_h1:         "Términos de inversión, por fin explicados.",
    gl_sub:        "Cada término que encontrarás al gestionar un portafolio — definido en lenguaje simple con ejemplos reales. Sin título en finanzas.",
    gl_search:     "Buscar términos…",

    // ── BLOG ─────────────────────────────────────────────────────
    blog_badge:    "Blog",
    blog_h1:       "Aprende a leer tu portafolio.",
    blog_sub:      "Guías en lenguaje simple sobre riesgo, diversificación e inversión inteligente.",
    blog_newest:   "Artículos recientes",
    blog_related:  "Artículos relacionados",
    blog_read:     "Leer artículo →",
    blog_try_cta:  "Pruébalo con tu portafolio real →",

    // ── FOOTER ───────────────────────────────────────────────────
    footer_copy:   "© 2026 FolioSense. No es asesoría financiera.",
    footer_privacy:"Política de privacidad",

    // ── LANG TOGGLE ──────────────────────────────────────────────
    lang_toggle:   "EN",
  },
};

// ── Href maps (pages change URL too) ─────────────────────────────────────────
const HREF_MAP = {
  en: {
    nav_how:      "/how-it-works",
    nav_why:      "/why-invest",
    nav_glossary: "/glossary",
    nav_blog:     "/blog",
  },
  es: {
    nav_how:      "/how-it-works",   // same page, content switches via i18n
    nav_why:      "/why-invest",
    nav_glossary: "/glossary",
    nav_blog:     "/blog",
  },
};

// ── Core ──────────────────────────────────────────────────────────────────────

function detectLang() {
  const stored = localStorage.getItem("foliosense_lang");
  if (stored === "en" || stored === "es") return stored;
  const browser = (navigator.language || navigator.userLanguage || "en")
    .toLowerCase()
    .slice(0, 2);
  return browser === "es" ? "es" : "en";
}

function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  const h = HREF_MAP[lang];

  // Text content
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Placeholder (inputs/textareas)
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Hrefs
  document.querySelectorAll("[data-i18n-href]").forEach((el) => {
    const key = el.dataset.i18nHref;
    if (h[key] !== undefined) el.href = h[key];
  });

  // Lang toggle button text
  const toggle = document.getElementById("lang-toggle");
  if (toggle) toggle.textContent = t.lang_toggle;

  // html[lang] attribute
  document.documentElement.lang = lang;

  // hreflang: update alternate links if present
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
    // handled statically in HTML, no JS needed
  });

  localStorage.setItem("foliosense_lang", lang);
}

function toggleLang() {
  const current = detectLang();
  applyLang(current === "en" ? "es" : "en");
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  applyLang(detectLang());

  const toggle = document.getElementById("lang-toggle");
  if (toggle) toggle.addEventListener("click", toggleLang);
});

// Expose for inline use if needed
window.FolioSenseLang = { apply: applyLang, toggle: toggleLang, detect: detectLang };
