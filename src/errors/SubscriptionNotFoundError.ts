import { AppError } from "./AppError";


export class SubscriptionNotFoundError extends AppError {
  constructor() {
    super('Inscrição à newsletter não localizada', 400)
  }
}