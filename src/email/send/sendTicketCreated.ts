import TicketCreated from "@/email/templates/TicketCreated";

import { createTemplateSender } from "./createTemplateSender";

export const sendTicketCreated = createTemplateSender(
  TicketCreated,
  ({ ticketId, subject }) => `Chamado recebido — ${ticketId}: ${subject}`,
);
