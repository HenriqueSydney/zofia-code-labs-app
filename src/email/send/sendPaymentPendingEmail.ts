import PaymentPendingEmail from "@/email/templates/PaymentPendingEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendPaymentPendingEmail = createTemplateSender(
  PaymentPendingEmail,
  ({ invoiceId }) => `Nova fatura disponível — ${invoiceId}`,
);
