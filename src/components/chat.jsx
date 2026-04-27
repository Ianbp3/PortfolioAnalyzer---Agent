import React, { useState, useRef, useEffect } from "react";
import { SendOutlined } from "@ant-design/icons";
import { sendMessage } from "../api/chat";

const QUICK_PROMPTS = [
  "¿Cuál es mi mayor riesgo?",
  "¿Dónde debería diversificar?",
  "¿Qué activo tiene mejor rendimiento?",
  "Resume mi portafolio en 3 puntos.",
];

export default function Chat({ analysis, positions, rankings }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!userInput.trim() || loading) return;
    const userMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = userInput;
    setUserInput("");
    setLoading(true);
    try {
      const aiAnswer = await sendMessage(
        currentMessage,
        analysis,
        positions,
        rankings,
        messages,
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiAnswer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Error al conectar. Intenta de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (q) => {
    setUserInput(q);
    textareaRef.current?.focus();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--white)",
        border: "1px solid var(--paper-warm)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow)",
        overflow: "hidden",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--paper-warm)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🤖
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--ink)",
              }}
            >
              Asesor IA
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
              Powered by Groq
            </div>
          </div>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{ padding: "20px 8px" }}>
            <p
              style={{
                color: "var(--ink-muted)",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {analysis
                ? "Tu portafolio está listo. ¿Qué quieres saber?"
                : "Sube tu portafolio para empezar a chatear."}
            </p>

            {analysis && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickPrompt(q)}
                    className="prompt-chip"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "82%",
                padding: "10px 14px",
                borderRadius:
                  m.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                background:
                  m.role === "user" ? "var(--accent)" : "var(--paper)",
                color: m.role === "user" ? "white" : "var(--ink)",
                fontSize: "0.85rem",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                border:
                  m.role === "user" ? "none" : "1px solid var(--paper-warm)",
                boxShadow:
                  m.role === "user" ? "0 2px 8px rgba(26,107,74,0.2)" : "none",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "16px 16px 16px 4px",
                background: "var(--paper)",
                border: "1px solid var(--paper-warm)",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--ink-muted)",
                    animation: `bounce 1.2s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
              <style>{`
                @keyframes bounce {
                  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                  30% { transform: translateY(-5px); opacity: 1; }
                }
              `}</style>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--paper-warm)",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          background: "var(--white)",
          flexShrink: 0,
        }}
      >
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Haz una pregunta sobre tu portafolio..."
          rows={2}
          style={{
            flex: 1,
            resize: "none",
            border: "1.5px solid var(--paper-warm)",
            borderRadius: "var(--radius)",
            padding: "10px 14px",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--ink)",
            background: "var(--paper)",
            outline: "none",
            transition: "border-color 0.2s",
            lineHeight: 1.5,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--paper-warm)")}
        />
        <button
          onClick={handleSend}
          disabled={loading || !userInput.trim()}
          style={{
            background:
              loading || !userInput.trim()
                ? "var(--paper-warm)"
                : "var(--accent)",
            color: loading || !userInput.trim() ? "var(--ink-muted)" : "white",
            border: "none",
            borderRadius: "var(--radius)",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading || !userInput.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
            fontSize: 16,
          }}
        >
          <SendOutlined />
        </button>
      </div>
    </div>
  );
}
