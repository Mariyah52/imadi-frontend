import { useState, type FormEvent } from "react";
import { recordInvoicePayment } from "../../api/invoices";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { todayISO } from "../../lib/format";

export function RecordPaymentModal({
  invoiceId,
  balance,
  onClose,
  onRecorded,
}: {
  invoiceId: string;
  balance: string;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const [amount, setAmount] = useState(balance);
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await recordInvoicePayment(invoiceId, {
        amount,
        payment_date: paymentDate,
        method,
        reference: reference || undefined,
      });
      onRecorded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't record payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Record payment</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Amount">
            <Input
              type="number"
              min={0}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Payment date">
            <Input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </Field>
          <Field label="Method">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </Field>
          <Field label="Reference">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Recording…" : "Record payment"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
