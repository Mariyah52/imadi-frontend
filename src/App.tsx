import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Shell } from "./components/Shell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomersListPage } from "./pages/customers/CustomersListPage";
import { CustomerDetailPage } from "./pages/customers/CustomerDetailPage";
import { SuppliersListPage } from "./pages/suppliers/SuppliersListPage";
import { SupplierDetailPage } from "./pages/suppliers/SupplierDetailPage";
import { ProductsListPage } from "./pages/inventory/ProductsListPage";
import { ProductDetailPage } from "./pages/inventory/ProductDetailPage";
import { WarehousesPage } from "./pages/inventory/WarehousesPage";
import { InvoicesListPage } from "./pages/invoices/InvoicesListPage";
import { InvoiceDetailPage } from "./pages/invoices/InvoiceDetailPage";
import { CreateInvoicePage } from "./pages/invoices/CreateInvoicePage";
import { PurchaseOrdersListPage } from "./pages/purchasing/PurchaseOrdersListPage";
import { PurchaseOrderDetailPage } from "./pages/purchasing/PurchaseOrderDetailPage";
import { CreatePurchaseOrderPage } from "./pages/purchasing/CreatePurchaseOrderPage";
import { BillsListPage } from "./pages/purchasing/BillsListPage";
import { BillDetailPage } from "./pages/purchasing/BillDetailPage";
import { CreateBillPage } from "./pages/purchasing/CreateBillPage";
import { VatSummaryPage } from "./pages/vat/VatSummaryPage";
import { VatReturnsListPage } from "./pages/vat/VatReturnsListPage";
import { VatReturnDetailPage } from "./pages/vat/VatReturnDetailPage";
import { ReportsIndexPage } from "./pages/reports/ReportsIndexPage";
import { AgingReportPage } from "./pages/reports/AgingReportPage";
import { InventoryReportPage } from "./pages/reports/InventoryReportPage";
import { StockValuationReportPage } from "./pages/reports/StockValuationReportPage";
import { TrialBalanceReportPage } from "./pages/reports/TrialBalanceReportPage";
import { BalanceSheetReportPage } from "./pages/reports/BalanceSheetReportPage";
import { GeneralLedgerReportPage } from "./pages/reports/GeneralLedgerReportPage";
import { CashFlowReportPage } from "./pages/reports/CashFlowReportPage";
import { DriverPerformanceReportPage } from "./pages/reports/DriverPerformanceReportPage";
import { VehicleCostReportPage } from "./pages/reports/VehicleCostReportPage";
import { AccountingIndexPage } from "./pages/accounting/AccountingIndexPage";
import { ChartOfAccountsPage } from "./pages/accounting/ChartOfAccountsPage";
import { JournalEntriesListPage } from "./pages/accounting/JournalEntriesListPage";
import { CreateJournalEntryPage } from "./pages/accounting/CreateJournalEntryPage";
import { JournalEntryDetailPage } from "./pages/accounting/JournalEntryDetailPage";
import { BankAccountsListPage } from "./pages/banking/BankAccountsListPage";
import { BankAccountDetailPage } from "./pages/banking/BankAccountDetailPage";
import { CreateTransferPage } from "./pages/banking/CreateTransferPage";
import { ImportStatementPage } from "./pages/banking/ImportStatementPage";
import { StatementImportDetailPage } from "./pages/banking/StatementImportDetailPage";
import { LogisticsIndexPage } from "./pages/logistics/LogisticsIndexPage";
import { DriversListPage } from "./pages/logistics/DriversListPage";
import { DriverDetailPage } from "./pages/logistics/DriverDetailPage";
import { VehiclesListPage } from "./pages/logistics/VehiclesListPage";
import { VehicleDetailPage } from "./pages/logistics/VehicleDetailPage";
import { ShipmentsListPage } from "./pages/logistics/ShipmentsListPage";
import { ShipmentDetailPage } from "./pages/logistics/ShipmentDetailPage";
import { CreateShipmentPage } from "./pages/logistics/CreateShipmentPage";
import { AiIndexPage } from "./pages/ai/AiIndexPage";
import { AiSearchPage } from "./pages/ai/AiSearchPage";
import { BusinessInsightsPage } from "./pages/ai/BusinessInsightsPage";
import { CashFlowForecastPage } from "./pages/ai/CashFlowForecastPage";
import { DuplicatesPage } from "./pages/ai/DuplicatesPage";
import { ExpenseCategorizerPage } from "./pages/ai/ExpenseCategorizerPage";
import { AssistantPage } from "./pages/ai/AssistantPage";
import { OcrPage } from "./pages/ai/OcrPage";
import { SecurityIndexPage } from "./pages/security/SecurityIndexPage";
import { RolesPage } from "./pages/security/RolesPage";
import { UserRolesPage } from "./pages/security/UserRolesPage";
import { AuditLogsPage } from "./pages/security/AuditLogsPage";
import { BackupsPage } from "./pages/security/BackupsPage";

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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
        path="/reports/driver-performance"
        element={
          <ProtectedRoute>
            <DriverPerformanceReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/vehicle-cost"
        element={
          <ProtectedRoute>
            <VehicleCostReportPage />
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
  );
}
