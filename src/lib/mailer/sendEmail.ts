import { SpanStatusCode, trace } from "@opentelemetry/api";

import Mailer from "@/lib/mailer/mailer-factory";
import type { EmailAttachment, SentMessageInfo } from "@/lib/mailer/IMailer";

type SendEmail = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: SendEmail): Promise<SentMessageInfo> {
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
