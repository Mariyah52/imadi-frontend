import { apiRequest } from "./client";
import type {
  PaginatedVatReturns,
  VatNumberValidateResponse,
  VatRate,
  VatReturn,
  VatReturnCreateRequest,
  VatSummary,
} from "../types/api";

export function listVatRates() {
  return apiRequest<VatRate[]>("/vat/rates");
}

export function getVatSummary(periodStart: string, periodEnd: string) {
  return apiRequest<VatSummary>("/vat/summary", {
    query: { period_start: periodStart, period_end: periodEnd },
  });
}

export function listVatReturns(page: number, pageSize = 20) {
  return apiRequest<PaginatedVatReturns>("/vat/returns", { query: { page, page_size: pageSize } });
}

export function getVatReturn(id: string) {
  return apiRequest<VatReturn>(`/vat/returns/${id}`);
}

export function createVatReturn(body: VatReturnCreateRequest) {
  return apiRequest<VatReturn>("/vat/returns", { method: "POST", body });
}

export function recomputeVatReturn(id: string) {
  return apiRequest<VatReturn>(`/vat/returns/${id}/recompute`, { method: "POST" });
}

export function submitVatReturn(id: string) {
  return apiRequest<VatReturn>(`/vat/returns/${id}/submit`, { method: "POST" });
}

export function validateVatNumber(vatNumber: string) {
  return apiRequest<VatNumberValidateResponse>("/vat/validate-number", {
    method: "POST",
    body: { vat_number: vatNumber },
  });
}
