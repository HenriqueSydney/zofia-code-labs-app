import { createElement, type ComponentType } from "react";

import type { EmailAttachment } from "@/lib/mailer/IMailer";

import { renderEmailTemplate } from "./renderEmailTemplate";
import { envVariables } from "@/env";

export type SendEmailBaseParams = {
  to: string;
  emailSubject?: string;
  attachments?: EmailAttachment[];
};

export function createTemplateSender<P extends Record<string, unknown>>(
  Template: ComponentType<P>,
  resolveSubject: (props: P) => string,
) {
  return async (params: P & SendEmailBaseParams) => {
    const { to, emailSubject, attachments, ...templateProps } = params;
    console.log("Email sent:", { emailSubject, to });

    return renderEmailTemplate({
      to:
        envVariables.NODE_ENV === "development"
          ? "henriquesydneylima@gmail.com"
          : to,
      subject: emailSubject ?? resolveSubject(templateProps as unknown as P),
      attachments,
      template: createElement(Template, templateProps as unknown as P),
    });
  };
}
