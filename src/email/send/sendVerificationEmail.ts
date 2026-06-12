import VerificationEmail from "@/email/templates/VerificationEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendVerificationEmail = createTemplateSender(
  VerificationEmail,
  () => "Verifique seu login",
);
