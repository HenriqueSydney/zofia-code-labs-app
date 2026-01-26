import { GoBackButton } from "@/components/GoBackButton";
import { SectionHeading } from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  FileText,
  Package,
  ArrowLeft,
} from "lucide-react";

// Tipagem baseada nos dados fornecidos
interface ServiceData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  active: boolean;
  category: {
    name: string;
    taxCode: string | null;
  };
}

interface ServiceHeaderDetailsProps {
  service: ServiceData;
}

export function ServiceHeaderDetails({ service }: ServiceHeaderDetailsProps) {
  // Formatador de Moeda
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(service.basePrice);

  return (
    <div className="space-y-4">
      {/* Cabeçalho com Título e Status */}
      <div className="flex items-start gap-4">
        <GoBackButton withLabel={false} className="mt-3" />
        <SectionHeading
          title={service.name}
          subDescription={`ID: ${service.id}`}
          badge={
            service.active ? (
              <Badge
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 gap-1"
              >
                <CheckCircle2 className="h-3 w-3" /> Ativo
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" /> Inativo
              </Badge>
            )
          }
        />
      </div>

      {/* Cards de Informações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preço Base */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Preço Base
              </p>
              <h3 className="text-2xl font-bold">{formattedPrice}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Categoria */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Tag className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Categoria
              </p>
              <h3 className="text-lg font-semibold">{service.category.name}</h3>
              <p className="text-xs text-muted-foreground">
                Cód. Fiscal: {service.category.taxCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tipo/Pacote (Exemplo visual) */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Package className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Serviço
              </p>
              <h3 className="text-lg font-semibold">Produto Digital</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descrição Detalhada */}
      <div className="bg-muted/30 rounded-lg p-6 border">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Sobre o Serviço</h3>
        </div>

        {/* whitespace-pre-wrap é CRUCIAL aqui para respeitar os \n 
          que vêm do seu banco de dados 
        */}
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
          {service.description}
        </div>
      </div>
    </div>
  );
}
