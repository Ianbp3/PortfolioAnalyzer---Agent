const { analyzePortfolio } = require("./portfolioAnalyzer");

async function chatWithAdvisor(messages, portfolio) {
  const lastMessage = messages[messages.length - 1].content;

  const insights = analyzePortfolio(portfolio);

  const prompt = `
Eres un asesor financiero experto.
Mensaje del usuario:
${lastMessage}

Datos del portafolio:
${JSON.stringify(insights, null, 2)}

Responde de manera clara y útil, en español.
`;

  return prompt;
}

module.exports = { chatWithAdvisor };
