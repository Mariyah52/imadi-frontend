import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBankTransfer, listBankAccounts } from "../../api/banking";
import { ApiError } from "../../api/client";
import type { BankAccount } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { todayISO } from "../../lib/format";

export function CreateTransferPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState(todayISO());
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listBankAccounts(undefined, 1, 100)
      .then((res) => setAccounts(res.items))
      .catch(() => setAccounts([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      setError("Choose two different accounts.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createBankTransfer({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        transfer_date: transferDate,
        reference: reference || undefined,
      });
      navigate(`/banking/accounts/${fromAccountId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the transfer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/banking" className="text-sm text-navy-800 hover:underline">
        ← Banking
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">New transfer</h1>

      <Card className="p-5 max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="From account">
            <select
              required
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="To account">
            <select
              required
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
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
            <Field label="Transfer date">
              <Input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Reference">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Transferring…" : "Create transfer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
