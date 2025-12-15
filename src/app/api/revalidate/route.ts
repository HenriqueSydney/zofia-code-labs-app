import { handleErrors } from "@/errors/handleErrors";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tags = [], paths = [] }: { tags: string[]; paths: string[] } = body;

    if (!Array.isArray(tags) || !Array.isArray(paths)) {
      return NextResponse.json(
        { error: "tags e paths devem ser arrays." },
        { status: 400 }
      );
    }

    if (tags && tags.length > 0) {
      // Revalida todas as tags enviadas
      const tagsToRevalidate = tags
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim());
      tagsToRevalidate.forEach((tag) => revalidateTag(tag, "max"));
    }

    // Revalida todos os paths enviados
    for (const path of paths) {
      if (typeof path === "string" && path.trim()) {
        revalidatePath(path);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: { tags, paths },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleErrors(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
