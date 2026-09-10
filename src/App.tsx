import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Shell } from "./components/Shell";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const CustomersListPage = lazy(() => import("./pages/customers/CustomersListPage").then((m) => ({ default: m.CustomersListPage })));
const CustomerDetailPage = lazy(() => import("./pages/customers/CustomerDetailPage").then((m) => ({ default: m.CustomerDetailPage })));
const SuppliersListPage = lazy(() => import("./pages/suppliers/SuppliersListPage").then((m) => ({ default: m.SuppliersListPage })));
const SupplierDetailPage = lazy(() => import("./pages/suppliers/SupplierDetailPage").then((m) => ({ default: m.SupplierDetailPage })));
const ProductsListPage = lazy(() => import("./pages/inventory/ProductsListPage").then((m) => ({ default: m.ProductsListPage })));
const ProductDetailPage = lazy(() => import("./pages/inventory/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const WarehousesPage = lazy(() => import("./pages/inventory/WarehousesPage").then((m) => ({ default: m.WarehousesPage })));
const InvoicesListPage = lazy(() => import("./pages/invoices/InvoicesListPage").then((m) => ({ default: m.InvoicesListPage })));
const InvoiceDetailPage = lazy(() => import("./pages/invoices/InvoiceDetailPage").then((m) => ({ default: m.InvoiceDetailPage })));
const CreateInvoicePage = lazy(() => import("./pages/invoices/CreateInvoicePage").then((m) => ({ default: m.CreateInvoicePage })));
const EditInvoicePage = lazy(() => import("./pages/invoices/EditInvoicePage").then((m) => ({ default: m.EditInvoicePage })));
const PurchaseOrdersListPage = lazy(() => import("./pages/purchasing/PurchaseOrdersListPage").then((m) => ({ default: m.PurchaseOrdersListPage })));
const PurchaseOrderDetailPage = lazy(() => import("./pages/purchasing/PurchaseOrderDetailPage").then((m) => ({ default: m.PurchaseOrderDetailPage })));
const CreatePurchaseOrderPage = lazy(() => import("./pages/purchasing/CreatePurchaseOrderPage").then((m) => ({ default: m.CreatePurchaseOrderPage })));
const BillsListPage = lazy(() => import("./pages/purchasing/BillsListPage").then((m) => ({ default: m.BillsListPage })));
const BillDetailPage = lazy(() => import("./pages/purchasing/BillDetailPage").then((m) => ({ default: m.BillDetailPage })));
const CreateBillPage = lazy(() => import("./pages/purchasing/CreateBillPage").then((m) => ({ default: m.CreateBillPage })));
const VatSummaryPage = lazy(() => import("./pages/vat/VatSummaryPage").then((m) => ({ default: m.VatSummaryPage })));
const VatReturnsListPage = lazy(() => import("./pages/vat/VatReturnsListPage").then((m) => ({ default: m.VatReturnsListPage })));
const VatReturnDetailPage = lazy(() => import("./pages/vat/VatReturnDetailPage").then((m) => ({ default: m.VatReturnDetailPage })));
const ReportsIndexPage = lazy(() => import("./pages/reports/ReportsIndexPage").then((m) => ({ default: m.ReportsIndexPage })));
const AgingReportPage = lazy(() => import("./pages/reports/AgingReportPage").then((m) => ({ default: m.AgingReportPage })));
const InventoryReportPage = lazy(() => import("./pages/reports/InventoryReportPage").then((m) => ({ default: m.InventoryReportPage })));
const StockValuationReportPage = lazy(() => import("./pages/reports/StockValuationReportPage").then((m) => ({ default: m.StockValuationReportPage })));
const TrialBalanceReportPage = lazy(() => import("./pages/reports/TrialBalanceReportPage").then((m) => ({ default: m.TrialBalanceReportPage })));
const CustomerLedgerReportPage = lazy(() => import("./pages/reports/CustomerLedgerReportPage").then((m) => ({ default: m.CustomerLedgerReportPage })));
const BalanceSheetReportPage = lazy(() => import("./pages/reports/BalanceSheetReportPage").then((m) => ({ default: m.BalanceSheetReportPage })));
const GeneralLedgerReportPage = lazy(() => import("./pages/reports/GeneralLedgerReportPage").then((m) => ({ default: m.GeneralLedgerReportPage })));
const CashFlowReportPage = lazy(() => import("./pages/reports/CashFlowReportPage").then((m) => ({ default: m.CashFlowReportPage })));
const AccountingIndexPage = lazy(() => import("./pages/accounting/AccountingIndexPage").then((m) => ({ default: m.AccountingIndexPage })));
const ChartOfAccountsPage = lazy(() => import("./pages/accounting/ChartOfAccountsPage").then((m) => ({ default: m.ChartOfAccountsPage })));
const JournalEntriesListPage = lazy(() => import("./pages/accounting/JournalEntriesListPage").then((m) => ({ default: m.JournalEntriesListPage })));
const CreateJournalEntryPage = lazy(() => import("./pages/accounting/CreateJournalEntryPage").then((m) => ({ default: m.CreateJournalEntryPage })));
const JournalEntryDetailPage = lazy(() => import("./pages/accounting/JournalEntryDetailPage").then((m) => ({ default: m.JournalEntryDetailPage })));
const BankAccountsListPage = lazy(() => import("./pages/banking/BankAccountsListPage").then((m) => ({ default: m.BankAccountsListPage })));
const BankAccountDetailPage = lazy(() => import("./pages/banking/BankAccountDetailPage").then((m) => ({ default: m.BankAccountDetailPage })));
const CreateTransferPage = lazy(() => import("./pages/banking/CreateTransferPage").then((m) => ({ default: m.CreateTransferPage })));
const ImportStatementPage = lazy(() => import("./pages/banking/ImportStatementPage").then((m) => ({ default: m.ImportStatementPage })));
const StatementImportDetailPage = lazy(() => import("./pages/banking/StatementImportDetailPage").then((m) => ({ default: m.StatementImportDetailPage })));
const LogisticsIndexPage = lazy(() => import("./pages/logistics/LogisticsIndexPage").then((m) => ({ default: m.LogisticsIndexPage })));
const DriversListPage = lazy(() => import("./pages/logistics/DriversListPage").then((m) => ({ default: m.DriversListPage })));
const DriverDetailPage = lazy(() => import("./pages/logistics/DriverDetailPage").then((m) => ({ default: m.DriverDetailPage })));
const VehiclesListPage = lazy(() => import("./pages/logistics/VehiclesListPage").then((m) => ({ default: m.VehiclesListPage })));
const VehicleDetailPage = lazy(() => import("./pages/logistics/VehicleDetailPage").then((m) => ({ default: m.VehicleDetailPage })));
const ShipmentsListPage = lazy(() => import("./pages/logistics/ShipmentsListPage").then((m) => ({ default: m.ShipmentsListPage })));
const ShipmentDetailPage = lazy(() => import("./pages/logistics/ShipmentDetailPage").then((m) => ({ default: m.ShipmentDetailPage })));
const CreateShipmentPage = lazy(() => import("./pages/logistics/CreateShipmentPage").then((m) => ({ default: m.CreateShipmentPage })));
const AiIndexPage = lazy(() => import("./pages/ai/AiIndexPage").then((m) => ({ default: m.AiIndexPage })));
const AiSearchPage = lazy(() => import("./pages/ai/AiSearchPage").then((m) => ({ default: m.AiSearchPage })));
const BusinessInsightsPage = lazy(() => import("./pages/ai/BusinessInsightsPage").then((m) => ({ default: m.BusinessInsightsPage })));
const CashFlowForecastPage = lazy(() => import("./pages/ai/CashFlowForecastPage").then((m) => ({ default: m.CashFlowForecastPage })));
const DuplicatesPage = lazy(() => import("./pages/ai/DuplicatesPage").then((m) => ({ default: m.DuplicatesPage })));
const ExpenseCategorizerPage = lazy(() => import("./pages/ai/ExpenseCategorizerPage").then((m) => ({ default: m.ExpenseCategorizerPage })));
const AssistantPage = lazy(() => import("./pages/ai/AssistantPage").then((m) => ({ default: m.AssistantPage })));
const OcrPage = lazy(() => import("./pages/ai/OcrPage").then((m) => ({ default: m.OcrPage })));
const SecurityIndexPage = lazy(() => import("./pages/security/SecurityIndexPage").then((m) => ({ default: m.SecurityIndexPage })));
const RolesPage = lazy(() => import("./pages/security/RolesPage").then((m) => ({ default: m.RolesPage })));
const UserRolesPage = lazy(() => import("./pages/security/UserRolesPage").then((m) => ({ default: m.UserRolesPage })));
const AuditLogsPage = lazy(() => import("./pages/security/AuditLogsPage").then((m) => ({ default: m.AuditLogsPage })));
const BackupsPage = lazy(() => import("./pages/security/BackupsPage").then((m) => ({ default: m.BackupsPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  return <Shell>{children}</Shell>;
}

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-sm text-ink-muted">Loading…</div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomersListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <SuppliersListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers/:id"
        element={
          <ProtectedRoute>
            <SupplierDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <ProductsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/warehouses"
        element={
          <ProtectedRoute>
            <WarehousesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/:id"
        element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <InvoicesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/new"
        element={
          <ProtectedRoute>
            <CreateInvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id/edit"
        element={
          <ProtectedRoute>
            <EditInvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <InvoiceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/orders"
        element={
          <ProtectedRoute>
            <PurchaseOrdersListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/orders/new"
        element={
          <ProtectedRoute>
            <CreatePurchaseOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/orders/:id"
        element={
          <ProtectedRoute>
            <PurchaseOrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/bills"
        element={
          <ProtectedRoute>
            <BillsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/bills/new"
        element={
          <ProtectedRoute>
            <CreateBillPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/bills/:id"
        element={
          <ProtectedRoute>
            <BillDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vat"
        element={
          <ProtectedRoute>
            <VatSummaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vat/returns"
        element={
          <ProtectedRoute>
            <VatReturnsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vat/returns/:id"
        element={
          <ProtectedRoute>
            <VatReturnDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsIndexPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/aging"
        element={
          <ProtectedRoute>
            <AgingReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/inventory"
        element={
          <ProtectedRoute>
            <InventoryReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/stock-valuation"
        element={
          <ProtectedRoute>
            <StockValuationReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/trial-balance"
        element={
          <ProtectedRoute>
            <TrialBalanceReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/customer-ledger"
        element={
          <ProtectedRoute>
            <CustomerLedgerReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/balance-sheet"
        element={
          <ProtectedRoute>
            <BalanceSheetReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/general-ledger"
        element={
          <ProtectedRoute>
            <GeneralLedgerReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/cash-flow"
        element={
          <ProtectedRoute>
            <CashFlowReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounting"
        element={
          <ProtectedRoute>
            <AccountingIndexPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounting/accounts"
        element={
          <ProtectedRoute>
            <ChartOfAccountsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounting/journal-entries"
        element={
          <ProtectedRoute>
            <JournalEntriesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounting/journal-entries/new"
        element={
          <ProtectedRoute>
            <CreateJournalEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounting/journal-entries/:id"
        element={
          <ProtectedRoute>
            <JournalEntryDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banking"
        element={
          <ProtectedRoute>
            <BankAccountsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banking/transfers/new"
        element={
          <ProtectedRoute>
            <CreateTransferPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banking/accounts/:id"
        element={
          <ProtectedRoute>
            <BankAccountDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banking/accounts/:id/import"
        element={
          <ProtectedRoute>
            <ImportStatementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banking/statement-imports/:id"
        element={
          <ProtectedRoute>
            <StatementImportDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics"
        element={
          <ProtectedRoute>
            <LogisticsIndexPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/drivers"
        element={
          <ProtectedRoute>
            <DriversListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/drivers/:id"
        element={
          <ProtectedRoute>
            <DriverDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/vehicles"
        element={
          <ProtectedRoute>
            <VehiclesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/vehicles/:id"
        element={
          <ProtectedRoute>
            <VehicleDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/shipments"
        element={
          <ProtectedRoute>
            <ShipmentsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/shipments/new"
        element={
          <ProtectedRoute>
            <CreateShipmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/shipments/:id"
        element={
          <ProtectedRoute>
            <ShipmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <AiIndexPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/search"
        element={
          <ProtectedRoute>
            <AiSearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/insights"
        element={
          <ProtectedRoute>
            <BusinessInsightsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/cash-flow-forecast"
        element={
          <ProtectedRoute>
            <CashFlowForecastPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/duplicates"
        element={
          <ProtectedRoute>
            <DuplicatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/categorize-expense"
        element={
          <ProtectedRoute>
            <ExpenseCategorizerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/assistant"
        element={
          <ProtectedRoute>
            <AssistantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/ocr"
        element={
          <ProtectedRoute>
            <OcrPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <SecurityIndexPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/roles"
        element={
          <ProtectedRoute>
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/user-roles"
        element={
          <ProtectedRoute>
            <UserRolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/audit-logs"
        element={
          <ProtectedRoute>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/backups"
        element={
          <ProtectedRoute>
            <BackupsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
