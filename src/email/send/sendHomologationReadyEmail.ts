import HomologationReadyEmail from "@/email/templates/HomologationReadyEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendHomologationReadyEmail = createTemplateSender(
  HomologationReadyEmail,
  ({ projectName, featureName }) =>
    `Homologação disponível — ${projectName} (${featureName})`,
);
