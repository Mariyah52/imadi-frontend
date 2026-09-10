import { apiRequest } from "./client";
import type {
  Bill,
  Note,
  PaginatedSuppliers,
  PurchaseOrder,
  Supplier,
  SupplierCreateRequest,
  SupplierProfile,
  SupplierUpdateRequest,
} from "../types/api";

export function listSuppliers(search: string, page: number, pageSize = 20) {
  return apiRequest<PaginatedSuppliers>("/suppliers", {
    query: { search: search || undefined, page, page_size: pageSize },
  });
}

export function getSupplierProfile(id: string) {
  return apiRequest<SupplierProfile>(`/suppliers/${id}`);
}

export function createSupplier(body: SupplierCreateRequest) {
  return apiRequest<Supplier>("/suppliers", { method: "POST", body });
}

export function updateSupplier(id: string, body: SupplierUpdateRequest) {
  return apiRequest<Supplier>(`/suppliers/${id}`, { method: "PATCH", body });
}

export function deleteSupplier(id: string) {
  return apiRequest<void>(`/suppliers/${id}`, { method: "DELETE" });
}

export function listPurchaseHistory(id: string) {
  return apiRequest<PurchaseOrder[]>(`/suppliers/${id}/purchase-history`);
}

export function listSupplierBills(id: string) {
  return apiRequest<Bill[]>(`/suppliers/${id}/bills`);
}

export function listSupplierNotes(id: string) {
  return apiRequest<Note[]>(`/suppliers/${id}/notes`);
}

export function addSupplierNote(id: string, body: string) {
  return apiRequest<Note>(`/suppliers/${id}/notes`, { method: "POST", body: { body } });
}
