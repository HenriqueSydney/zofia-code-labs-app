// @/services/payment/BankingServiceFactory.ts
import { IBankingService } from "./IBankingService";
import { CoraBankingService } from "./implementations/CoraBankingService";

let bankingService: IBankingService | null = null;

export function makeBankingService() {
  if (!bankingService) {
    bankingService = new CoraBankingService();
  }
  return bankingService;
}
