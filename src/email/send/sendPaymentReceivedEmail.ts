import PaymentReceivedEmail from "@/email/templates/PaymentReceivedEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendPaymentReceivedEmail = createTemplateSender(
  PaymentReceivedEmail,
  ({ amount }) => `Pagamento confirmado — ${amount}`,
);
