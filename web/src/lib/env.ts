import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required for PostgreSQL connection"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET is required and must be at least 16 characters long"),
  BETTER_AUTH_URL: z
    .string()
    .url("BETTER_AUTH_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .default("TeacherAI"),
  AI_SERVICE_URL: z
    .string()
    .url("AI_SERVICE_URL must be a valid URL")
    .default("http://localhost:8000"),
  AI_SERVICE_SECRET: z
    .string()
    .min(1, "AI_SERVICE_SECRET is required for service-to-service communication"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ CRITICAL: Environment Variable Validation Failed!");
    const formatted = parsed.error.format();
    Object.entries(formatted).forEach(([key, value]) => {
      if (key !== "_errors" && value && "_errors" in value && value._errors.length > 0) {
        console.error(`  - ${key}: ${value._errors.join(", ")}`);
      }
    });
    throw new Error(
      "Missing or invalid environment variables. Please check your .env file against .env.example."
    );
  }

  return parsed.data;
}

export const env = validateEnv();
