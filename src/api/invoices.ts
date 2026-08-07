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
