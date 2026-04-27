import "dotenv/config";

function required(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  FRONTEND_URL: required("FRONTEND_URL", "http://localhost:3000"),
  DATABASE_URL: required("DATABASE_URL"),
  CLERK_SECRET_KEY: required("CLERK_SECRET_KEY"),
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  TRIGGER_SECRET_KEY: required("TRIGGER_SECRET_KEY"),
  TRIGGER_PROJECT_ID: required("TRIGGER_PROJECT_ID", "nextflow"),
  TRANSLOADIT_KEY: required("TRANSLOADIT_KEY"),
  TRANSLOADIT_SECRET: required("TRANSLOADIT_SECRET")
} as const;

export type Env = typeof env;
