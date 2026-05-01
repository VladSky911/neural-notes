// src/services/aiService.ts
const PROXY_URL = "https://neural-notes-pied.vercel.app/api/groq"; // твой URL

// Универсальная функция для вызова прокси
async function callGroq(
  messages: Array<{ role: string; content: string }>,
  model = "llama-3.3-70b-versatile",
): Promise<string> {
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data.choices[0].message.content;
}

export async function summarizeNote(content: string): Promise<string> {
  const result = await callGroq([
    {
      role: "system",
      content: "Summarize the following note in 2-3 sentences.",
    },
    { role: "user", content },
  ]);
  return result.trim();
}

export async function rewriteNote(
  content: string,
  style: "professional" | "casual" | "simple",
): Promise<string> {
  const stylePrompt = {
    professional: "Make it more formal and business-like",
    casual: "Rewrite in a friendly, conversational tone",
    simple: "Simplify the language for easier reading",
  };
  const result = await callGroq([
    { role: "system", content: stylePrompt[style] },
    { role: "user", content },
  ]);
  return result.trim();
}

export async function generateTags(content: string): Promise<string[]> {
  const result = await callGroq([
    {
      role: "system",
      content:
        "Extract 3-5 single-word tags from the note. Return only tags separated by commas, no extra text.",
    },
    { role: "user", content },
  ]);
  return result.split(",").map((tag) => tag.trim().toLowerCase());
}
