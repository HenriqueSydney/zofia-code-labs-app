import { Expense, Invoice } from "@/generated/prisma/client";
import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { ValidationError, BusinessRuleError } from "@/errors";
import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";

// Tipo unificado para facilitar
type FinancialAsset = Expense | Invoice;
type FinancialContext = "INVOICE" | "EXPENSE";

export class AuthFinancialStrategy extends AuthBasePermissionStrategy<FinancialAsset> {
  // Injetamos o contexto no construtor para saber qual permissão checar (principalmente no CREATE)
  constructor(private context: FinancialContext) {
    super();
  }

  private getRequiredPermission(operation: Operation): PermissionString {
    // -------------------------------------------------------------------------
    // CONTEXTO: INVOICE (Faturas/Receitas)
    // -------------------------------------------------------------------------
    if (this.context === "INVOICE") {
      switch (operation) {
        case "READ":
          return PERMISSIONS.INVOICE.READ;
        case "CREATE":
        case "UPDATE":
          return PERMISSIONS.INVOICE.CREATE;
        case "DELETE":
          return PERMISSIONS.INVOICE.CREATE; // Geralmente quem cria pode deletar rascunhos
        case "CANCEL" as Operation:
          return PERMISSIONS.INVOICE.CANCEL;
        default:
          return PERMISSIONS.INVOICE.READ;
      }
    }

    // -------------------------------------------------------------------------
    // CONTEXTO: EXPENSE (Despesas/Custos)
    // -------------------------------------------------------------------------
    else {
      switch (operation) {
        case "READ":
          return PERMISSIONS.EXPENSE.READ;
        case "CREATE":
        case "UPDATE":
        case "DELETE":
          return PERMISSIONS.EXPENSE.CREATE;
        case "APPROVE" as Operation:
          return PERMISSIONS.EXPENSE.APPROVE;
        default:
          return PERMISSIONS.EXPENSE.READ;
      }
    }
  }

  protected validateSpecific(
    user: UserContext,
    asset: FinancialAsset | null,
    operation: Operation,
  ): void {
    // 1. Validação de Permissão (RBAC)
    const requiredPermission = this.getRequiredPermission(operation);

    if (!user.permissions.includes(requiredPermission)) {
      throw new UserDoesNotHavePermissionError(requiredPermission);
    }

    // Se não tem asset (CREATE), paramos aqui.
    if (!asset) return;

    // 2. Regras de Negócio e Imutabilidade
    if (this.context === "INVOICE") {
      this.validateInvoiceRules(asset as Invoice, operation);
    } else {
      this.validateExpenseRules(asset as Expense, operation);
    }
  }

  // --- Regras Específicas de Faturas ---
  private validateInvoiceRules(invoice: Invoice, operation: Operation) {
    // Faturas enviadas, pagas ou canceladas não podem ser alteradas/deletadas
    // Assumindo status: DRAFT, SENT, PAID, OVERDUE, VOID
    const isLocked = invoice.status !== "PENDING";

    if (isLocked) {
      if (operation === "UPDATE" || operation === "DELETE") {
        throw new ValidationError(`Fatura com status ${invoice.status} está bloqueada para edições. Use a ação 'Cancelar' se necessário.`, { statusCode: 400 });
      }
    }
  }

  // --- Regras Específicas de Despesas ---
  private validateExpenseRules(expense: Expense, operation: Operation) {
    // Despesas pagas ou aprovadas não devem ser excluídas para manter histórico
    // Assumindo status: PENDING, APPROVED, PAID, REJECTED
    const isLocked = ["PAID", "APPROVED"].includes(expense.status);

    if (isLocked && (operation === "DELETE" || operation === "UPDATE")) {
      throw new BusinessRuleError(`Despesa ${expense.status} não pode ser alterada.`, { statusCode: 400 });
    }
  }
}
