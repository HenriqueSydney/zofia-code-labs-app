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

export function ContractSigningDetails() {
  const activity = [
    { label: "Documento criado", date: "há 37 min", icon: Circle },
    { label: "Enviado para assinatura", date: "há 37 min", icon: Send },
    { label: "Visualizado pelo cliente", date: "há 15 min", icon: Eye },
    {
      label: "Assinado por Gelateria Filo Di Latte",
      date: "há 13 min",
      icon: CheckCircle2,
    },
  ];

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
          <div className="p-4 border rounded-md col-span-3">DOCUMENTO</div>
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
              <div className="px-4 py-3 flex items-center justify-between border-b ">
                <span className="text-muted-foreground">Criado por</span>
                <strong>Zofia Code Labs</strong>
              </div>

              <div className="px-4 py-3 flex items-center justify-between border-b">
                <span className="text-muted-foreground">Criado em</span>
                <strong>28/04/2025</strong>
              </div>

              <div className="px-4 py-3 flex items-center justify-between border-b ">
                <span className="text-muted-foreground">
                  Última modificação em
                </span>
                <strong>há 2 dias atrás</strong>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-muted-foreground">
                  Identificador do Documento
                </span>
                <strong>19</strong>
              </div>
            </div>
            {/* Assinantes */}
            <div className="border rounded-md">
              <div className="p-4 pb-4 border-b">
                <h5 className="text-lg font-medium">Interessados</h5>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-b ">
                <div className="flex items-center gap-2">
                  <UserAvatar size="tiny" />
                  <div className="flex flex-col">
                    <strong className="text-muted-foreground">
                      henriquesydney@hotmail.com
                    </strong>
                    <span className="text-muted-foreground text-sm">
                      Assinante
                    </span>
                  </div>
                </div>
                <Badge className="gap-2">
                  <Signature className="w-4 h-4" /> Assinado
                </Badge>
              </div>
              <div className="px-4 py-3 flex items-center justify-between ">
                <div className="flex items-center gap-2">
                  <UserAvatar size="tiny" />
                  <div className="flex flex-col">
                    <strong className="text-muted-foreground">
                      henriquesydney@hotmail.com
                    </strong>
                    <span className="text-muted-foreground text-sm">
                      Assinante
                    </span>
                  </div>
                </div>
                <Badge className="gap-2">
                  <Signature className="w-4 h-4" /> Assinado
                </Badge>
              </div>
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
