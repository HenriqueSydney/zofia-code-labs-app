import { IntegrationBase } from "@/services/IntegrationBase";
import { IEmailService } from "../IEmailService";

// Implementação com Resend (menor custo e melhor DX)
export class ResendEmailService
  extends IntegrationBase
  implements IEmailService
{
  private apiKey: string;
  private from: string = "Zofia Code Labs <contato@zofiacodelabs.com>";

  constructor(config: { apiKey: string; fromEmail?: string }) {
    super("resend");
    this.apiKey = config.apiKey;
    if (config.fromEmail) {
      this.from = config.fromEmail;
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to,
        subject,
        html: body,
      }),
    });
  }

  async healthCheck() {
    // Simples validação de API Key
    return { status: "up" as const, latency: 0 };
  }
}
