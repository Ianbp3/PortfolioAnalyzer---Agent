// Reads VITE_API_URL at build time (Vite replaces import.meta.env.*)
// In development this falls back to localhost:4000
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

export async function analyzePortfolio(positions) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ positions }),
  });
  if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
  return res.json();
}

export async function sendMessage(
  message,
  analysis,
  positions,
  rankings,
  history,
  lang, // ← added: "en" | "es"
) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      analysis,
      positions,
      rankings,
      history,
      language: lang ?? "en",
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Rate limit reached. Please wait.");
    }
    throw new Error(`Chat failed: ${res.status}`);
  }

  const data = await res.json();
  return data.response;
}
