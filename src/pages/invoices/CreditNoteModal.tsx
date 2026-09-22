import { useState, type FormEvent } from "react";
import { applyCreditNote } from "../../api/invoices";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { useModalHotkeys } from "../../lib/useModalHotkeys";
import { Field, Input } from "../../components/ui/Field";
import { Textarea } from "../../components/ui/Textarea";
import { Card } from "../../components/ui/Card";
import { todayISO } from "../../lib/format";

export function CreditNoteModal({
  invoiceId,
  balance,
  onClose,
  onApplied,
}: {
  invoiceId: string;
  balance: string;
  onClose: () => void;
  onApplied: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [creditDate, setCreditDate] = useState(todayISO());
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await applyCreditNote(invoiceId, {
        amount,
        credit_date: creditDate,
        reason: reason || undefined,
      });
      onApplied();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't apply credit note.");
    } finally {
      setSubmitting(false);
    }
  }

  const formRef = useModalHotkeys(onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Add credit note</h2>
        <p className="text-xs text-ink-muted mb-4">
          Remaining balance: {balance}. This credit note will reduce the amount still owed.
        </p>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Credit amount">
            <Input
              type="number"
              min={0}
              step="0.01"
              max={balance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Credit date">
            <Input
              type="date"
              required
              value={creditDate}
              onChange={(e) => setCreditDate(e.target.value)}
            />
          </Field>
          <Field label="Reason (optional)">
            <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} shortcutHint="Esc">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} shortcutHint="Ctrl Enter">
              {submitting ? "Applying…" : "Apply credit note"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
