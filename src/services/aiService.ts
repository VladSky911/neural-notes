import { GROQ_API_KEY } from "@env";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: GROQ_API_KEY,
});

export async function summarizeNote(content: string): Promise<string> {
  const { text } = await generateText({
    model: groq("mixtral-8x7b-32768"),
    prompt: `Summarize the following note in 2-3 sentences:\n\n${content}`,
  });
  return text;
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
  const { text } = await generateText({
    model: groq("mixtral-8x7b-32768"),
    prompt: `Rewrite the following note. ${stylePrompt[style]}:\n\n${content}`,
  });
  return text;
}

export async function generateTags(content: string): Promise<string[]> {
  const { text } = await generateText({
    model: groq("mixtral-8x7b-32768"),
    prompt: `Generate 3-5 single-word tags for this note, separated by commas. Only return tags, no extra text:\n\n${content}`,
  });
  return text.split(",").map((tag) => tag.trim().toLowerCase());
}
