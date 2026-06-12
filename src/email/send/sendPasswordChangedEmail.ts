import PasswordChangedEmail from "@/email/templates/PasswordChangedEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendPasswordChangedEmail = createTemplateSender(
  PasswordChangedEmail,
  () => "Senha alterada com sucesso",
);
