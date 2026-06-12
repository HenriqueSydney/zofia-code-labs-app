import AddonPurchaseEmail from "@/email/templates/AddonPurchaseEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendAddonPurchaseEmail = createTemplateSender(
  AddonPurchaseEmail,
  ({ addonName }) => `Upgrade confirmado — ${addonName}`,
);
