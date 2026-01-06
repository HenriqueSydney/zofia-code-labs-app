export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  healthCheck(): Promise<{ status: "up" | "down"; latency: number }>;
}
