import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BASE_URL: z.string(),
  AUTH_SECRET: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  R2_BUCKET_NAME: z.string(),
  JWT_TOKEN_SECRET: z.string(),
  R2_PUBLIC_URL: z.string(),
  DOCUMENSO_API_KEY: z.string(),
  DOCUMENSO_API_URL: z.string(),
  SMTP_HOST: z.string().default("smtp.zofiacodelabs.com"),
  SMTP_USER: z.string().default("teste_admin@zofiacodelabs.com"),
  SMTP_PASSWORD: z.string().default("sei_muito_bem"),
  GOOGLE_APP_PASSWORD: z.string().default("sei_muito_bem"),
  GOOGLE_EMAIL: z.email().default("teste_admin@zofiacodelabs.com"),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.message);
  throw new Error("Invalid environment variables");
}

export const envVariables = env.data;
