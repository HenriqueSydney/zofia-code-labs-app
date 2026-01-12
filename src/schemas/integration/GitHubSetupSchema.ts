import z from "zod";

export const GitHubSetupSchema = z
  .object({
    isNewRepo: z.boolean().default(true),
    shouldClone: z.boolean().default(false), // Novo switch
    repoName: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .regex(/^[a-z0-9-]+$/),
    repositoryId: z.string().optional(), // Para vincular existente
    templateRepoId: z.string().optional(), // Para clonar de um base
  })
  .refine(
    (data) => {
      if (!data.isNewRepo && !data.repositoryId) return false;
      if (data.isNewRepo && data.shouldClone && !data.templateRepoId)
        return false;
      return true;
    },
    {
      message: "Seleção obrigatória",
      path: ["templateRepoId"],
    }
  );
