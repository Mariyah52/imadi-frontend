import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listInvoices } from "../../api/invoices";
import { listCustomers } from "../../api/customers";
import type { Customer, InvoiceSummary } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";
import { useAuth } from "../../auth/AuthContext";

const STATUSES = ["", "draft", "posted", "partially_paid", "paid", "overdue", "cancelled"];

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  posted: "bg-amber-100 text-amber-600",
  partially_paid: "bg-amber-100 text-amber-600",
  paid: "bg-positive-bg text-positive",
  overdue: "bg-negative-bg text-negative",
  cancelled: "bg-navy-100 text-ink-muted",
};

export function InvoicesListPage() {
  const { hasPermission } = useAuth();
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InvoiceSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    listCustomers("", 1, 100).then((res) => setCustomers(res.items)).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    listInvoices(customerId || undefined, status || undefined, page, pageSize)
      .then((res) => {
        setItems(
          res.items.slice().sort((a, b) => b.invoice_number.localeCompare(a.invoice_number)),
        );
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load invoices."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, status, customerId]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Invoices</h1>
          <p className="text-sm text-ink-muted">{total} total</p>
        </div>
        {hasPermission("invoices:create") && (
          <Link to="/invoices/new">
            <Button>New invoice</Button>
          </Link>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
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
        <select
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink"
        >
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No invoices match.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Issued</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3 font-mono-data text-xs">
                    <Link to={`/invoices/${inv.id}`} className="text-navy-800 hover:underline">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink">{inv.customer_name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[inv.effective_status] ?? "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {inv.effective_status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{inv.issue_date}</td>
                  <td className="px-5 py-3 text-ink-muted">{inv.due_date}</td>
                  <td className="px-5 py-3 text-right font-mono-data">{formatMoney(inv.total)}</td>
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
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
