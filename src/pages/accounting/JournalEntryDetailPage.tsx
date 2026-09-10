import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import {
  deleteDraftJournalEntry,
  getJournalEntry,
  listAccounts,
  postJournalEntry,
  voidJournalEntry,
} from "../../api/accounting";
import type { Account, JournalEntry } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-navy-100 text-ink-muted",
  posted: "bg-positive-bg text-positive",
  voided: "bg-negative-bg text-negative",
};

export function JournalEntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showVoidReason, setShowVoidReason] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  function load() {
    if (!id) return;
    Promise.all([getJournalEntry(id), listAccounts(undefined, false)])
      .then(([e, accts]) => {
        setEntry(e);
        setAccounts(accts);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this journal entry."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  const accountLabel = (accountId: string) => {
    const a = accounts.find((acc) => acc.id === accountId);
    return a ? `${a.account_code} — ${a.name}` : accountId;
  };

  async function handlePost() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await postJournalEntry(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't post this entry.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteDraft() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await deleteDraftJournalEntry(id);
      navigate("/accounting/journal-entries");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't delete this draft.");
      setBusy(false);
    }
  }

  async function handleVoid() {
    if (!id || !voidReason.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      const reversal = await voidJournalEntry(id, voidReason.trim());
      navigate(`/accounting/journal-entries/${reversal.id}`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't void this entry.");
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!entry || !id) return null;

  const totalDebit = entry.lines.reduce((s, l) => s + Number(l.debit), 0);
  const totalCredit = entry.lines.reduce((s, l) => s + Number(l.credit), 0);
  const canManage = hasPermission("accounting:manage");

  return (
    <div>
      <Link to="/accounting/journal-entries" className="text-sm text-navy-800 hover:underline">
        ← Journal entries
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink font-mono-data">
            {entry.entry_number}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {entry.entry_date} · {entry.description}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            STATUS_TONE[entry.status] ?? "bg-navy-100 text-ink-muted"
          }`}
        >
          {entry.status}
        </span>
      </div>

      {actionError && <p className="mb-4 text-sm text-negative">{actionError}</p>}
      {entry.reversed_entry_id && (
        <p className="mb-4 text-sm text-ink-muted">
          This is a reversal of entry <span className="font-mono-data">{entry.reversed_entry_id}</span>.
        </p>
      )}

      {canManage && (
        <div className="mb-6 flex flex-wrap gap-2">
          {entry.status === "draft" && (
            <>
              <Button disabled={busy} onClick={handlePost}>
                Post entry
              </Button>
              <Button variant="secondary" disabled={busy} onClick={handleDeleteDraft}>
                Delete draft
              </Button>
            </>
          )}
          {entry.status === "posted" && (
            <Button variant="secondary" disabled={busy} onClick={() => setShowVoidReason(true)}>
              Void (reversing entry)
            </Button>
          )}
        </div>
      )}

      {showVoidReason && (
        <Card className="p-4 mb-6 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Reason for voiding</label>
            <input
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={() => setShowVoidReason(false)}>
            Back
          </Button>
          <Button disabled={busy || !voidReason.trim()} onClick={handleVoid}>
            Confirm void
          </Button>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Account</th>
              <th className="px-5 py-3 font-medium">Line description</th>
              <th className="px-5 py-3 font-medium text-right">Debit</th>
              <th className="px-5 py-3 font-medium text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {entry.lines.map((line) => (
              <tr key={line.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">{accountLabel(line.account_id)}</td>
                <td className="px-5 py-3 text-ink-muted">{line.description ?? "—"}</td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {Number(line.debit) > 0 ? formatMoney(line.debit) : "—"}
                </td>
                <td className="px-5 py-3 text-right font-mono-data">
                  {Number(line.credit) > 0 ? formatMoney(line.credit) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border font-medium">
              <td className="px-5 py-3" colSpan={2}>
                Total
              </td>
              <td className="px-5 py-3 text-right font-mono-data">{formatMoney(totalDebit)}</td>
              <td className="px-5 py-3 text-right font-mono-data">{formatMoney(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
}
