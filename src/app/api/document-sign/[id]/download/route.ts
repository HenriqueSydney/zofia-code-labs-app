import { makeDocumentSignService } from "@/services/documenso/makeDocumentSignService";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(id);

  const documentSignService = makeDocumentSignService();
  try {
    const buffer = await documentSignService.getSignedDocument(id);

    if (typeof buffer === "string") {
      throw new Error(
        "O serviço retornou uma string em vez de um buffer binário."
      );
    }

    const body = new Uint8Array(buffer as Buffer);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="documento-assinado.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar documento" },
      { status: 500 }
    );
  }
}
