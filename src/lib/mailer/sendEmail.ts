import { SpanStatusCode, trace } from "@opentelemetry/api";

import Mailer from "@/lib/mailer/mailer-factory";

type SendEmail = {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string; cid: string }[];
};

export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: SendEmail) {
  const tracer = trace.getTracer("mailer");

  return tracer.startActiveSpan("send-email", async (span) => {
    span.setAttribute("email.to", to);
    span.setAttribute("email.subject", subject);
    const start = performance.now();

    try {
      const mailer = Mailer.getInstance();
      const response = await mailer.sendMail({
        to,
        subject,
        html,
        attachments: [...attachments],
      });

      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttribute("email.messageId", JSON.stringify(response.messageId));

      return response;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    } finally {
      span.setAttribute("execution.ms", performance.now() - start);
      span.end();
    }
  });
}
