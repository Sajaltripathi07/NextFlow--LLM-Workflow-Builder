import { task } from "@trigger.dev/sdk";
import { GoogleGenAI } from "@google/genai";

import type { LlmTaskPayload, LlmTaskResult } from "./task-types.js";

const MODEL_MAP: Record<string, string> = {
  "gemini-2.5-flash": "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-pro": "gemini-2.5-pro-preview-03-25",
  "gemini-2.0-flash": "gemini-2.0-flash",
  "gemini-1.5-pro": "gemini-1.5-pro-latest",
  "gemini-1.5-flash": "gemini-1.5-flash-latest"
};

const FALLBACK_CHAIN = [
  "gemini-2.5-flash-preview-04-17",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash"
];

function resolveModel(model: string): string {
  return MODEL_MAP[model] ?? model;
}

function isRateLimit(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("quota") ||
    msg.includes("rate limit")
  );
}

function isModelNotFound(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("not found") ||
    msg.includes("not supported") ||
    msg.includes("404")
  );
}

async function generateWithFallback(
  client: GoogleGenAI,
  models: string[],
  contents: Record<string, unknown>[]
): Promise<string> {
  const errors: string[] = [];

  for (const model of models) {
    try {
      const result = await client.models.generateContent({
        model,
        contents: contents as Parameters<typeof client.models.generateContent>[0]["contents"]
      });
      console.log(`Gemini success with model: ${model}`);
      return result.text ?? "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${model}: ${msg.slice(0, 80)}`);

      if (isRateLimit(err) || isModelNotFound(err)) {
        console.warn(`Gemini model ${model} failed, trying next...`);
        if (isRateLimit(err)) {
          await new Promise((r) => setTimeout(r, 2000));
        }
        continue;
      }

      throw err;
    }
  }

  throw new Error(`All Gemini models exhausted.\n${errors.join("\n")}`);
}

export async function runLlm(payload: LlmTaskPayload): Promise<LlmTaskResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const demoText = [
      `[Demo Mode] Model: ${payload.model}`,
      payload.systemPrompt ? `System: ${payload.systemPrompt.slice(0, 100)}` : null,
      `User: ${payload.userMessage.slice(0, 150)}`,
      payload.images.length > 0 ? `Images attached: ${payload.images.length}` : null
    ]
      .filter(Boolean)
      .join("\n\n");
    return { nodeId: payload.nodeId, text: demoText };
  }

  const client = new GoogleGenAI({ apiKey });
  const resolvedModel = resolveModel(payload.model);
  const textPrompt = [payload.systemPrompt, payload.userMessage].filter(Boolean).join("\n\n");

  const parts: Record<string, unknown>[] = [{ text: textPrompt }];
  for (const uri of payload.images) {
    if (uri.startsWith("http")) {
      parts.push({ fileData: { fileUri: uri } });
    }
  }

  const contents = [{ role: "user", parts }];

  const modelsToTry = [
    resolvedModel,
    ...FALLBACK_CHAIN.filter((m) => m !== resolvedModel)
  ];

  const text = await generateWithFallback(client, modelsToTry, contents);
  return { nodeId: payload.nodeId, text };
}

export const llmTask = task({
  id: "nextflow-llm-execution",
  retry: { maxAttempts: 3, minTimeoutInMs: 1000, maxTimeoutInMs: 15000, factor: 2 },
  run: runLlm
});