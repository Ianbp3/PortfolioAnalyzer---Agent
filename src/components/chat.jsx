import React, { useState } from "react";
import { Input, Button, Card, Typography } from "antd";
import { sendMessage } from "../api/chat";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

export default function Chat({ analysis, positions, rankings }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      role: "user",
      content: userInput,
    };

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
        messages
      );

      const assistantMessage = {
        role: "assistant",
        content: aiAnswer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        marginTop: 16,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title level={4}>Asesor IA</Title>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: 4,
          padding: 8,
          marginBottom: 8,
          minHeight: 200,
          maxHeight: "70vh",
        }}
      >
        {messages.length === 0 && (
          <Paragraph type="secondary">
            Escribe una pregunta sobre tu portafolio para comenzar.
          </Paragraph>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 6,
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <Paragraph
              style={{
                whiteSpace: "pre-wrap",
                display: "inline-block",
                padding: 8,
                borderRadius: 8,
                backgroundColor:
                  m.role === "user" ? "rgba(24,144,255,0.15)" : "#fafafa",
                maxWidth: "80%",
              }}
            >
              {m.content}
            </Paragraph>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <TextArea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={2}
          placeholder="Haz una pregunta sobre tu portafolio..."
        />
        <Button
          type="primary"
          onClick={handleSend}
          loading={loading}
          style={{ alignSelf: "flex-end" }}
        >
          Enviar
        </Button>
      </div>
    </Card>
  );
}
