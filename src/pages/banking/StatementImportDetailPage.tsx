import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import {
  autoMatchStatement,
  completeReconciliation,
  createAndMatchLine,
  getStatementImport,
  ignoreLine,
  listBankTransactions,
  manualMatchLine,
  startReconciliation,
  unmatchLine,
} from "../../api/banking";
import type { BankTransaction, Reconciliation, StatementImport } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  unmatched: "bg-negative-bg text-negative",
  matched: "bg-positive-bg text-positive",
  ignored: "bg-navy-100 text-ink-muted",
};

export function StatementImportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const canReconcile = hasPermission("banking:reconcile");

  const [statement, setStatement] = useState<StatementImport | null>(null);
  const [unreconciledTxns, setUnreconciledTxns] = useState<BankTransaction[]>([]);
  const [reconciliation, setReconciliation] = useState<Reconciliation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Record<string, string>>({});

  function load() {
    if (!id) return;
    getStatementImport(id)
      .then((s) => {
        setStatement(s);
        return listBankTransactions(s.bank_account_id, false);
      })
      .then(setUnreconciledTxns)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this statement import."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleAutoMatch() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await autoMatchStatement(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't auto-match.");
    } finally {
      setBusy(false);
    }
  }

  async function handleManualMatch(lineId: string) {
    const txnId = selectedTxn[lineId];
    if (!txnId) return;
    setBusy(true);
    setActionError(null);
    try {
      await manualMatchLine(lineId, txnId);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't match this line.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnmatch(lineId: string) {
    setBusy(true);
    setActionError(null);
    try {
      await unmatchLine(lineId);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't unmatch this line.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateAndMatch(lineId: string) {
    setBusy(true);
    setActionError(null);
    try {
      await createAndMatchLine(lineId);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't create a transaction for this line.");
    } finally {
      setBusy(false);
    }
  }

  async function handleIgnore(lineId: string) {
    setBusy(true);
    setActionError(null);
    try {
      await ignoreLine(lineId);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't ignore this line.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStartReconciliation() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      const recon = await startReconciliation(id);
      setReconciliation(recon);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't start reconciliation.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCompleteReconciliation() {
    if (!reconciliation) return;
    setBusy(true);
    setActionError(null);
    try {
      const recon = await completeReconciliation(reconciliation.id);
      setReconciliation(recon);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't complete reconciliation.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!statement || !id) return null;

  return (
    <div>
      <Link to={`/banking/accounts/${statement.bank_account_id}`} className="text-sm text-navy-800 hover:underline">
        ← Account
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="font-display text-xl font-semibold text-ink">{statement.file_name}</h1>
        <p className="text-sm text-ink-muted mt-1">
          {statement.statement_start_date} → {statement.statement_end_date} · Opening{" "}
          {formatMoney(statement.opening_balance)} · Closing {formatMoney(statement.closing_balance)}
        </p>
        <p className="text-sm text-ink-muted mt-1">
          {statement.matched_count} matched · {statement.unmatched_count} unmatched
        </p>
      </div>

      {actionError && <p className="mb-4 text-sm text-negative">{actionError}</p>}

      {canReconcile && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button disabled={busy} onClick={handleAutoMatch}>
            Auto-match
          </Button>
          {!reconciliation && (
            <Button variant="secondary" disabled={busy} onClick={handleStartReconciliation}>
              Start reconciliation
            </Button>
          )}
          {reconciliation && reconciliation.status !== "completed" && (
            <Button variant="secondary" disabled={busy} onClick={handleCompleteReconciliation}>
              Complete reconciliation
            </Button>
          )}
        </div>
      )}

      {reconciliation && (
        <Card className="p-5 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <span className="text-ink-muted">Status</span>
              <div className="font-medium capitalize">{reconciliation.status}</div>
            </div>
            <div>
              <span className="text-ink-muted">Book balance at start</span>
              <div className="font-mono-data">{formatMoney(reconciliation.book_balance_at_start)}</div>
            </div>
            <div>
              <span className="text-ink-muted">Statement closing</span>
              <div className="font-mono-data">
                {formatMoney(reconciliation.statement_closing_balance)}
              </div>
            </div>
            <div>
              <span className="text-ink-muted">Difference</span>
              <div
                className={`font-mono-data ${
                  reconciliation.difference && Number(reconciliation.difference) !== 0
                    ? "text-negative"
                    : "text-positive"
                }`}
              >
                {reconciliation.difference ? formatMoney(reconciliation.difference) : "—"}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium text-right">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {statement.lines.map((line) => (
              <tr key={line.id} className="border-b border-border last:border-0 align-top">
                <td className="px-5 py-3 text-ink-muted">{line.line_date}</td>
                <td className="px-5 py-3">{line.description}</td>
                <td className="px-5 py-3 text-right font-mono-data">{formatMoney(line.amount)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_TONE[line.status] ?? "bg-navy-100 text-ink-muted"
                    }`}
                  >
                    {line.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {!canReconcile ? (
                    <span className="text-xs text-ink-muted">—</span>
                  ) : line.status === "matched" ? (
                    <button
                      onClick={() => handleUnmatch(line.id)}
                      disabled={busy}
                      className="text-xs text-negative hover:underline"
                    >
                      Unmatch
                    </button>
                  ) : line.status === "unmatched" ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <select
                          value={selectedTxn[line.id] ?? ""}
                          onChange={(e) =>
                            setSelectedTxn((prev) => ({ ...prev, [line.id]: e.target.value }))
                          }
                          className="rounded-md border border-border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Match to…</option>
                          {unreconciledTxns.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.transaction_date} · {t.description} · {formatMoney(t.amount)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleManualMatch(line.id)}
                          disabled={busy || !selectedTxn[line.id]}
                          className="text-xs text-navy-800 hover:underline disabled:text-ink-muted"
                        >
                          Match
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateAndMatch(line.id)}
                          disabled={busy}
                          className="text-xs text-navy-800 hover:underline"
                        >
                          Create transaction
                        </button>
                        <button
                          onClick={() => handleIgnore(line.id)}
                          disabled={busy}
                          className="text-xs text-ink-muted hover:underline"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
