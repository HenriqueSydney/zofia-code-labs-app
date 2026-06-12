import NewLoginAlert from "@/email/templates/NewLoginAlert";

import { createTemplateSender } from "./createTemplateSender";

export const sendNewLoginAlert = createTemplateSender(
  NewLoginAlert,
  () => "Novo acesso detectado na sua conta",
);
