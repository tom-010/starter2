import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }

  return {
    db: {
      url: result.data.DATABASE_URL,
    },
    auth: {
      secret: result.data.BETTER_AUTH_SECRET,
      url: result.data.BETTER_AUTH_URL,
    },
    env: result.data.NODE_ENV,
    isDev: result.data.NODE_ENV === "development",
    isProd: result.data.NODE_ENV === "production",
  } as const;
}

export const config = loadConfig();
