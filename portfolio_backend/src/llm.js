const { Ollama } = require("ollama");

const client = new Ollama({
  host: "http://127.0.0.1:11434",
});

async function askLLM(messages) {
  const lastMessage = messages[messages.length - 1].content;

  const response = await client.generate({
    model: "llama3.1",
    prompt: lastMessage,
  });

  return response.response;
}

module.exports = { client, askLLM };
