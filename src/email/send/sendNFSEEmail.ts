import NFSEEmail from "@/email/templates/NFSEEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendNFSEEmail = createTemplateSender(
  NFSEEmail,
  ({ nfsNumber }) => `Nota fiscal emitida — ${nfsNumber}`,
);
