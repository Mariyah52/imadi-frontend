import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listShipments } from "../../api/logistics";
import type { ShipmentSummary } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";
import { useAuth } from "../../auth/AuthContext";

const STATUSES = [
  "",
  "created",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "exception",
  "cancelled",
];

const STATUS_TONE: Record<string, string> = {
  created: "bg-navy-100 text-ink-muted",
  picked_up: "bg-amber-100 text-amber-600",
  in_transit: "bg-amber-100 text-amber-600",
  out_for_delivery: "bg-amber-100 text-amber-600",
  delivered: "bg-positive-bg text-positive",
  exception: "bg-negative-bg text-negative",
  cancelled: "bg-navy-100 text-ink-muted",
};

export function ShipmentsListPage() {
  const { hasPermission } = useAuth();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ShipmentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  function load() {
    setLoading(true);
    listShipments(undefined, status || undefined, page, pageSize)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load shipments."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, status]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Shipments</h1>
          <p className="text-sm text-ink-muted">{total} total</p>
        </div>
        {hasPermission("logistics:create") && (
          <Link to="/logistics/shipments/new">
            <Button>New shipment</Button>
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
          <p className="p-6 text-sm text-ink-muted">No shipments match.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Tracking #</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Estimated delivery</th>
                <th className="px-5 py-3 font-medium text-right">Charge</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3 font-mono-data text-xs">
                    <Link to={`/logistics/shipments/${s.id}`} className="text-navy-800 hover:underline">
                      {s.tracking_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[s.status] ?? "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">
                    {s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleString("en-GB") : "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">{formatMoney(s.total_charge)}</td>
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
