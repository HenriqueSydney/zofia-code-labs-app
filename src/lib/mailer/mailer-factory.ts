import { envVariables } from "@/env";

import type { IMailer } from "./IMailer";
import { NodemailerMailer } from "./nodemailer";
import { ResendMailer } from "./resendmailer";

let mailerInstance: IMailer | null = null;

function createMailer(): IMailer {
  if (envVariables.MAILER_PROVIDER === "resend") {
    return ResendMailer.getInstance();
  }

  return NodemailerMailer.getInstance();
}

const Mailer = {
  getInstance(): IMailer {
    if (!mailerInstance) {
      mailerInstance = createMailer();
    }
    return mailerInstance;
  },
};

export default Mailer;
