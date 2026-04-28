import React, { useState, useRef, useEffect } from "react";
import { SendOutlined } from "@ant-design/icons";
import { sendMessage } from "../api/chat";
import { useLang } from "../hooks/useLang";

export default function Chat({ analysis, positions, rankings }) {
  const { lang, t } = useLang();

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Clear chat when language switches so prompts don't mix
  useEffect(() => {
    setMessages([]);
  }, [lang]);

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
        lang, // ← new: tells the backend which language to respond in
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiAnswer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: err.message || t.chat_error },
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
              {t.chat_header}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
              {t.chat_powered}
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
              {analysis ? t.chat_ready : t.chat_upload_first}
            </p>

            {analysis && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {t.quick_prompts.map((q) => (
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
                boxShadow: m.role === "user" ? "none" : "var(--shadow)",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "16px 16px 16px 4px",
                background: "var(--paper)",
                border: "1px solid var(--paper-warm)",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--ink-muted)",
                    display: "inline-block",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
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
          flexShrink: 0,
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.chat_placeholder}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            border: "1.5px solid var(--paper-warm)",
            borderRadius: 12,
            padding: "10px 14px",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--ink)",
            background: "var(--paper)",
            outline: "none",
            lineHeight: 1.5,
            maxHeight: 120,
            overflowY: "auto",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--paper-warm)")}
        />
        <button
          onClick={handleSend}
          disabled={!userInput.trim() || loading}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background:
              userInput.trim() && !loading
                ? "var(--accent)"
                : "var(--paper-warm)",
            border: "none",
            cursor: userInput.trim() && !loading ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: userInput.trim() && !loading ? "white" : "var(--ink-muted)",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          <SendOutlined style={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  );
}
