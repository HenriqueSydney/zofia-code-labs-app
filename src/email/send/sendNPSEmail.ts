import NPSEmail from "@/email/templates/NPSEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendNPSEmail = createTemplateSender(
  NPSEmail,
  ({ clientName }) => `Como foi sua experiência, ${clientName}?`,
);
