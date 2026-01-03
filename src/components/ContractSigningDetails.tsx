"use client";

import {
  CheckCircle2,
  Circle,
  Download,
  Eye,
  Send,
  Signature,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { UserAvatar } from "./UserAvatar";
import { toast } from "sonner";
import { httpClient } from "@/lib/httpClient";
import {
  Document,
  ReadStatus,
  RecipientRole,
  SigningStatus,
} from "@/services/documenso/IDocumentSignService";
import { date } from "@/lib/dayjs";
import PDFViewer from "./PDFViewer";
import { cn } from "@/lib/utils";
import { generateDocumentActivity } from "@/utils/generateDocumentActivity";

interface IContractSigningDetails {
  signingDocument: Document;
}

export function ContractSigningDetails({
  signingDocument,
}: IContractSigningDetails) {
  const activity = generateDocumentActivity(signingDocument);

  const basicInformation = [
    {
      label: "Criado por",
      value: "Zofia Code Labs",
    },
    {
      label: "Criado em",
      value: date(signingDocument.createdAt).format("DD/MM/YYYY HH:mm"),
    },
    {
      label: "Última modificação em",
      value: date(signingDocument.createdAt).fromNow(),
    },
    {
      label: "Identificador do documento",
      value: signingDocument.id,
    },
  ];

  const recipients = signingDocument.recipients.map((recipient) => ({
    email: recipient.email,
    name: recipient.name,
    baseRole: recipient.role,
    role: getDocumentRoleMapper(recipient.role),
    signingStatus: getSigningStatusMapper(recipient.signingStatus),
    readingStatus: getReadingStatusMapper(recipient.readStatus),
  }));

  function getDocumentRoleMapper(role: RecipientRole) {
    const roles: Record<RecipientRole, string> = {
      APPROVER: "Aprovador",
      SIGNER: "Assinador",
      CC: "Cópia",
      VIEWER: "Visualizador",
    };

    return roles[role] || "Visualizador";
  }

  function getSigningStatusMapper(signingStatus: SigningStatus) {
    const signingStatuses: Record<SigningStatus, string> = {
      NOT_SIGNED: "Pendente",
      SIGNED: "Assinado",
    };

    return signingStatuses[signingStatus] || "Pendente";
  }

  function getReadingStatusMapper(readStatus: ReadStatus) {
    const readStatuses: Record<ReadStatus, string> = {
      NOT_OPENED: "Não visualizado",
      OPENED: "Visualizado",
    };

    return readStatuses[readStatus] || "Pendente";
  }

  async function handleDownloadDocument() {
    // 1. Chame a sua rota de API ou Server Action que executa o getSignedDocument
    const [error, success] = await httpClient<Blob>(
      `/api/document-sign/19/download`,
      { method: "GET" },
      "blob"
    );

    if (error) throw new Error("Falha ao baixar arquivo");

    // 2. Converta a resposta para Blob (formato que o navegador entende como arquivo)
    const blob = success;

    // 3. Crie uma URL temporária para o Blob
    const url = window.URL.createObjectURL(blob);

    // 4. Crie um elemento "a" invisível para disparar o download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `contrato-${19}.pdf`);

    // 5. Adicione ao corpo, clique e remova
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);

    // 6. Limpe a URL da memória
    window.URL.revokeObjectURL(url);

    toast.success("Download iniciado!");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signature className="h-5 w-5 text-muted-foreground" />
          Informações de Assinatura do Contrato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="p-4 border rounded-md col-span-3">
            <PDFViewer base64Data={signingDocument.documentData.data} />
          </div>
          <div className="space-y-6 col-span-2">
            <div className="p-4 border rounded-md space-y-4">
              <div className="space-y-4">
                <h4 className="text-xl font-medium mb-0">
                  Documento assinado por todos
                </h4>
                <span className="text-muted-foreground text-sm">
                  Este documento foi assinado por todos os assinantes
                </span>
              </div>
              <Separator />
              <Button
                className="w-full"
                size={"lg"}
                onClick={() => handleDownloadDocument()}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>

            {/* Informações */}
            <div className="border rounded-md">
              <div className="p-4 pb-4 border-b">
                <h5 className="text-lg font-medium">Informações</h5>
              </div>
              {basicInformation.map((info, index) => (
                <div
                  key={`information-${index}`}
                  className={cn(
                    "px-4 py-3 flex items-center justify-between",
                    basicInformation.length > index + 1 && "border-b"
                  )}
                >
                  <span className="text-muted-foreground">{info.label}</span>
                  <strong>{info.value}</strong>
                </div>
              ))}
            </div>
            {/* Assinantes */}
            <div className="border rounded-md">
              <div className="p-4 pb-4 border-b">
                <h5 className="text-lg font-medium">Interessados</h5>
              </div>
              {recipients.map((recipient, index) => {
                return (
                  <div
                    key={`recipients-${index}`}
                    className="px-4 py-3 flex items-center justify-between border-b "
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar size="small" />
                      <div className="flex flex-col">
                        <strong className="text-muted-foreground">
                          {recipient.name}
                        </strong>
                        <span className="text-muted-foreground">
                          {recipient.email}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {recipient.role}
                        </span>
                      </div>
                    </div>

                    {recipient.baseRole === "SIGNER" && (
                      <Badge className="gap-2">
                        <Signature className="w-4 h-4" />{" "}
                        {recipient.signingStatus}
                      </Badge>
                    )}
                    {recipient.baseRole !== "SIGNER" && (
                      <Badge className="gap-2">
                        <Eye className="w-4 h-4" /> {recipient.readingStatus}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Atividades */}
            <div className="border rounded-md">
              <div className="p-4 pb-4 border-b">
                <h5 className="text-lg font-medium">Últimas Atividades</h5>
              </div>
              <div className="px-4 border-l-2 border-muted ml-6 space-y-2 py-4">
                {activity.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[25px] py-2">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
