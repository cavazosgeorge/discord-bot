import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required."),
  DISCORD_APPLICATION_ID: z
    .string()
    .min(1, "DISCORD_APPLICATION_ID is required."),
  DISCORD_GUILD_ID: z.string().min(1, "DISCORD_GUILD_ID is required."),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");

  for (const issue of parsedEnv.error.issues) {
    console.error(`- ${issue.message}`);
  }

  process.exit(1);
}

export const env = parsedEnv.data;
