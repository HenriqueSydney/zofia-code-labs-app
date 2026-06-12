// lib/mailer/NodemailerMailer.ts
import { envVariables } from "@/env";

import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import { htmlToText } from "html-to-text";

import { apiLogger } from "../logger";

import {
  EmailAttachment,
  IMailer,
  SendEmailOptions,
  SentMessageInfo,
} from "./IMailer";

function toNodemailerAttachments(attachments: EmailAttachment[]) {
  return attachments.map((attachment) => {
    if ("content" in attachment) {
      return {
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType ?? "application/octet-stream",
      };
    }

    return {
      filename: attachment.filename,
      path: attachment.path,
      cid: attachment.cid,
    };
  });
}

export class NodemailerMailer implements IMailer {
  private static instance: NodemailerMailer;
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  private constructor() {
    let nodeMailerConfig: SMTPTransport.Options;

    if (envVariables.NODE_ENV === "production") {
      nodeMailerConfig = {
        host: envVariables.SMTP_HOST,
        port: 587,
        auth: {
          user: envVariables.SMTP_USER,
          pass: envVariables.SMTP_PASSWORD,
        },
      };
    } else {
      // nodeMailerConfig = {
      //   service: "gmail",
      //   auth: {
      //     type: "OAuth2",
      //     user: envVariables.GOOGLE_EMAIL,
      //     clientId: envVariables.GOOGLE_CLIENT_ID,
      //     clientSecret: envVariables.GOOGLE_CLIENT_SECRET,
      //     refreshToken: envVariables.GOOGLE_REFRESH_TOKEN,
      //   },
      // };

      nodeMailerConfig = {
        service: "gmail",
        auth: {
          user: "henriquesydneylima@gmail.com",
          pass: envVariables.GOOGLE_APP_PASSWORD,
        },
      };
    }

    this.transporter = nodemailer.createTransport(nodeMailerConfig);
  }

  public static getInstance(): NodemailerMailer {
    if (!NodemailerMailer.instance) {
      NodemailerMailer.instance = new NodemailerMailer();
    }
    return NodemailerMailer.instance;
  }

  public async sendMail({
    to,
    subject,
    html,
    attachments = [],
  }: SendEmailOptions): Promise<SentMessageInfo> {
    const plainText = htmlToText(html, {
      wordwrap: 130,
      selectors: [
        { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
      ],
    });

    const fromEmail =
      envVariables.NODE_ENV === "production"
        ? envVariables.SMTP_USER
        : envVariables.GOOGLE_EMAIL;

    const info = await this.transporter.sendMail({
      from: `Henrique Lima <${fromEmail}>`,
      to,
      subject,
      html,
      text: plainText,
      attachments: toNodemailerAttachments(attachments),
    });

    apiLogger.info({ to, subject }, `Message sent: ${info.messageId}`);

    return {
      messageId: info.messageId,
      accepted: info.accepted?.map((entry) =>
        typeof entry === "string" ? entry : entry.address,
      ),
      rejected: info.rejected?.map((entry) =>
        typeof entry === "string" ? entry : entry.address,
      ),
      response: info.response,
    };
  }
}
