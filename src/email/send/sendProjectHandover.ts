import ProjectHandover from "@/email/templates/ProjectHandover";

import { createTemplateSender } from "./createTemplateSender";

export const sendProjectHandover = createTemplateSender(
  ProjectHandover,
  ({ projectName }) => `Projeto entregue — ${projectName}`,
);
