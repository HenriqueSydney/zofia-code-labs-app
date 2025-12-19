import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { date } from "@/lib/dayjs";
import { getProposalStatusBadge } from "@/mappers/proposalStatusBadge";
import { formatCurrency } from "@/utils/formatCurrency";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  CheckCircle,
  Download,
  Eye,
  FileSignature,
  Plus,
  Send,
  User,
} from "lucide-react";

const mockContract: any = {
  id: "1",
  title: "Contrato de Prestação de Serviços - Sistema de Gestão",
  value: 52000,
  status: "signed",
  createdAt: "2024-01-18T10:00:00",
  createdBy: "Ana Silva",
  reviewedBy: "Departamento Jurídico",
  reviewedAt: "2024-01-19T15:00:00",
  approvedBy: "Roberto Lima",
  approvedAt: "2024-01-20T10:00:00",
  signedAt: "2024-01-22T14:30:00",
  signedBy: "Cliente - João Pereira",
};
export default function ContractTab() {
  return (
    <TabsContent value="contract" className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-lg">{mockContract.title}</h4>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(mockContract.value)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    mockContract.status === "signed" ? "default" : "secondary"
                  }
                >
                  {mockContract.status === "signed" ? "Assinado" : "Pendente"}
                </Badge>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm pt-4 border-t">
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Criado por
                </p>
                <p className="font-medium">{mockContract.createdBy}</p>
                <p className="text-xs text-muted-foreground">
                  {date(mockContract.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
              {mockContract.reviewedBy && (
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Revisado por
                  </p>
                  <p className="font-medium">{mockContract.reviewedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    {date(mockContract.reviewedAt!).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
              )}
              {mockContract.approvedBy && (
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Aprovado por
                  </p>
                  <p className="font-medium">{mockContract.approvedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    {date(mockContract.approvedAt!).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
              )}
              {mockContract.signedAt && (
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <FileSignature className="h-3 w-3" /> Assinado em
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date(mockContract.signedAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
              )}
              {mockContract.signedBy && (
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Assinado por
                  </p>
                  <p className="font-medium">{mockContract.signedBy}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
