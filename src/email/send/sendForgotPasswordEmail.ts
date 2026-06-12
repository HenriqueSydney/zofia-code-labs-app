import ForgotPasswordEmail from "@/email/templates/ForgotPasswordEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendForgotPasswordEmail = createTemplateSender(
  ForgotPasswordEmail,
  () => "Redefinição de senha",
);
