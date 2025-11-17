export async function sendMessage(
  message,
  analysis,
  positions,
  rankings,
  history
) {
  const res = await fetch("http://localhost:4000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      analysis,
      positions,
      rankings,
      history,
    }),
  });

  const data = await res.json();
  return data.response;
}
