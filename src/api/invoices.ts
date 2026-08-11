import { apiRequest } from "./client";
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
) {
  return apiRequest<PaginatedInvoices>("/invoices", {
    query: { customer_id: customerId, status, page, page_size: pageSize },
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

export function emailInvoice(id: string, toEmail: string, message?: string) {
  return apiRequest<void>(`/invoices/${id}/email`, {
    method: "POST",
    body: { to_email: toEmail, message },
  });
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
