import WelcomeClientEmail from "@/email/templates/WelcomeClientEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendWelcomeClientEmail = createTemplateSender(
  WelcomeClientEmail,
  ({ clientName }) => `Bem-vindo à Zofia Code Labs — ${clientName}`,
);
