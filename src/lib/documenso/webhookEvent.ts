export type DocumensoWebhookEvent =
  | "DOCUMENT_CREATED"
  | "DOCUMENT_SENT"
  | "DOCUMENT_OPENED"
  | "DOCUMENT_SIGNED"
  | "DOCUMENT_RECIPIENT_COMPLETED"
  | "DOCUMENT_COMPLETED"
  | "DOCUMENT_REJECTED"
  | "DOCUMENT_CANCELLED"
  | "DOCUMENT_REMINDER_SENT";

export function normalizeDocumensoWebhookEvent(event: string): string {
  return String(event).trim().toUpperCase().replace(/\./g, "_");
}

export function buildDocumensoWebhookEventId({
  eventType,
  documentId,
  deliveredAt,
}: {
  eventType: string;
  documentId: string | number;
  deliveredAt: string;
}): string {
  return `DOCUMENSO:${eventType}:${documentId}:${deliveredAt}`;
}
