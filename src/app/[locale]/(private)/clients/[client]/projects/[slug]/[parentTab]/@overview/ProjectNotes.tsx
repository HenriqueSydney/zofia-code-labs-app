import { fetchProjectNotes } from "@/actions/projectNotes/fetchProjectNotes";
import { UserAvatar } from "@/components/UserAvatar";
import { AppError } from "@/errors/AppError";
import { date } from "@/lib/dayjs";
import { operationWrapper } from "@/lib/operationWrapper";
import { ProjectNotesWithDetails } from "@/repositories/IProjectNotesRepository";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { getLocale, getTranslations } from "next-intl/server";
import { ProjectNotesActions } from "./ProjectNotesActions";
import { auth } from "@/auth";
import { EmptyState } from "@/components/EmptyState";
import { Text } from "lucide-react";

interface IProjectNotes {
  project: ProjectWithDetails;
  query: string;
}

export async function ProjectNotes({ project, query }: IProjectNotes) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("project.notes");
  const [fetchProjectNotesError, fetchProjectNotesSuccess] =
    await operationWrapper<{
      totalOfRegisters: number;
      projectNotes: ProjectNotesWithDetails[];
    }>(
      "action",
      "fetchProjectNotes",
      () => {
        return fetchProjectNotes(project.id, query, {
          page: 1,
          numberPerPage: 10,
        });
      },
      {
        cache: "no-cache",
      }
    );

  if (fetchProjectNotesError) {
    throw new AppError("Erro ao tentar localizar os projetos da Organização");
  }

  const notes = fetchProjectNotesSuccess.projectNotes;
  const dateLocale = locale === "pt" ? "pt-BR" : "en";
  return (
    <div className="space-y-3 max-h-125 overflow-y-auto">
      {notes.length === 0 && (
        <EmptyState
          title="Nenhuma observação incluída"
          description="Até o momento, este projeto não possui observações."
          icon={Text}
        />
      )}
      {notes.map((note) => (
        <div key={note.id} className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                userName={note.user.name}
                image={note.user.image}
                size="small"
              />

              <p className="font-medium">{note.user.name}</p>
              {date(note.createdAt).isSame(note.updatedAt, "second") && (
                <p className="text-sm text-muted-foreground">
                  {t("posted", {
                    timeAgo: date(note.createdAt).locale(dateLocale).fromNow(),
                  })}
                </p>
              )}
              {date(note.createdAt).isBefore(note.updatedAt, "second") && (
                <p className="text-sm text-muted-foreground">
                  {t("edited", {
                    timeAgo: date(note.updatedAt).locale(dateLocale).fromNow(),
                  })}
                </p>
              )}
            </div>
            <ProjectNotesActions note={note} userId={session?.user.id} />
          </div>
          <hr className="my-4" />
          <p className="text-sm whitespace-pre-line">{note.content}</p>
        </div>
      ))}
    </div>
  );
}
