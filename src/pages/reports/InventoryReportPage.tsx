import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getInventoryReport } from "../../api/reports";
import type { InventoryReport } from "../../api/reports";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";

export function InventoryReportPage() {
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInventoryReport()
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the report."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link to="/reports" className="text-sm text-navy-800 hover:underline">
        ← Reports
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Inventory report</h1>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <Card className="p-5">
              <span className="text-sm text-ink-muted">Products</span>
              <div className="mt-1 font-display text-xl font-semibold">{report.product_count}</div>
            </Card>
            <Card className="p-5">
              <span className="text-sm text-ink-muted">Total stock value</span>
              <div className="mt-1 font-display text-xl font-semibold">
                {formatMoney(report.total_stock_value)}
              </div>
            </Card>
            <Card className="p-5">
              <span className="text-sm text-ink-muted">Low stock</span>
              <div className="mt-1 font-display text-xl font-semibold text-negative">
                {report.low_stock_count}
              </div>
            </Card>
          </div>
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium text-right">Qty on hand</th>
                  <th className="px-5 py-3 font-medium text-right">Cost price</th>
                  <th className="px-5 py-3 font-medium text-right">Stock value</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.products.map((p) => (
                  <tr key={p.product_id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-mono-data text-xs">{p.sku}</td>
                    <td className="px-5 py-3">{p.name}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{p.quantity_on_hand}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(p.cost_price)}</td>
                    <td className="px-5 py-3 text-right font-mono-data">{formatMoney(p.stock_value)}</td>
                    <td className="px-5 py-3">
                      {p.is_low_stock && (
                        <span className="rounded-full bg-negative-bg px-2 py-0.5 text-xs text-negative">
                          Low stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
