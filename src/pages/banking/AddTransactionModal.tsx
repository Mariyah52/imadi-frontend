import { useState, type FormEvent } from "react";
import { addBankTransaction } from "../../api/banking";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { todayISO } from "../../lib/format";

export function AddTransactionModal({
  accountId,
  onClose,
  onAdded,
}: {
  accountId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [transactionDate, setTransactionDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await addBankTransaction(accountId, {
        transaction_date: transactionDate,
        description,
        amount,
      });
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add the transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Add transaction</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Date">
            <Input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </Field>
          <Field label="Description">
            <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Amount (positive = money in, negative = money out)">
            <Input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add transaction"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
