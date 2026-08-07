import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listVatReturns } from "../../api/vat";
import type { VatReturnSummary } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";
import { CreateVatReturnModal } from "./CreateVatReturnModal";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  submitted: "bg-positive-bg text-positive",
};

export function VatReturnsListPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<VatReturnSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 20;

  function load() {
    setLoading(true);
    listVatReturns(page, pageSize)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load VAT returns."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <Link to="/vat" className="text-sm text-navy-800 hover:underline">
        ← VAT summary
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">VAT returns</h1>
          <p className="text-sm text-ink-muted">{total} total</p>
        </div>
        {hasPermission("vat:manage") && <Button onClick={() => setShowCreate(true)}>New return</Button>}
      </div>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No VAT returns yet.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Period</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Net VAT due</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3">
                    <Link to={`/vat/returns/${r.id}`} className="text-navy-800 hover:underline">
                      {r.period_start} → {r.period_end}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[r.status] ?? "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(r.box5_net_vat_due)}
                  </td>
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

      {showCreate && (
        <CreateVatReturnModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => navigate(`/vat/returns/${id}`)}
        />
      )}
    </div>
  );
}
