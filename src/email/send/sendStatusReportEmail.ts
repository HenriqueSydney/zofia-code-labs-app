import StatusReportEmail from "@/email/templates/StatusReportEmailProps";

import { createTemplateSender } from "./createTemplateSender";

export const sendStatusReportEmail = createTemplateSender(
  StatusReportEmail,
  ({ projectName, weekRange }) =>
    `Status report semanal — ${projectName} (${weekRange})`,
);
