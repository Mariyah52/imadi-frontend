import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { createJournalEntry } from "../../api/accounting";
import { ApiError } from "../../api/client";
import type { JournalLineRequest } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { AccountSelect } from "./AccountSelect";
import { todayISO, formatMoney } from "../../lib/format";

function emptyLine(): JournalLineRequest {
  return { account_id: "", debit: "0", credit: "0", description: "" };
}

export function CreateJournalEntryPage() {
  const navigate = useNavigate();
  const [entryDate, setEntryDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<JournalLineRequest[]>([emptyLine(), emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateLine(index: number, patch: Partial<JournalLineRequest>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isBalanced) {
      setError("Total debits must equal total credits before this can be submitted.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const entry = await createJournalEntry({
        entry_date: entryDate,
        description,
        lines: lines.filter((l) => l.account_id),
      });
      navigate(`/accounting/journal-entries/${entry.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the journal entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/accounting/journal-entries" className="text-sm text-navy-800 hover:underline">
        ← Journal entries
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">New journal entry</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Entry date">
              <Input type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </Field>
            <Field label="Description">
              <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-muted">Lines</h2>
            <Button type="button" variant="ghost" onClick={() => setLines((prev) => [...prev, emptyLine()])}>
              Add line
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end border-b border-border pb-3 last:border-0">
                <div className="col-span-5">
                  <Field label={i === 0 ? "Account" : ""}>
                    <AccountSelect value={line.account_id} onChange={(id) => updateLine(i, { account_id: id })} />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label={i === 0 ? "Debit" : ""}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.debit}
                      onChange={(e) => updateLine(i, { debit: e.target.value, credit: "0" })}
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label={i === 0 ? "Credit" : ""}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.credit}
                      onChange={(e) => updateLine(i, { credit: e.target.value, debit: "0" })}
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label={i === 0 ? "Line description" : ""}>
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(i, { description: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-1 flex justify-end pb-2">
                  {lines.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="text-xs text-negative hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-6 text-sm">
            <span>
              <span className="text-ink-muted mr-1">Debits:</span>
              <span className="font-mono-data">{formatMoney(totalDebit)}</span>
            </span>
            <span>
              <span className="text-ink-muted mr-1">Credits:</span>
              <span className="font-mono-data">{formatMoney(totalCredit)}</span>
            </span>
            <span className={isBalanced ? "text-positive" : "text-negative"}>
              {isBalanced ? "Balanced" : "Not balanced"}
            </span>
          </div>
        </Card>

        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting || !isBalanced}>
            {submitting ? "Creating…" : "Create draft entry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
