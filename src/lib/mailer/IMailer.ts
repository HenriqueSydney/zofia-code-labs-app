import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    path: string;
    cid: string;
  }[];
}

export interface IMailer {
  sendMail(options: SendEmailOptions): Promise<SMTPTransport.SentMessageInfo>;
}
