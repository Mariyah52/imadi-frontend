import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

const REPORTS = [
  { to: "/reports/aging?type=customer", label: "Customer aging", desc: "AR aging buckets per customer" },
  { to: "/reports/aging?type=supplier", label: "Supplier aging", desc: "AP aging buckets per supplier" },
  { to: "/reports/inventory", label: "Inventory report", desc: "Stock levels and value by product" },
  { to: "/reports/stock-valuation", label: "Stock valuation", desc: "Inventory value by batch/warehouse" },
  { to: "/reports/trial-balance", label: "Trial balance", desc: "Debit/credit balances by account" },
  { to: "/reports/balance-sheet", label: "Balance sheet", desc: "Assets, liabilities, and equity" },
  { to: "/reports/cash-flow", label: "Cash flow", desc: "Movement across nominated cash/bank accounts" },
  { to: "/reports/general-ledger", label: "General ledger", desc: "Line-by-line activity for one account" },
  { to: "/reports/driver-performance", label: "Driver performance", desc: "Shipment delivery and on-time rate" },
  { to: "/reports/vehicle-cost", label: "Vehicle cost", desc: "Fuel and maintenance cost per vehicle" },
];

export function ReportsIndexPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-1">Reports</h1>
      <p className="text-sm text-ink-muted mb-6">
        Sales, purchases, and profit reports also feed the dashboard — see there for those. This
        page covers the rest.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <Link key={r.to} to={r.to}>
            <Card className="p-4 hover:bg-navy-50 transition-colors">
              <div className="font-medium text-ink">{r.label}</div>
              <div className="text-xs text-ink-muted mt-1">{r.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
