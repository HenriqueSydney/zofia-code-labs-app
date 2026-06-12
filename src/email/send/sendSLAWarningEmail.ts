import SLAWarningEmail from "@/email/templates/SLAWarningEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendSLAWarningEmail = createTemplateSender(
  SLAWarningEmail,
  ({ ticketId }) => `Atenção: SLA expirando — ${ticketId}`,
);
