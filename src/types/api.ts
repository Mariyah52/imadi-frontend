// Mirrors app/schemas/auth.py and app/schemas/customer.py in the backend.
// Keep these in sync manually — there's no shared codegen yet.

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  full_name: string;
  permissions: string[];
}

export interface TwoFactorRequiredResponse {
  two_factor_required: true;
  two_factor_token: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  full_name: string;
  permissions: string[];
  mfa_enabled: boolean;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export interface Customer {
  id: string;
  customer_code: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  vat_number: string | null;
  payment_terms_days: number;
  credit_limit: string; // Decimal serializes as string
  currency: string;
  charges_vat: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CustomerProfile extends Customer {
  outstanding_balance: string;
  available_credit: string;
  contact_count: number;
  address_count: number;
}

export interface PaginatedCustomers {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
}

export interface CustomerCreateRequest {
  customer_code: string;
  company_name: string;
  email?: string;
  phone?: string;
  vat_number?: string;
  payment_terms_days?: number;
  credit_limit?: string;
  currency?: string;
  charges_vat?: boolean;
}

export interface CustomerInvoice {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  total: string;
  amount_paid: string;
  balance: string;
}

export interface Contact {
  id: string;
  name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface ContactCreateRequest {
  name: string;
  job_title?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
}

export type AddressType = "billing" | "shipping" | "registered";

export interface Address {
  id: string;
  address_type: AddressType;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country_code: string;
  is_default: boolean;
}

export interface AddressCreateRequest {
  address_type: AddressType;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country_code?: string;
  is_default?: boolean;
}

export interface Note {
  id: string;
  body: string;
  author_id: string | null;
  created_at: string;
}

export interface CustomerUpdateRequest {
  company_name?: string;
  email?: string;
  phone?: string;
  vat_number?: string;
  payment_terms_days?: number;
  is_active?: boolean;
  charges_vat?: boolean;
}

// --- Suppliers ---

export interface Supplier {
  id: string;
  supplier_code: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  vat_number: string | null;
  payment_terms_days: number;
  currency: string;
  bank_account_iban: string | null;
  bank_sort_code: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SupplierProfile extends Supplier {
  outstanding_balance: string;
}

export interface PaginatedSuppliers {
  items: Supplier[];
  total: number;
  page: number;
  page_size: number;
}

export interface SupplierCreateRequest {
  supplier_code: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  vat_number?: string;
  payment_terms_days?: number;
  currency?: string;
  charges_vat?: boolean;
  bank_account_iban?: string;
  bank_sort_code?: string;
}

export interface SupplierUpdateRequest {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  vat_number?: string;
  payment_terms_days?: number;
  bank_account_iban?: string;
  charges_vat?: boolean;
  bank_sort_code?: string;
  is_active?: boolean;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  status: string;
  order_date: string;
  expected_date: string | null;
  total: string;
}

export interface Bill {
  id: string;
  bill_number: string;
  status: string;
  bill_date: string;
  due_date: string;
  total: string;
  amount_paid: string;
  balance: string;
}

// --- Inventory ---

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  qr_code: string | null;
  name: string;
  description: string | null;
  category_id: string | null;
  cost_price: string;
  selling_price: string;
  vat_treatment: "standard" | "reduced" | "zero" | "exempt";
  vat_rate: string;
  minimum_stock: string;
  maximum_stock: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductStockSummary extends Product {
  total_stock: string;
  is_low_stock: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProductCreateRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  cost_price?: string;
  selling_price?: string;
  vat_treatment?: Product["vat_treatment"];
  vat_rate?: string;
  minimum_stock?: string;
  maximum_stock?: string;
}

export interface StockItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  batch_number: string;
  expiry_date: string | null;
  quantity_on_hand: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  related_warehouse_id: string | null;
  batch_number: string;
  movement_type: string;
  quantity: string;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface LowStockProduct {
  product_id: string;
  sku: string;
  name: string;
  total_stock: string;
  minimum_stock: string;
}

export interface StockReceiptRequest {
  product_id: string;
  warehouse_id: string;
  batch_number?: string;
  expiry_date?: string;
  quantity: string;
  reason?: string;
}

export interface StockIssueRequest {
  product_id: string;
  warehouse_id: string;
  batch_number?: string;
  quantity: string;
  reason?: string;
}

export interface StockAdjustmentRequest {
  product_id: string;
  warehouse_id: string;
  batch_number?: string;
  quantity_delta: string;
  reason: string;
}

// --- Invoicing ---

export type InvoiceStatus = "draft" | "posted" | "paid" | "partially_paid" | "overdue" | "cancelled";

export interface InvoiceItem {
  id: string;
  product_id: string | null;
  description: string;
  quantity: string;
  unit_price: string;
  discount_percent: string;
  vat_treatment: Product["vat_treatment"];
  vat_rate: string;
  line_subtotal: string;
  vat_amount: string;
  line_total: string;
  line_number: number;
}

export interface InvoiceItemCreateRequest {
  product_id?: string;
  description: string;
  quantity: string;
  unit_price: string;
  discount_percent?: string;
  vat_treatment?: Product["vat_treatment"];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  status: string;
  effective_status: string;
  issue_date: string;
  due_date: string;
  currency: string;
  subtotal: string;
  discount_percent: string;
  discount_amount: string;
  shipping_amount: string;
  vat_total: string;
  total: string;
  amount_paid: string;
  balance: string;
  notes: string | null;
  terms: string | null;
  journal_entry_id: string | null;
  duplicated_from_id: string | null;
  created_at: string;
  items: InvoiceItem[];
}

export interface InvoiceSummary {
  id: string;
  invoice_number: string;
  customer_id: string;
  status: string;
  effective_status: string;
  issue_date: string;
  due_date: string;
  total: string;
  amount_paid: string;
  balance: string;
}

export interface PaginatedInvoices {
  items: InvoiceSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface InvoiceCreateRequest {
  customer_id: string;
  issue_date: string;
  due_date: string;
  currency?: string;
  items: InvoiceItemCreateRequest[];
  discount_percent?: string;
  discount_amount?: string;
  shipping_amount?: string;
  notes?: string;
  terms?: string;
}

export interface InvoicePaymentRequest {
  amount: string;
  payment_date: string;
  method?: string;
  reference?: string;
}

export interface InvoicePayment {
  id: string;
  payment_number: string;
  amount: string;
  payment_date: string;
  method: string;
  reference: string | null;
  invoice_status_after: string;
}

// --- Purchasing ---

export interface PurchaseOrderItem {
  id: string;
  product_id: string | null;
  description: string;
  quantity_ordered: string;
  quantity_received: string;
  quantity_outstanding: string;
  unit_cost: string;
  vat_treatment: Product["vat_treatment"];
  vat_rate: string;
  line_subtotal: string;
  vat_amount: string;
  line_total: string;
  line_number: number;
}

export interface PurchaseOrderItemCreateRequest {
  product_id?: string;
  description: string;
  quantity_ordered: string;
  unit_cost: string;
  vat_treatment?: Product["vat_treatment"];
}

export interface PurchaseOrderFull {
  id: string;
  po_number: string;
  supplier_id: string;
  status: string;
  order_date: string;
  expected_date: string | null;
  currency: string;
  subtotal: string;
  vat_total: string;
  total: string;
  notes: string | null;
  terms: string | null;
  rejection_reason: string | null;
  created_at: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderSummary {
  id: string;
  po_number: string;
  supplier_id: string;
  status: string;
  order_date: string;
  expected_date: string | null;
  total: string;
}

export interface PaginatedPurchaseOrders {
  items: PurchaseOrderSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface PurchaseOrderCreateRequest {
  supplier_id: string;
  order_date: string;
  expected_date?: string;
  currency?: string;
  items: PurchaseOrderItemCreateRequest[];
  notes?: string;
  terms?: string;
}

export interface GoodsReceiptLineRequest {
  po_item_id: string;
  quantity_received: string;
}

export interface GoodsReceiptRequest {
  warehouse_id: string;
  batch_number?: string;
  lines: GoodsReceiptLineRequest[];
}

export interface BillItem {
  id: string;
  product_id: string | null;
  description: string;
  quantity: string;
  unit_cost: string;
  vat_treatment: Product["vat_treatment"];
  vat_rate: string;
  line_subtotal: string;
  vat_amount: string;
  line_total: string;
  line_number: number;
}

export interface BillItemCreateRequest {
  product_id?: string;
  description: string;
  quantity: string;
  unit_cost: string;
  vat_treatment?: Product["vat_treatment"];
}

export interface BillFull {
  id: string;
  bill_number: string;
  supplier_id: string;
  purchase_order_id: string | null;
  status: string;
  effective_status: string;
  bill_date: string;
  due_date: string;
  currency: string;
  subtotal: string;
  vat_total: string;
  total: string;
  amount_paid: string;
  balance: string;
  notes: string | null;
  terms: string | null;
  rejection_reason: string | null;
  journal_entry_id: string | null;
  created_at: string;
  items: BillItem[];
}

export interface BillSummary {
  id: string;
  bill_number: string;
  supplier_id: string;
  status: string;
  effective_status: string;
  bill_date: string;
  due_date: string;
  total: string;
  amount_paid: string;
  balance: string;
}

export interface PaginatedBills {
  items: BillSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface BillCreateRequest {
  supplier_id: string;
  purchase_order_id?: string;
  bill_date: string;
  due_date: string;
  currency?: string;
  items: BillItemCreateRequest[];
  notes?: string;
  terms?: string;
}

export interface BillPaymentRequest {
  amount: string;
  payment_date: string;
  method?: string;
  reference?: string;
}

export interface BillPayment {
  id: string;
  payment_number: string;
  amount: string;
  payment_date: string;
  method: string;
  reference: string | null;
  bill_status_after: string;
}

// --- VAT ---

export interface VatRate {
  treatment: string;
  rate: string;
  label: string;
}

export interface VatSummaryRow {
  treatment: string;
  net: string;
  vat: string;
  gross: string;
}

export interface VatSummary {
  period_start: string;
  period_end: string;
  sales: VatSummaryRow[];
  sales_total_net: string;
  sales_total_vat: string;
  purchases: VatSummaryRow[];
  purchases_total_net: string;
  purchases_total_vat: string;
}

export interface VatReturn {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  box1_vat_due_on_sales: string;
  box2_vat_due_on_acquisitions: string;
  box3_total_vat_due: string;
  box4_vat_reclaimed: string;
  box5_net_vat_due: string;
  box6_total_sales_ex_vat: string;
  box7_total_purchases_ex_vat: string;
  box8_ec_supplies: string;
  box9_ec_acquisitions: string;
  submitted_at: string | null;
  hmrc_receipt_reference: string | null;
  created_at: string;
}

export interface VatReturnSummary {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  box5_net_vat_due: string;
}

export interface PaginatedVatReturns {
  items: VatReturnSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface VatReturnCreateRequest {
  period_start: string;
  period_end: string;
}

export interface VatNumberValidateResponse {
  valid: boolean;
  normalized: string;
  format: string;
  message: string;
}

// --- Accounting ---

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export interface Account {
  id: string;
  account_code: string;
  name: string;
  account_type: AccountType;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AccountCreateRequest {
  account_code: string;
  name: string;
  account_type: AccountType;
  description?: string;
  parent_id?: string;
}

export interface JournalLineRequest {
  account_id: string;
  debit: string;
  credit: string;
  description?: string;
}

export interface JournalEntryCreateRequest {
  entry_date: string;
  description: string;
  lines: JournalLineRequest[];
}

export interface JournalLine {
  id: string;
  account_id: string;
  debit: string;
  credit: string;
  description: string | null;
  line_number: number;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: string;
  reference_type: string | null;
  reference_id: string | null;
  reversed_entry_id: string | null;
  created_at: string;
  lines: JournalLine[];
}

export interface JournalEntrySummary {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: string;
  reference_type: string | null;
}

export interface PaginatedJournalEntries {
  items: JournalEntrySummary[];
  total: number;
  page: number;
  page_size: number;
}

// --- Banking ---

export type BankAccountKind = "bank" | "cash";

export interface BankAccount {
  id: string;
  name: string;
  account_kind: BankAccountKind;
  bank_name: string | null;
  account_number: string | null;
  sort_code: string | null;
  iban: string | null;
  currency: string;
  opening_balance: string;
  opening_balance_date: string;
  is_active: boolean;
  created_at: string;
}

export interface BankAccountBalance extends BankAccount {
  current_balance: string;
  reconciled_balance: string;
  unreconciled_transaction_count: number;
}

export interface PaginatedBankAccounts {
  items: BankAccount[];
  total: number;
  page: number;
  page_size: number;
}

export interface BankAccountCreateRequest {
  name: string;
  account_kind?: BankAccountKind;
  bank_name?: string;
  account_number?: string;
  sort_code?: string;
  iban?: string;
  currency?: string;
  opening_balance?: string;
  opening_balance_date: string;
}

export interface BankAccountUpdateRequest {
  name?: string;
  bank_name?: string;
  account_number?: string;
  sort_code?: string;
  iban?: string;
  is_active?: boolean;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  transaction_date: string;
  description: string;
  amount: string;
  transaction_type: string;
  reference_type: string | null;
  reference_id: string | null;
  reconciled: boolean;
  reconciled_at: string | null;
  created_at: string;
}

export interface BankTransactionCreateRequest {
  transaction_date: string;
  description: string;
  amount: string;
  transaction_type?: string;
}

export interface BankTransferCreateRequest {
  from_account_id: string;
  to_account_id: string;
  amount: string;
  transfer_date: string;
  reference?: string;
  notes?: string;
}

export interface BankTransfer {
  id: string;
  transfer_number: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  transfer_date: string;
  reference: string | null;
  notes: string | null;
  journal_entry_id: string | null;
  created_at: string;
}

export interface StatementLine {
  id: string;
  line_date: string;
  description: string;
  amount: string;
  external_reference: string | null;
  status: string;
  matched_transaction_id: string | null;
}

export interface StatementImportRequest {
  bank_account_id: string;
  file_name: string;
  opening_balance: string;
  closing_balance: string;
  csv_content: string;
}

export interface StatementImport {
  id: string;
  bank_account_id: string;
  file_name: string;
  statement_start_date: string;
  statement_end_date: string;
  opening_balance: string;
  closing_balance: string;
  imported_at: string;
  lines: StatementLine[];
  unmatched_count: number;
  matched_count: number;
}

export interface AutoMatchResult {
  matched_count: number;
  still_unmatched_count: number;
  lines: StatementLine[];
}

export interface Reconciliation {
  id: string;
  bank_account_id: string;
  statement_import_id: string;
  status: string;
  book_balance_at_start: string;
  statement_closing_balance: string;
  difference: string | null;
  started_at: string;
  completed_at: string | null;
}

// --- Logistics ---

export type DriverStatus = "active" | "on_leave" | "suspended" | "terminated";

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  licence_number: string;
  licence_expiry: string;
  phone: string | null;
  status: DriverStatus;
  created_at: string;
}

export interface PaginatedDrivers {
  items: Driver[];
  total: number;
  page: number;
  page_size: number;
}

export interface DriverCreateRequest {
  first_name: string;
  last_name: string;
  licence_number: string;
  licence_expiry: string;
  phone?: string;
}

export interface DriverUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  status?: DriverStatus;
  licence_expiry?: string;
}

export interface DriverDashboard {
  driver: Driver;
  date: string;
  shipments_today_count: number;
  routes_today_count: number;
  licence_expiring_soon: boolean;
}

export type VehicleStatus = "active" | "maintenance" | "retired";

export interface Vehicle {
  id: string;
  registration: string;
  make: string | null;
  model: string | null;
  capacity_kg: string | null;
  status: VehicleStatus;
  current_odometer_km: string;
  next_service_due_date: string | null;
  next_service_due_km: string | null;
  created_at: string;
}

export interface PaginatedVehicles {
  items: Vehicle[];
  total: number;
  page: number;
  page_size: number;
}

export interface VehicleCreateRequest {
  registration: string;
  make?: string;
  model?: string;
  capacity_kg?: string;
  current_odometer_km?: string;
}

export interface MaintenanceRecord {
  id: string;
  maintenance_type: string;
  description: string;
  service_date: string;
  odometer_km: string;
  cost: string;
  performed_by: string | null;
  next_due_date: string | null;
  next_due_km: string | null;
}

export interface MaintenanceRecordCreateRequest {
  maintenance_type: "service" | "repair" | "inspection" | "tyres" | "other";
  description: string;
  service_date: string;
  odometer_km: string;
  cost?: string;
  performed_by?: string;
  next_due_date?: string;
  next_due_km?: string;
}

export interface FuelLog {
  id: string;
  driver_id: string | null;
  fuel_date: string;
  litres: string;
  cost: string;
  odometer_km: string;
  notes: string | null;
}

export interface FuelLogCreateRequest {
  driver_id?: string;
  fuel_date: string;
  litres: string;
  cost: string;
  odometer_km: string;
  notes?: string;
}

export interface VehicleDashboard {
  vehicle: Vehicle;
  active_shipment_count: number;
  recent_maintenance: MaintenanceRecord[];
  recent_fuel_efficiency: unknown[];
  service_due_soon: boolean;
}

export type ShipmentStatus =
  | "created"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "cancelled";

export interface TrackingEvent {
  id: string;
  event_type: string;
  location: string | null;
  notes: string | null;
  occurred_at: string;
}

export interface ProofOfDelivery {
  id: string;
  recipient_name: string;
  signature_storage_path: string | null;
  photo_storage_path: string | null;
  notes: string | null;
  delivered_at: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  customer_id: string;
  pickup_order_id: string | null;
  delivery_order_id: string | null;
  status: ShipmentStatus;
  origin_address: string;
  destination_address: string;
  distance_km: string | null;
  weight_kg: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  base_charge: string;
  distance_charge: string;
  weight_charge: string;
  total_charge: string;
  invoice_id: string | null;
  estimated_delivery: string | null;
  created_at: string;
  tracking_events: TrackingEvent[];
  proof_of_delivery: ProofOfDelivery | null;
}

export interface ShipmentSummary {
  id: string;
  tracking_number: string;
  customer_id: string;
  status: ShipmentStatus;
  total_charge: string;
  estimated_delivery: string | null;
}

export interface PaginatedShipments {
  items: ShipmentSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface ShipmentCreateRequest {
  customer_id: string;
  origin_address: string;
  destination_address: string;
  distance_km?: string;
  weight_kg?: string;
  driver_id?: string;
  vehicle_id?: string;
  estimated_delivery?: string;
}

export interface ShipmentStatusUpdateRequest {
  status: "picked_up" | "in_transit" | "out_for_delivery" | "exception" | "cancelled";
  location?: string;
  notes?: string;
}

export interface ProofOfDeliveryCreateRequest {
  recipient_name: string;
  signature_storage_path?: string;
  photo_storage_path?: string;
  notes?: string;
}

// --- AI ---

export interface OcrDocument {
  id: string;
  document_type: string;
  file_name: string;
  status: string;
  raw_text: string;
  extracted_data: Record<string, unknown>;
  confidence_score: string;
  created_at: string;
}

export interface OcrDocumentSummary {
  id: string;
  document_type: string;
  file_name: string;
  status: string;
  confidence_score: string;
  created_at: string;
}

export interface PaginatedOcrDocuments {
  items: OcrDocumentSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface AiSearchResult {
  type: string;
  id: string;
  label: string;
  subtitle: string | null;
}

export interface AiSearchResponse {
  query: string;
  results: AiSearchResult[];
}

export interface BusinessInsight {
  type: string;
  severity: string;
  message: string;
}

export interface CashFlowForecastWeek {
  week_start: string;
  week_end: string;
  expected_inflow: string;
  expected_outflow: string;
  projected_balance: string;
}

export interface CashFlowForecast {
  starting_balance: string;
  weeks: CashFlowForecastWeek[];
}

export interface DuplicateBillPair {
  bill_a_id: string;
  bill_a_number: string;
  bill_b_id: string;
  bill_b_number: string;
  supplier_id: string;
  amount_a: string;
  amount_b: string;
  days_apart: number;
  reason: string;
}

export interface DuplicateInvoicePair {
  invoice_a_id: string;
  invoice_a_number: string;
  invoice_b_id: string;
  invoice_b_number: string;
  customer_id: string;
  amount_a: string;
  amount_b: string;
  days_apart: number;
  reason: string;
}

export interface CategorizeExpenseResponse {
  description: string;
  suggested_category: string;
  confidence_percent: string;
}

export interface AssistantResponse {
  intent: string;
  answer: string;
  data: Record<string, unknown> | null;
}

// --- Security / Admin ---

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface RoleCreateRequest {
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string | null;
  created_at: string;
}

export interface PermissionCreateRequest {
  code: string;
  module: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  method: string;
  path: string;
  status_code: number;
  user_id: string | null;
  ip_address: string | null;
  duration_ms: number;
  event_type: string | null;
  details: string | null;
  created_at: string;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
}

export interface Backup {
  id: string;
  file_name: string;
  size_bytes: number;
  status: string;
  error_message: string | null;
  created_at: string;
  restored_at: string | null;
}

export interface PaginatedBackups {
  items: Backup[];
  total: number;
  page: number;
  page_size: number;
}

export interface RestoreRequest {
  confirm: boolean;
  target_dbname?: string;
}

export interface RestoreResult {
  backup: Backup;
  restored_into: string;
  restored_in_place: boolean;
}
