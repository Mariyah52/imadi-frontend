import { apiRequest } from "./client";
import type {
  AutoMatchResult,
  BankAccount,
  BankAccountBalance,
  BankAccountCreateRequest,
  BankAccountUpdateRequest,
  BankTransaction,
  BankTransactionCreateRequest,
  BankTransfer,
  BankTransferCreateRequest,
  PaginatedBankAccounts,
  Reconciliation,
  StatementImport,
  StatementImportRequest,
} from "../types/api";

// --- Accounts ---

export function listBankAccounts(accountKind: string | undefined, page: number, pageSize = 20) {
  return apiRequest<PaginatedBankAccounts>("/banking/accounts", {
    query: { account_kind: accountKind, page, page_size: pageSize },
  });
}

export function getBankAccount(id: string) {
  return apiRequest<BankAccountBalance>(`/banking/accounts/${id}`);
}

export function createBankAccount(body: BankAccountCreateRequest) {
  return apiRequest<BankAccount>("/banking/accounts", { method: "POST", body });
}

export function updateBankAccount(id: string, body: BankAccountUpdateRequest) {
  return apiRequest<BankAccount>(`/banking/accounts/${id}`, { method: "PATCH", body });
}

// --- Transactions ---

export function listBankTransactions(accountId: string, reconciled?: boolean) {
  return apiRequest<BankTransaction[]>(`/banking/accounts/${accountId}/transactions`, {
    query: { reconciled: reconciled === undefined ? undefined : reconciled ? "true" : "false" },
  });
}

export function addBankTransaction(accountId: string, body: BankTransactionCreateRequest) {
  return apiRequest<BankTransaction>(`/banking/accounts/${accountId}/transactions`, {
    method: "POST",
    body,
  });
}

// --- Transfers ---

export function createBankTransfer(body: BankTransferCreateRequest) {
  return apiRequest<BankTransfer>("/banking/transfers", { method: "POST", body });
}

// --- Statement import + matching ---

export function importStatement(body: StatementImportRequest) {
  return apiRequest<StatementImport>("/banking/statement-imports", { method: "POST", body });
}

export function getStatementImport(id: string) {
  return apiRequest<StatementImport>(`/banking/statement-imports/${id}`);
}

export function autoMatchStatement(importId: string) {
  return apiRequest<AutoMatchResult>(`/banking/statement-imports/${importId}/auto-match`, {
    method: "POST",
  });
}

export function manualMatchLine(lineId: string, transactionId: string) {
  return apiRequest(`/banking/statement-lines/${lineId}/match`, {
    method: "POST",
    body: { transaction_id: transactionId },
  });
}

export function unmatchLine(lineId: string) {
  return apiRequest(`/banking/statement-lines/${lineId}/unmatch`, { method: "POST" });
}

export function createAndMatchLine(lineId: string, transactionType = "manual") {
  return apiRequest(`/banking/statement-lines/${lineId}/create-transaction`, {
    method: "POST",
    body: { transaction_type: transactionType },
  });
}

export function ignoreLine(lineId: string) {
  return apiRequest(`/banking/statement-lines/${lineId}/ignore`, { method: "POST" });
}

// --- Reconciliation ---

export function startReconciliation(statementImportId: string) {
  return apiRequest<Reconciliation>("/banking/reconciliations", {
    method: "POST",
    body: { statement_import_id: statementImportId },
  });
}

export function completeReconciliation(id: string) {
  return apiRequest<Reconciliation>(`/banking/reconciliations/${id}/complete`, { method: "POST" });
}
