import { fetchDocumentTemplatesAction } from "@/actions/templates/fetchDocumentTemplates";
import { QueryFilter } from "@/components/QueryFilter";
import { SectionHeading } from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppError } from "@/errors/AppError";
import { Link } from "@/i18n/navigation";
import { date } from "@/lib/dayjs";
import { operationWrapper } from "@/lib/operationWrapper";
import { getParams } from "@/utils/getParams";
import { Copy, Edit, Eye, FileText, Plus, Trash2 } from "lucide-react";

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}

export default async function TemplateDocuments({ searchParams }: IParams) {
  const { query } = await getParams(searchParams, ["query"]);

  const [fetchDocumentTemplatesError, fetchDocumentTemplatesSuccess] =
    await operationWrapper(
      "action",
      "fetchServiceTypeAction",
      () => {
        return fetchDocumentTemplatesAction(query);
      },
      {
        cache: "no-cache",
      }
    );

  if (fetchDocumentTemplatesError) {
    throw new AppError(
      "Erro ao tentar localizar os templates de documentos. Tente novamente mais tarde"
    );
  }

  const getTypeBadge = (type: string) => {
    const config: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      contract: { label: "Contrato", variant: "default" },
      proposal: { label: "Proposta", variant: "secondary" },
      invoice: { label: "Fatura", variant: "outline" },
      other: { label: "Outro", variant: "outline" },
    };
    return <Badge variant={config[type].variant}>{config[type].label}</Badge>;
  };

  const templates = fetchDocumentTemplatesSuccess.documentTemplates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Modelos de Documentos"
          description="Gerencie templates de contratos e propostas"
        />
        <Link href="/settings/templates/new-template">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </Link>
      </div>

      <QueryFilter placeholder="Buscar templates..." />
      {/* <div className="flex gap-2">
          {['all', 'contract', 'proposal'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'Todos' : type === 'contract' ? 'Contratos' : 'Propostas'}
            </Button>
          ))}
        </div> */}

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {template.title}
                      </h3>
                      {getTypeBadge(template.type)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span>
                        Atualizado:{" "}
                        {date(template.updatedAt ?? template.createdAt).format(
                          "DD/MM/YYYY"
                        )}
                      </span>
                      {/* <span>•</span>
                      <span>Usado {template.usageCount} vezes</span> */}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" title="Visualizar">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Duplicar">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Excluir">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          Nenhum template encontrado
        </div>
      )}
    </div>
  );
}
