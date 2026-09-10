import { apiRequest, getAccessToken, ApiError } from "./client";
import type {
  AiSearchResponse,
  AssistantResponse,
  BusinessInsight,
  CashFlowForecast,
  CategorizeExpenseResponse,
  DuplicateBillPair,
  DuplicateInvoicePair,
  OcrDocument,
  PaginatedOcrDocuments,
} from "../types/api";

export function aiSearch(q: string) {
  return apiRequest<AiSearchResponse>("/ai/search", { query: { q } });
}

export function getBusinessInsights() {
  return apiRequest<{ insights: BusinessInsight[] }>("/ai/insights");
}

export function getCashFlowForecast(weeksAhead = 8) {
  return apiRequest<CashFlowForecast>("/ai/cash-flow-forecast", { query: { weeks_ahead: weeksAhead } });
}

export function getDuplicateBills(dateWindowDays = 5, amountTolerancePercent = "1") {
  return apiRequest<DuplicateBillPair[]>("/ai/duplicate-bills", {
    query: { date_window_days: dateWindowDays, amount_tolerance_percent: amountTolerancePercent },
  });
}

export function getDuplicateInvoices(dateWindowDays = 5, amountTolerancePercent = "1") {
  return apiRequest<DuplicateInvoicePair[]>("/ai/duplicate-invoices", {
    query: { date_window_days: dateWindowDays, amount_tolerance_percent: amountTolerancePercent },
  });
}

export function categorizeExpense(description: string) {
  return apiRequest<CategorizeExpenseResponse>("/ai/categorize-expense", {
    method: "POST",
    body: { description },
  });
}

export function askAssistant(question: string) {
  return apiRequest<AssistantResponse>("/ai/assistant", { method: "POST", body: { question } });
}

export function listOcrDocuments(documentType: string | undefined, page: number, pageSize = 20) {
  return apiRequest<PaginatedOcrDocuments>("/ai/ocr/documents", {
    query: { document_type: documentType, page, page_size: pageSize },
  });
}

export function getOcrDocument(id: string) {
  return apiRequest<OcrDocument>(`/ai/ocr/documents/${id}`);
}

// File upload needs multipart/form-data, which the shared JSON apiRequest
// helper doesn't support — a small dedicated request here instead.
async function uploadOcr(path: string, file: File): Promise<OcrDocument> {
  const form = new FormData();
  form.append("file", file);
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: form,
  });
  if (!res.ok) {
    let message = `Upload failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, "upload_failed", message);
  }
  return res.json();
}

export function ocrInvoice(file: File) {
  return uploadOcr("/ai/ocr/invoice", file);
}

export function ocrReceipt(file: File) {
  return uploadOcr("/ai/ocr/receipt", file);
}
