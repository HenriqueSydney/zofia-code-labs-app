import PaymentOverdueEmail from "@/email/templates/PaymentOverdueEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendPaymentOverdueEmail = createTemplateSender(
  PaymentOverdueEmail,
  ({ invoiceId }) => `Pagamento pendente — ${invoiceId}`,
);
