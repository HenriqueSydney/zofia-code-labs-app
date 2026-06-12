import { describe, expect, it } from "vitest";
import { CheckCircle2, Circle, Eye, FileCheck, Send } from "lucide-react";
import { generateDocumentActivity } from "./generateDocumentActivity";
import type { Document } from "../services/documenso/IDocumentSignService";

function buildDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: 1,
    title: "Contrato",
    status: "PENDING",
    createdAt: "2024-06-01T10:00:00.000Z",
    completedAt: null,
    recipients: [],
    ...overrides,
  } as Document;
}

describe("generateDocumentActivity", () => {
  it("deve incluir criação e envio quando documento tem createdAt", () => {
    const activities = generateDocumentActivity(buildDoc());

    expect(activities.some((a) => a.label === "Documento criado")).toBe(true);
    expect(activities.some((a) => a.label === "Enviado para assinatura")).toBe(
      true,
    );
    expect(activities.find((a) => a.label === "Documento criado")?.icon).toBe(
      Circle,
    );
    expect(
      activities.find((a) => a.label === "Enviado para assinatura")?.icon,
    ).toBe(Send);
  });

  it("deve retornar lista vazia quando documento não tem createdAt", () => {
    const activities = generateDocumentActivity(
      buildDoc({ createdAt: undefined as unknown as string }),
    );

    expect(activities).toEqual([]);
  });

  it("deve registrar visualização e assinatura de destinatários", () => {
    const activities = generateDocumentActivity(
      buildDoc({
        recipients: [
          {
            id: 1,
            name: "Maria",
            email: "maria@test.com",
            readStatus: "OPENED",
            signingStatus: "SIGNED",
            signedAt: "2024-06-02T12:00:00.000Z",
          },
        ],
      } as Partial<Document>),
    );

    expect(
      activities.some((a) => a.label === "Visualizado por Maria"),
    ).toBe(true);
    expect(activities.some((a) => a.label === "Assinado por Maria")).toBe(true);
    expect(
      activities.find((a) => a.label === "Assinado por Maria")?.icon,
    ).toBe(CheckCircle2);
    expect(
      activities.find((a) => a.label === "Visualizado por Maria")?.icon,
    ).toBe(Eye);
  });

  it("deve registrar visualização sem signedAt como Recentemente", () => {
    const activities = generateDocumentActivity(
      buildDoc({
        recipients: [
          {
            id: 1,
            name: "Pedro",
            email: "pedro@test.com",
            readStatus: "OPENED",
            signingStatus: "NOT_SIGNED",
            signedAt: null,
          },
        ],
      } as Partial<Document>),
    );

    const viewed = activities.find((a) => a.label === "Visualizado por Pedro");

    expect(viewed?.date).toBe("Recentemente");
    expect(viewed?.icon).toBe(Eye);
  });

  it("deve incluir finalização quando status for COMPLETED", () => {
    const activities = generateDocumentActivity(
      buildDoc({
        status: "COMPLETED",
        completedAt: "2024-06-03T15:00:00.000Z",
      }),
    );

    const finalized = activities.find(
      (a) => a.label === "Documento finalizado",
    );

    expect(finalized).toBeDefined();
    expect(finalized?.icon).toBe(FileCheck);
  });

  it("deve ordenar atividades do mais recente para o mais antigo", () => {
    const activities = generateDocumentActivity(
      buildDoc({
        status: "COMPLETED",
        completedAt: "2024-06-03T15:00:00.000Z",
        recipients: [
          {
            id: 1,
            name: "João",
            email: "joao@test.com",
            readStatus: "OPENED",
            signingStatus: "SIGNED",
            signedAt: "2024-06-02T12:00:00.000Z",
          },
        ],
      } as Partial<Document>),
    );

    for (let i = 0; i < activities.length - 1; i++) {
      expect(activities[i].timestamp).toBeGreaterThanOrEqual(
        activities[i + 1].timestamp,
      );
    }
  });
});
