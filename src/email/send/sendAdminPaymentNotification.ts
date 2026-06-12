import AdminPaymentNotification from "@/email/templates/AdminPaymentNotification";

import { createTemplateSender } from "./createTemplateSender";

export const sendAdminPaymentNotification = createTemplateSender(
  AdminPaymentNotification,
  ({ clientName, amount }) => `Venda confirmada — ${clientName} (${amount})`,
);
