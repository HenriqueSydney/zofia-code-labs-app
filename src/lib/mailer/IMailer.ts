export type EmailAttachment =
  | {
      filename: string;
      path: string;
      cid: string;
    }
  | {
      filename: string;
      content: Buffer;
      contentType?: string;
    };

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export interface SentMessageInfo {
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
}

export interface IMailer {
  sendMail(options: SendEmailOptions): Promise<SentMessageInfo>;
}
