import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listAuditLogs } from "../../api/security";
import type { AuditLog } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";

const STATUS_TONE = (status: number) => {
  if (status >= 500) return "bg-negative-bg text-negative";
  if (status >= 400) return "bg-amber-100 text-amber-600";
  return "bg-positive-bg text-positive";
};

export function AuditLogsPage() {
  const [userId, setUserId] = useState("");
  const [method, setMethod] = useState("");
  const [pathContains, setPathContains] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 25;

  function load() {
    setLoading(true);
    listAuditLogs(userId || undefined, method || undefined, pathContains || undefined, page, pageSize)
      .then((res) => {
        setLogs(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load audit logs."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <Link to="/security" className="text-sm text-navy-800 hover:underline">
        ← Admin
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Audit logs</h1>

      <form onSubmit={handleFilterSubmit} className="mb-4 flex gap-2 flex-wrap">
        <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="max-w-[220px]" />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Any method</option>
          {["GET", "POST", "PATCH", "DELETE"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <Input
          placeholder="Path contains…"
          value={pathContains}
          onChange={(e) => setPathContains(e.target.value)}
          className="max-w-[220px]"
        />
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}
        {!loading && !error && logs.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No matching log entries.</p>
        )}
        {!loading && !error && logs.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Path</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-ink-muted whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-5 py-3 font-mono-data text-xs">{log.method}</td>
                  <td className="px-5 py-3 font-mono-data text-xs">{log.path}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE(log.status_code)}`}>
                      {log.status_code}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">{log.duration_ms}ms</td>
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
