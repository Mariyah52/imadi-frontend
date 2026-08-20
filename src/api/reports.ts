import { apiRequest } from "./client";

// There's no dedicated /dashboard endpoint on the backend yet — the
// dashboard composes a few existing report endpoints instead. If a
// purpose-built summary endpoint gets added later, swap these three
// calls for one.

export interface ProfitReport {
  start_date: string;
  end_date: string;
  total_income: string;
  total_expense: string;
  net_income: string;
  gross_margin_percent: string;
}

export interface AgingRow {
  total: string;
  current: string;
  days_1_30: string;
  days_31_60: string;
  days_61_90: string;
  days_90_plus: string;
  customer_id?: string;
  customer_name?: string;
  supplier_id?: string;
  supplier_name?: string;
}

export interface AgingReport {
  as_of: string;
  totals: Record<string, string>;
  grand_total: string;
  rows: AgingRow[];
}

export interface SalesReport {
  period_start: string;
  period_end: string;
  invoice_count: number;
  total_net: string;
  total_vat: string;
  total_gross: string;
  by_customer: { customer_id: string; customer_name: string; invoice_count: number; net: string; vat: string; gross: string }[];
  by_day: { date: string; net: string }[];
}

export interface PurchaseReport {
  by_supplier: { supplier_id: string; bill_count: number; net: string; vat: string }[];
  total_purchases: string;
  total_vat: string;
}

export interface InventoryReportRow {
  product_id: string;
  sku: string;
  name: string;
  quantity_on_hand: string;
  cost_price: string;
  stock_value: string;
  is_low_stock: boolean;
}

export interface InventoryReport {
  product_count: number;
  total_stock_value: string;
  low_stock_count: number;
  products: InventoryReportRow[];
}

export interface StockValuationLine {
  product_id: string;
  sku: string;
  name: string;
  warehouse_id: string;
  batch_number: string;
  quantity_on_hand: string;
  unit_cost: string;
  value: string;
}

export interface StockValuationReport {
  as_of: string;
  total_value: string;
  lines: StockValuationLine[];
}

export interface TrialBalanceRow {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit: string;
  credit: string;
}

export interface TrialBalanceReport {
  as_of: string;
  rows: TrialBalanceRow[];
  total_debit: string;
  total_credit: string;
}

export interface BalanceSheetLine {
  account_id: string;
  account_code: string;
  account_name: string;
  amount: string;
}

export interface BalanceSheetReport {
  as_of: string;
  assets: BalanceSheetLine[];
  total_assets: string;
  liabilities: BalanceSheetLine[];
  total_liabilities: string;
  equity: BalanceSheetLine[];
  total_equity: string;
  current_period_earnings: string;
  total_equity_and_earnings: string;
  balances: boolean;
}

export interface GeneralLedgerLine {
  entry_date: string;
  entry_number: string;
  description: string;
  debit: string;
  credit: string;
  running_balance: string;
}

export interface GeneralLedgerReport {
  account_id: string;
  account_code: string;
  account_name: string;
  opening_balance: string;
  closing_balance: string;
  lines: GeneralLedgerLine[];
}

export interface CashFlowReport {
  start_date: string;
  end_date: string;
  opening_cash_balance: string;
  closing_cash_balance: string;
  net_movement: string;
  categories: Record<string, string>;
}

export interface DriverPerformanceRow {
  driver_id: string;
  driver_name: string;
  total_shipments: number;
  delivered_count: number;
  exception_count: number;
  cancelled_count: number;
  on_time_count: number;
  on_time_rate_percent: string;
}

export interface DriverPerformanceReport {
  period_start: string;
  period_end: string;
  drivers: DriverPerformanceRow[];
}

export interface VehicleCostRow {
  vehicle_id: string;
  registration: string;
  fuel_cost: string;
  maintenance_cost: string;
  total_cost: string;
  distance_km: string;
  cost_per_km: string | null;
}

export interface VehicleCostReport {
  period_start: string;
  period_end: string;
  vehicles: VehicleCostRow[];
}

export function getProfitReport(periodStart: string, periodEnd: string) {
  return apiRequest<ProfitReport>("/reports/profit", {
    query: { period_start: periodStart, period_end: periodEnd },
  });
}

export function getCustomerAging(asOf: string) {
  return apiRequest<AgingReport>("/reports/customer-aging", { query: { as_of: asOf } });
}

export function getSupplierAging(asOf: string) {
  return apiRequest<AgingReport>("/reports/supplier-aging", { query: { as_of: asOf } });
}

export function getSalesReport(periodStart: string, periodEnd: string) {
  return apiRequest<SalesReport>("/reports/sales", {
    query: { period_start: periodStart, period_end: periodEnd },
  });
}

export function getPurchaseReport(periodStart: string, periodEnd: string) {
  return apiRequest<PurchaseReport>("/reports/purchases", {
    query: { period_start: periodStart, period_end: periodEnd },
  });
}

export function getInventoryReport() {
  return apiRequest<InventoryReport>("/reports/inventory");
}

export function getStockValuationReport() {
  return apiRequest<StockValuationReport>("/reports/stock-valuation");
}

export function getTrialBalanceReport(asOf: string) {
  return apiRequest<TrialBalanceReport>("/reports/trial-balance", { query: { as_of: asOf } });
}

export function getBalanceSheetReport(asOf: string) {
  return apiRequest<BalanceSheetReport>("/reports/balance-sheet", { query: { as_of: asOf } });
}

export function getGeneralLedgerReport(accountId: string, periodStart: string, periodEnd: string) {
  return apiRequest<GeneralLedgerReport>(`/reports/general-ledger/${accountId}`, {
    query: { period_start: periodStart, period_end: periodEnd },
  });
}

export function getCashFlowReport(glAccountIds: string[], startDate: string, endDate: string) {
  return apiRequest<CashFlowReport>("/reports/cash-flow", {
    method: "POST",
    body: { gl_account_ids: glAccountIds, start_date: startDate, end_date: endDate },
  });
}

export function getDriverPerformanceReport(periodStart: string, periodEnd: string) {
  return apiRequest<DriverPerformanceReport>("/reports/driver-performance", {
    query: { period_start: periodStart, period_end: periodEnd },
  });
}

export function getVehicleCostReport(periodStart: string, periodEnd: string) {
  return apiRequest<VehicleCostReport>("/reports/vehicle-cost", {
    query: { period_start: periodStart, period_end: periodEnd },
  });
}
