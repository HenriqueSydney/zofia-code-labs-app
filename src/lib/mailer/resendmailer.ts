import { envVariables } from "@/env";
import { ConfigurationError } from "@/errors";
import { apiLogger } from "../logger";
import {
  EmailAttachment,
  IMailer,
  SendEmailOptions,
  SentMessageInfo,
} from "./IMailer";

function toResendAttachments(attachments: EmailAttachment[]) {
  return attachments.flatMap((attachment) => {
    if (!("content" in attachment)) {
      return [];
    }

    return [
      {
        filename: attachment.filename,
        content: attachment.content.toString("base64"),
      },
    ];
  });
}

type ResendApiResponse = {
  id?: string;
};

export class ResendMailer implements IMailer {
  private static instance: ResendMailer;
  private readonly apiKey: string;
  private readonly from: string;

  private constructor() {
    if (!envVariables.RESEND_API_KEY) {
      throw new ConfigurationError(
        "RESEND_API_KEY é obrigatória quando MAILER_PROVIDER=resend.",
      );
    }

    this.apiKey = envVariables.RESEND_API_KEY;
    this.from = envVariables.MAILER_FROM;
  }

  public static getInstance(): ResendMailer {
    if (!ResendMailer.instance) {
      ResendMailer.instance = new ResendMailer();
    }
    return ResendMailer.instance;
  }

  public async sendMail({
    to,
    subject,
    html,
    attachments = [],
  }: SendEmailOptions): Promise<SentMessageInfo> {
    const resendAttachments = toResendAttachments(attachments);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: envVariables.MAILER_FROM,
        to,
        subject,
        html,
        ...(resendAttachments.length > 0
          ? { attachments: resendAttachments }
          : {}),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Resend API error (${response.status}): ${errorBody || response.statusText}`,
      );
    }

    const data = (await response.json()) as ResendApiResponse;

    apiLogger.info({ to, subject }, `Message sent via Resend: ${data.id}`);

    return {
      messageId: data.id,
      accepted: [to],
      response: "Resend API",
    };
  }
}
