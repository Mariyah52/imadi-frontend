import { apiRequest } from "./client";
import type {
  BillCreateRequest,
  BillFull,
  BillPayment,
  BillPaymentRequest,
  GoodsReceiptRequest,
  PaginatedBills,
  PaginatedPurchaseOrders,
  PurchaseOrderCreateRequest,
  PurchaseOrderFull,
} from "../types/api";

// --- Purchase orders ---

export function listPurchaseOrders(
  supplierId: string | undefined,
  status: string | undefined,
  page: number,
  pageSize = 20,
) {
  return apiRequest<PaginatedPurchaseOrders>("/purchasing/purchase-orders", {
    query: { supplier_id: supplierId, status, page, page_size: pageSize },
  });
}

export function getPurchaseOrder(id: string) {
  return apiRequest<PurchaseOrderFull>(`/purchasing/purchase-orders/${id}`);
}

export function deletePurchaseOrder(id: string) {
  return apiRequest<void>(`/purchasing/purchase-orders/${id}`, { method: "DELETE" });
}

export function createPurchaseOrder(body: PurchaseOrderCreateRequest) {
  return apiRequest<PurchaseOrderFull>("/purchasing/purchase-orders", { method: "POST", body });
}

export function submitPurchaseOrder(id: string) {
  return apiRequest<PurchaseOrderFull>(`/purchasing/purchase-orders/${id}/submit`, {
    method: "POST",
  });
}

export function approvePurchaseOrder(id: string) {
  return apiRequest<PurchaseOrderFull>(`/purchasing/purchase-orders/${id}/approve`, {
    method: "POST",
  });
}

export function rejectPurchaseOrder(id: string, reason: string) {
  return apiRequest<PurchaseOrderFull>(`/purchasing/purchase-orders/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

export function receiveGoods(id: string, body: GoodsReceiptRequest) {
  return apiRequest<PurchaseOrderFull>(`/purchasing/purchase-orders/${id}/receive`, {
    method: "POST",
    body,
  });
}

// --- Bills ---

export function listBills(
  supplierId: string | undefined,
  status: string | undefined,
  page: number,
  pageSize = 20,
) {
  return apiRequest<PaginatedBills>("/purchasing/bills", {
    query: { supplier_id: supplierId, status, page, page_size: pageSize },
  });
}

export function getBill(id: string) {
  return apiRequest<BillFull>(`/purchasing/bills/${id}`);
}

export function deleteBill(id: string) {
  return apiRequest<void>(`/purchasing/bills/${id}`, { method: "DELETE" });
}

export function createBill(body: BillCreateRequest) {
  return apiRequest<BillFull>("/purchasing/bills", { method: "POST", body });
}

export function submitBill(id: string) {
  return apiRequest<BillFull>(`/purchasing/bills/${id}/submit`, { method: "POST" });
}

export function approveBill(id: string) {
  return apiRequest<BillFull>(`/purchasing/bills/${id}/approve`, { method: "POST" });
}

export function rejectBill(id: string, reason: string) {
  return apiRequest<BillFull>(`/purchasing/bills/${id}/reject`, { method: "POST", body: { reason } });
}

export function recordBillPayment(id: string, body: BillPaymentRequest) {
  return apiRequest<BillPayment>(`/purchasing/bills/${id}/payments`, { method: "POST", body });
}
