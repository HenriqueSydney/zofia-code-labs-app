import { AppError } from "./AppError";


export class NotFoundPostError extends AppError {
  constructor() {
    super('Blog post not found', 404)
  }
}