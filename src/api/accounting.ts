import { apiRequest } from "./client";
import type {
  Account,
  AccountCreateRequest,
  JournalEntry,
  JournalEntryCreateRequest,
  PaginatedJournalEntries,
} from "../types/api";

export function listAccounts(accountType?: string, activeOnly = true) {
  return apiRequest<Account[]>("/accounting/accounts", {
    query: { account_type: accountType, active_only: activeOnly ? "true" : "false" },
  });
}

export function createAccount(body: AccountCreateRequest) {
  return apiRequest<Account>("/accounting/accounts", { method: "POST", body });
}

export function listJournalEntries(
  status: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  page: number,
  pageSize = 20,
) {
  return apiRequest<PaginatedJournalEntries>("/accounting/journal-entries", {
    query: { status, start_date: startDate, end_date: endDate, page, page_size: pageSize },
  });
}

export function getJournalEntry(id: string) {
  return apiRequest<JournalEntry>(`/accounting/journal-entries/${id}`);
}

export function createJournalEntry(body: JournalEntryCreateRequest) {
  return apiRequest<JournalEntry>("/accounting/journal-entries", { method: "POST", body });
}

export function postJournalEntry(id: string) {
  return apiRequest<JournalEntry>(`/accounting/journal-entries/${id}/post`, { method: "POST" });
}

export function deleteDraftJournalEntry(id: string) {
  return apiRequest<void>(`/accounting/journal-entries/${id}`, { method: "DELETE" });
}

export function voidJournalEntry(id: string, reason: string) {
  return apiRequest<JournalEntry>(`/accounting/journal-entries/${id}/void`, {
    method: "POST",
    body: { reason },
  });
}
