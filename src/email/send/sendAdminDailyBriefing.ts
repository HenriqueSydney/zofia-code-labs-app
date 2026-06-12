import AdminDailyBriefing from "@/email/templates/AdminDailyBriefing";

import { createTemplateSender } from "./createTemplateSender";

export const sendAdminDailyBriefing = createTemplateSender(
  AdminDailyBriefing,
  ({ date }) => `Briefing diário — ${date}`,
);
