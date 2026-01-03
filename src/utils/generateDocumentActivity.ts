import { date } from "@/lib/dayjs";
import { Document } from "@/services/documenso/IDocumentSignService";
import { Circle, Send, Eye, CheckCircle2, FileCheck } from "lucide-react";

export const generateDocumentActivity = (doc: Document) => {
  const activities = [];

  // 1. Criação do Documento
  if (doc.createdAt) {
    activities.push({
      label: "Documento criado",
      date: date(doc.createdAt).fromNow(),
      timestamp: new Date(doc.createdAt).getTime(),
      icon: Circle,
    });
  }

  // 2. Enviado para Assinatura (Usamos a data de criação como base de envio)
  if (doc.createdAt) {
    activities.push({
      label: "Enviado para assinatura",
      date: date(doc.createdAt).fromNow(),
      timestamp: new Date(doc.createdAt).getTime() + 1, // +1ms para garantir ordem após criação
      icon: Send,
    });
  }

  // 3. Mapear Recipientes (Visualizações e Assinaturas)
  doc.recipients.forEach((recipient) => {
    // Se foi aberto, registramos (Como não há timestamp de abertura no JSON,
    // estimamos próximo à assinatura ou usamos uma lógica visual)
    if (recipient.readStatus === "OPENED") {
      activities.push({
        label: `Visualizado por ${recipient.name}`,
        date: recipient.signedAt
          ? date(recipient.signedAt).fromNow()
          : "Recentemente",
        timestamp: recipient.signedAt
          ? new Date(recipient.signedAt).getTime() - 1000
          : Date.now(),
        icon: Eye,
      });
    }

    // Se foi assinado
    if (recipient.signingStatus === "SIGNED" && recipient.signedAt) {
      activities.push({
        label: `Assinado por ${recipient.name}`,
        date: date(recipient.signedAt).fromNow(),
        timestamp: new Date(recipient.signedAt).getTime(),
        icon: CheckCircle2,
      });
    }
  });

  // 4. Documento Completado
  if (doc.status === "COMPLETED" && doc.completedAt) {
    activities.push({
      label: "Documento finalizado",
      date: date(doc.completedAt).fromNow(),
      timestamp: new Date(doc.completedAt).getTime(),
      icon: FileCheck,
    });
  }

  // Ordenar do mais antigo para o mais novo
  return activities.sort((a, b) => b.timestamp - a.timestamp);
};
