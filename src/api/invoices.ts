import { apiRequest, downloadFile, uploadFormData } from "./client";
import type {
  Invoice,
  InvoiceCreateRequest,
  InvoicePayment,
  InvoicePaymentRequest,
  PaginatedInvoices,
} from "../types/api";

export function listInvoices(
  customerId: string | undefined,
  status: string | undefined,
  page: number,
  pageSize = 20,
  search?: string,
) {
  return apiRequest<PaginatedInvoices>("/invoices", {
    query: { customer_id: customerId, status, search, page, page_size: pageSize },
  });
}

export function getInvoice(id: string) {
  return apiRequest<Invoice>(`/invoices/${id}`);
}

export function createInvoice(body: InvoiceCreateRequest) {
  return apiRequest<Invoice>("/invoices", { method: "POST", body });
}

export function postInvoice(id: string) {
  return apiRequest<Invoice>(`/invoices/${id}/post`, { method: "POST" });
}

export function cancelInvoice(id: string, reason: string) {
  return apiRequest<Invoice>(`/invoices/${id}/cancel`, { method: "POST", body: { reason } });
}

export function duplicateInvoice(id: string) {
  return apiRequest<Invoice>(`/invoices/${id}/duplicate`, { method: "POST" });
}

export function recordInvoicePayment(id: string, body: InvoicePaymentRequest) {
  return apiRequest<InvoicePayment>(`/invoices/${id}/payments`, { method: "POST", body });
}

export interface CreditNoteRequest {
  amount: string;
  credit_date: string;
  reason?: string;
}

export interface CreditNoteResult {
  id: string;
  credit_note_number: string;
  amount: string;
  credit_date: string;
  reason: string | null;
  invoice_status_after: string;
  invoice_new_total: string;
}

export function applyCreditNote(id: string, body: CreditNoteRequest) {
  return apiRequest<CreditNoteResult>(`/invoices/${id}/credit-notes`, { method: "POST", body });
}

export function voidPayment(paymentNumber: string, reason: string) {
  return apiRequest<void>(`/invoices/payments/${paymentNumber}/void`, {
    method: "POST",
    body: { reason },
  });
}

export function emailInvoice(id: string, toEmail: string, message?: string, attachments?: File[]) {
  const formData = new FormData();
  formData.append("to_email", toEmail);
  if (message) formData.append("message", message);
  for (const file of attachments ?? []) {
    formData.append("attachments", file);
  }
  return uploadFormData<void>(`/invoices/${id}/email`, formData);
}

export interface InvoiceAttachment {
  id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  storage_path: string;
  uploaded_by: string | null;
  created_at: string;
}

export function listInvoiceAttachments(id: string) {
  return apiRequest<InvoiceAttachment[]>(`/invoices/${id}/attachments`);
}

export function uploadInvoiceAttachment(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return uploadFormData<InvoiceAttachment>(`/invoices/${id}/attachments/upload`, formData);
}

export function removeInvoiceAttachment(id: string, attachmentId: string) {
  return apiRequest<void>(`/invoices/${id}/attachments/${attachmentId}`, { method: "DELETE" });
}

export function downloadInvoiceAttachment(id: string, attachmentId: string, fileName: string) {
  return downloadFile(`/invoices/${id}/attachments/${attachmentId}/download`, fileName);
}

export function updateInvoice(
  id: string,
  body: Partial<{
    issue_date: string;
    due_date: string;
    items: InvoiceCreateRequest["items"];
    discount_percent: string;
    discount_amount: string;
    shipping_amount: string;
    notes: string;
    terms: string;
  }>,
) {
  return apiRequest<Invoice>(`/invoices/${id}`, { method: "PATCH", body });
}

export function deleteInvoice(id: string) {
  return apiRequest<void>(`/invoices/${id}`, { method: "DELETE" });
}
