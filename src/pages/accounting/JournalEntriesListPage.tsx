import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listJournalEntries } from "../../api/accounting";
import type { JournalEntrySummary } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";

const STATUSES = ["", "draft", "posted", "voided"];

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  posted: "bg-positive-bg text-positive",
  voided: "bg-negative-bg text-negative",
};

export function JournalEntriesListPage() {
  const { hasPermission } = useAuth();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<JournalEntrySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  function load() {
    setLoading(true);
    listJournalEntries(status || undefined, undefined, undefined, page, pageSize)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load journal entries."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, status]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <Link to="/accounting" className="text-sm text-navy-800 hover:underline">
        ← Accounting
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Journal entries</h1>
          <p className="text-sm text-ink-muted">{total} total</p>
        </div>
        {hasPermission("accounting:manage") && (
          <Link to="/accounting/journal-entries/new">
            <Button>New entry</Button>
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
            {s || "All"}
          </button>
        ))}
      </div>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No journal entries match.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Entry</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3 font-mono-data text-xs">
                    <Link to={`/accounting/journal-entries/${e.id}`} className="text-navy-800 hover:underline">
                      {e.entry_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{e.entry_date}</td>
                  <td className="px-5 py-3">{e.description}</td>
                  <td className="px-5 py-3 text-ink-muted capitalize">{e.reference_type ?? "manual"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[e.status] ?? "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {e.status}
                    </span>
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
    </div>
  );
}
