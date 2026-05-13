/**
 * FolioSense — Hapi affiliate CTA injector for blog articles.
 *
 * Behavior:
 *   - Runs only when the user's language is Spanish (foliosense_lang === "es"
 *     or browser language starts with "es").
 *   - Inserts a styled CTA card inside `<article class="article-body">` —
 *     placed after roughly the middle <p> for natural reading flow.
 *   - Self-removes if the user toggles to English.
 *
 * Usage:
 *   <script src="/blog/affiliate-cta.js" defer></script>
 *
 * Place AFTER /i18n.js so translations are available.
 */
(function () {
  var HAPI_URL = "https://hapi.trade/es/rewards?code=IANBEL1";
  var CTA_ID = "fs-hapi-cta";

  function getLang() {
    var s = localStorage.getItem("foliosense_lang");
    if (s === "en" || s === "es") return s;
    return (navigator.language || "en").slice(0, 2).toLowerCase() === "es"
      ? "es"
      : "en";
  }

  function getText(key, fallback) {
    var t =
      window.TRANSLATIONS && window.TRANSLATIONS[getLang()]
        ? window.TRANSLATIONS[getLang()]
        : null;
    if (t && t[key]) return t[key];
    return fallback;
  }

  function ctaHtml() {
    var label = getText("hapi_cta_label", "Recomendado para LatAm");
    var h3 = getText(
      "hapi_cta_h3",
      "¿Quieres invertir en acciones de EE.UU. desde Latinoamérica?",
    );
    var desc = getText(
      "hapi_cta_desc",
      "Hapi te permite comprar acciones fraccionadas de empresas y ETFs de EE.UU. desde tu celular. Regístrate con nuestro enlace y gana hasta US$500 en cripto.",
    );
    var btn = getText("hapi_cta_btn", "Obtener mi recompensa en cripto →");
    var fine = getText(
      "hapi_cta_fine",
      "Enlace de referido. Recompensa sujeta a los términos y condiciones de Hapi.",
    );

    return (
      '<aside id="' +
      CTA_ID +
      '" style="' +
      "background:var(--accent-light);" +
      "border:1px solid var(--accent);" +
      "border-radius:var(--radius-lg);" +
      "padding:1.75rem 1.75rem;" +
      "margin:2.75rem 0;" +
      'font-family:var(--font-body);">' +
      // Label
      '<div style="' +
      "font-size:0.7rem;" +
      "font-weight:700;" +
      "text-transform:uppercase;" +
      "letter-spacing:0.07em;" +
      "color:var(--accent);" +
      'margin-bottom:0.6rem;">' +
      "💰 " +
      label +
      "</div>" +
      // Headline
      '<h3 style="' +
      "font-family:var(--font-display);" +
      "font-size:1.15rem;" +
      "font-weight:700;" +
      "color:var(--ink);" +
      "line-height:1.3;" +
      'margin:0 0 0.6rem;">' +
      h3 +
      "</h3>" +
      // Description
      '<p style="' +
      "color:var(--ink-soft);" +
      "font-size:0.95rem;" +
      "line-height:1.65;" +
      'margin:0 0 1.1rem;">' +
      desc +
      "</p>" +
      // Button
      '<a href="' +
      HAPI_URL +
      '" target="_blank" rel="sponsored noopener" style="' +
      "display:inline-block;" +
      "background:var(--accent);" +
      "color:var(--white);" +
      "padding:11px 22px;" +
      "border-radius:99px;" +
      "font-weight:600;" +
      "font-size:0.92rem;" +
      "text-decoration:none;" +
      'transition:background 0.2s;">' +
      btn +
      "</a>" +
      // Fine print
      '<p style="' +
      "color:var(--ink-muted);" +
      "font-size:0.72rem;" +
      "line-height:1.5;" +
      'margin:0.9rem 0 0;">' +
      fine +
      "</p>" +
      "</aside>"
    );
  }

  function findInsertionPoint(articleEl) {
    // Pick a paragraph in the middle third of the article so the CTA appears
    // after the user is engaged but before they finish reading.
    var paragraphs = articleEl.querySelectorAll(":scope > p");
    if (paragraphs.length === 0) return null;
    var idx = Math.floor(paragraphs.length * 0.55);
    return paragraphs[idx] || paragraphs[paragraphs.length - 1];
  }

  function injectCTA() {
    // Remove existing instance if present (in case of lang toggle to ES from EN)
    var existing = document.getElementById(CTA_ID);
    if (existing) existing.remove();

    if (getLang() !== "es") return; // only show in Spanish

    var article = document.querySelector("article.article-body");
    if (!article) return;

    var anchor = findInsertionPoint(article);
    if (!anchor) return;

    var wrapper = document.createElement("div");
    wrapper.innerHTML = ctaHtml().trim();
    anchor.parentNode.insertBefore(wrapper.firstChild, anchor.nextSibling);
  }

  function removeCTA() {
    var existing = document.getElementById(CTA_ID);
    if (existing) existing.remove();
  }

  function syncWithLang() {
    if (getLang() === "es") injectCTA();
    else removeCTA();
  }

  // Initial run
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncWithLang);
  } else {
    syncWithLang();
  }

  // Hook into the lang toggle: patch FolioSenseLang.toggle so we re-run after it
  function patchToggle() {
    if (!window.FolioSenseLang) {
      setTimeout(patchToggle, 50);
      return;
    }
    var orig = window.FolioSenseLang.toggle;
    window.FolioSenseLang.toggle = function () {
      if (orig) orig();
      setTimeout(syncWithLang, 30);
    };
  }
  patchToggle();

  // Also listen to storage events (different tab / external change)
  window.addEventListener("storage", function (e) {
    if (e.key === "foliosense_lang") syncWithLang();
  });
})();
