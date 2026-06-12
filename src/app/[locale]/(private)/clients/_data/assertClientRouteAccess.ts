import { auth } from "@/auth";
import { ForbiddenError } from "@/errors";
import { canObserverAccessClientSlug } from "@/lib/auth/resolveClientAccess";

export async function assertClientRouteAccess(slug: string) {
  const session = await auth();

  if (!canObserverAccessClientSlug(session?.user, slug)) {
    throw new ForbiddenError("Você não tem acesso a este cliente.", {
      i18nKey: "clientAccessDenied",
    });
  }
}
