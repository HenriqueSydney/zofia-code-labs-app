import UserJoinedNotification from "@/email/templates/UserJoinedNotification";

import { createTemplateSender } from "./createTemplateSender";

export const sendUserJoinedNotification = createTemplateSender(
  UserJoinedNotification,
  ({ newUserName, teamName }) =>
    `Novo membro na equipe ${teamName} — ${newUserName}`,
);
