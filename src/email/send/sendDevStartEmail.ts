import DevStartEmail from "@/email/templates/DevStartEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendDevStartEmail = createTemplateSender(
  DevStartEmail,
  ({ projectName }) => `Desenvolvimento iniciado — ${projectName}`,
);
