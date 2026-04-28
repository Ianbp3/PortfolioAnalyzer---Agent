/**
 * FolioSense Blog Widget
 * Fetches /blog/blog-manifest.json and injects "Newest" + "Related" article sections.
 *
 * Usage in any HTML page:
 *   <div id="blog-newest"></div>       ← renders 3 newest articles
 *   <div id="blog-related"></div>      ← renders related by tags (needs data-tags attr)
 *   <script src="/blog/blog-widget.js"></script>
 *
 * For related articles, add to the <div>:
 *   <div id="blog-related" data-tags="risk,concentration" data-current-slug="portfolio-concentration-risk"></div>
 */

(function () {
  const MANIFEST_URL = "/blog/blog-manifest.json";

  function getLang() {
    const stored = localStorage.getItem("foliosense_lang");
    if (stored === "en" || stored === "es") return stored;
    return (navigator.language || "en").slice(0, 2) === "es" ? "es" : "en";
  }

  function articleUrl(article, lang) {
    if (lang === "es") return `/blog/es/${article.slugEs}`;
    return `/blog/${article.slug}`;
  }

  function articleTitle(article, lang) {
    return lang === "es" ? article.titleEs : article.titleEn;
  }

  function articleDesc(article, lang) {
    return lang === "es" ? article.descEs : article.descEn;
  }

  function formatDate(dateStr, lang) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(lang === "es" ? "es-HN" : "en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  }

  function renderCard(article, lang) {
    const url = articleUrl(article, lang);
    const readLabel = lang === "es" ? "Leer artículo →" : "Read article →";
    return `
      <a href="${url}" class="blog-card" style="
        display:block; text-decoration:none;
        background:var(--white); border:1px solid var(--paper-warm);
        border-radius:var(--radius-lg); padding:1.5rem;
        transition: box-shadow 0.2s, border-color 0.2s;
        color:inherit;
      " onmouseover="this.style.boxShadow='var(--shadow-lg)';this.style.borderColor='var(--accent-light)'"
         onmouseout="this.style.boxShadow='';this.style.borderColor='var(--paper-warm)'">
        <div style="font-size:0.75rem;color:var(--ink-muted);margin-bottom:0.5rem;">
          ${formatDate(article.published, lang)}
        </div>
        <h3 style="
          font-family:var(--font-display);font-size:1rem;font-weight:700;
          color:var(--ink);margin:0 0 0.5rem;line-height:1.35;
        ">${articleTitle(article, lang)}</h3>
        <p style="
          color:var(--ink-soft);font-size:0.875rem;
          line-height:1.65;margin:0 0 1rem;
        ">${articleDesc(article, lang)}</p>
        <span style="
          color:var(--accent);font-size:0.85rem;font-weight:600;
        ">${readLabel}</span>
      </a>`;
  }

  function renderSection(containerEl, articles, lang, headingKey) {
    const headings = {
      en: { newest: "Newest articles", related: "Related articles" },
      es: { newest: "Artículos recientes", related: "Artículos relacionados" },
    };
    const heading = headings[lang][headingKey];

    if (!articles.length) { containerEl.style.display = "none"; return; }

    containerEl.innerHTML = `
      <div style="margin: 3rem 0 0;">
        <h2 style="
          font-family:var(--font-display);font-size:1.4rem;font-weight:700;
          color:var(--ink);margin-bottom:1.25rem;padding-bottom:0.75rem;
          border-bottom:2px solid var(--paper-warm);
        ">${heading}</h2>
        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
          gap:1.25rem;
        ">
          ${articles.map(a => renderCard(a, lang)).join("")}
        </div>
      </div>`;
  }

  async function init() {
    const newestEl  = document.getElementById("blog-newest");
    const relatedEl = document.getElementById("blog-related");
    if (!newestEl && !relatedEl) return;

    const lang = getLang();

    let manifest;
    try {
      const res = await fetch(MANIFEST_URL);
      manifest = await res.json();
    } catch (e) {
      console.warn("[blog-widget] Could not load manifest:", e);
      return;
    }

    const all = manifest.articles || [];
    // Sort newest first
    const sorted = [...all].sort((a, b) => b.published.localeCompare(a.published));

    // ── Newest: top 3 ────────────────────────────────────────────────────────
    if (newestEl) {
      renderSection(newestEl, sorted.slice(0, 3), lang, "newest");
    }

    // ── Related: by matching tags, exclude current ───────────────────────────
    if (relatedEl) {
      const rawTags    = (relatedEl.dataset.tags || "").split(",").map(t => t.trim()).filter(Boolean);
      const currentSlug = relatedEl.dataset.currentSlug || "";

      const related = sorted
        .filter(a => a.slug !== currentSlug && a.slugEs !== currentSlug)
        .filter(a => rawTags.length === 0 || a.tags.some(t => rawTags.includes(t)))
        .slice(0, 3);

      renderSection(relatedEl, related, lang, "related");
    }
  }

  // Re-run if language is toggled (listens for storage events in same tab too)
  window.addEventListener("storage", (e) => {
    if (e.key === "foliosense_lang") init();
  });

  // Tiny hack: patch FolioSenseLang.apply so widget re-renders on toggle
  const _origToggle = window.FolioSenseLang?.toggle;
  if (window.FolioSenseLang) {
    window.FolioSenseLang.toggle = function () {
      _origToggle?.();
      setTimeout(init, 50); // after i18n.js finishes
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
