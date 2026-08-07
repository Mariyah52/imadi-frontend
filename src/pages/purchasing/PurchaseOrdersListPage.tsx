import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listPurchaseOrders } from "../../api/purchasing";
import type { PurchaseOrderSummary } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";
import { useAuth } from "../../auth/AuthContext";

const STATUSES = ["", "draft", "submitted", "approved", "rejected", "partially_received", "received"];

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  submitted: "bg-amber-100 text-amber-600",
  approved: "bg-positive-bg text-positive",
  rejected: "bg-negative-bg text-negative",
  partially_received: "bg-amber-100 text-amber-600",
  received: "bg-positive-bg text-positive",
};

export function PurchaseOrdersListPage() {
  const { hasPermission } = useAuth();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PurchaseOrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  function load() {
    setLoading(true);
    listPurchaseOrders(undefined, status || undefined, page, pageSize)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load purchase orders."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, status]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Purchase orders</h1>
          <p className="text-sm text-ink-muted">{total} total</p>
        </div>
        {hasPermission("purchasing:create") && (
          <Link to="/purchasing/orders/new">
            <Button>New purchase order</Button>
          </Link>
        )}
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              status === s ? "bg-navy-800 text-white" : "bg-navy-100 text-ink-muted hover:bg-navy-100/70"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No purchase orders match.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">PO</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ordered</th>
                <th className="px-5 py-3 font-medium">Expected</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((po) => (
                <tr key={po.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3 font-mono-data text-xs">
                    <Link to={`/purchasing/orders/${po.id}`} className="text-navy-800 hover:underline">
                      {po.po_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[po.status] ?? "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {po.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{po.order_date}</td>
                  <td className="px-5 py-3 text-ink-muted">{po.expected_date ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono-data">{formatMoney(po.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
