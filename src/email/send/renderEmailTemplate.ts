import { render } from "@react-email/render";
import type { ReactElement } from "react";

import { sendEmail } from "@/lib/mailer/sendEmail";
import type { EmailAttachment, SentMessageInfo } from "@/lib/mailer/IMailer";

type RenderEmailTemplateParams = {
  template: ReactElement;
  to: string;
  subject: string;
  attachments?: EmailAttachment[];
};

export async function renderEmailTemplate({
  template,
  to,
  subject,
  attachments,
}: RenderEmailTemplateParams): Promise<SentMessageInfo> {
  const html = await render(template);

  return sendEmail({
    to,
    subject,
    html,
    attachments,
  });
}
