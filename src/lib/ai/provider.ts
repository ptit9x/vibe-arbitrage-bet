// AI provider abstraction - supports GLM (z.ai) and Minimax
// Auto-detects which API key is available

type AIProvider = "glm" | "minimax" | "none";

function detectProvider(): AIProvider {
  if (process.env.GLM_API_KEY || process.env.ZAI_API_KEY) return "glm";
  if (process.env.MINIMAX_API_KEY) return "minimax";
  return "none";
}

export function getAIProvider(): { provider: AIProvider; available: boolean } {
  const provider = detectProvider();
  return { provider, available: provider !== "none" };
}

export async function fetchAiInsights(prompt: string): Promise<string> {
  const { provider } = getAIProvider();

  switch (provider) {
    case "glm":
      return fetchGLMInsights(prompt);
    case "minimax":
      return fetchMinimaxInsights(prompt);
    default:
      throw new Error("No AI API key configured");
  }
}

const SYSTEM_PROMPT =
  "You are a sports betting analyst. Respond in Vietnamese. Be concise and actionable.";

// GLM (z.ai) - OpenAI-compatible API
async function fetchGLMInsights(prompt: string): Promise<string> {
  const apiKey = process.env.GLM_API_KEY || process.env.ZAI_API_KEY;
  const baseUrl = process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GLM_MODEL || "glm-4-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GLM API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Minimax - OpenAI-compatible API
async function fetchMinimaxInsights(prompt: string): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  const baseUrl = process.env.MINIMAX_BASE_URL || "https://api.minimax.chat/v1";

  const response = await fetch(`${baseUrl}/text/chatcompletion_v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.MINIMAX_MODEL || "MiniMax-Text-01",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Minimax API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
