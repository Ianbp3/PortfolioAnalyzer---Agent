/**
 * ArticleWidget — renders 3 relevant blog articles inside the dashboard.
 * Drops between the chart sections to drive engagement back to the blog.
 *
 * Usage: <ArticleWidget tags={["risk", "concentration"]} />
 */
import { useEffect, useState } from "react";
import { useLang } from "../hooks/useLang";

const MANIFEST_URL = "https://foliosenseapp.com/blog/blog-manifest.json";

export default function ArticleWidget({ tags = [] }) {
  const { lang, t } = useLang();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(MANIFEST_URL)
      .then((r) => r.json())
      .then((data) => {
        const all = data.articles || [];
        const sorted = [...all].sort((a, b) => b.published.localeCompare(a.published));

        const filtered =
          tags.length > 0
            ? sorted.filter((a) => a.tags.some((tag) => tags.includes(tag)))
            : sorted;

        setArticles(filtered.slice(0, 3));
      })
      .catch(() => {}); // silently fail — widget is non-critical
  }, []);

  if (!articles.length) return null;

  function articleUrl(a) {
    return lang === "es"
      ? `https://foliosenseapp.com/blog/es/${a.slugEs}`
      : `https://foliosenseapp.com/blog/${a.slug}`;
  }

  function articleTitle(a) {
    return lang === "es" ? a.titleEs : a.titleEn;
  }

  function articleDesc(a) {
    return lang === "es" ? a.descEs : a.descEn;
  }

  return (
    <div
      className="section-card"
      style={{ marginBottom: 24 }}
    >
      {/* Heading */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.05rem",
            color: "var(--ink)",
            margin: "0 0 4px",
          }}
        >
          📚 {t.art_heading}
        </h3>
        <p style={{ color: "var(--ink-muted)", fontSize: "0.82rem", margin: 0 }}>
          {t.art_sub}
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.875rem",
        }}
      >
        {articles.map((a) => (
          <a
            key={a.slug}
            href={articleUrl(a)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "1rem 1.1rem",
              background: "var(--paper)",
              border: "1px solid var(--paper-warm)",
              borderRadius: "var(--radius)",
              textDecoration: "none",
              color: "inherit",
              transition: "box-shadow 0.18s, border-color 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              e.currentTarget.style.borderColor = "var(--accent-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "";
              e.currentTarget.style.borderColor = "var(--paper-warm)";
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "var(--ink)",
                lineHeight: 1.4,
                margin: "0 0 0.4rem",
              }}
            >
              {articleTitle(a)}
            </p>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--ink-muted)",
                lineHeight: 1.55,
                margin: "0 0 0.6rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {articleDesc(a)}
            </p>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--accent)",
              }}
            >
              {t.art_read}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
