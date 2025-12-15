import z from "zod";

export const errorLoggerSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),

  stack: z.string().max(5000, "Stack trace too long").optional(),

  digest: z
    .string()
    .regex(/^[a-zA-Z0-9-_]+$/, "Invalid digest format")
    .optional(),

  url: z.string().url("Invalid URL format").max(2000, "URL too long"),

  userAgent: z
    .string()
    .min(1, "User agent cannot be empty")
    .max(500, "User agent too long"),

  timestamp: z
    .string()
    .datetime("Invalid ISO timestamp")
    .refine((timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      return now.getTime() - date.getTime() <= maxAge;
    }, "Timestamp too old (max 24h)"),
  context: z.string().optional(),
  userId: z
    .string()
    .regex(/^[a-zA-Z0-9-_]+$/, "Invalid user ID format")
    .max(100, "User ID too long")
    .optional(),

  sessionId: z
    .string()
    .regex(/^[a-zA-Z0-9-_]+$/, "Invalid session ID format")
    .max(100, "Session ID too long")
    .optional(),

  metadata: z.any().optional(),
});

export type ErrorLogData = z.infer<typeof errorLoggerSchema>;
