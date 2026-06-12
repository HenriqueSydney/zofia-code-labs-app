import BlockerReport from "@/email/templates/BlockerReport";

import { createTemplateSender } from "./createTemplateSender";

export const sendBlockerReport = createTemplateSender(
  BlockerReport,
  ({ projectName }) => `Projeto bloqueado — ${projectName}`,
);
