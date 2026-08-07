import { useState, type FormEvent } from "react";
import { createBankAccount } from "../../api/banking";
import { ApiError } from "../../api/client";
import type { BankAccountKind } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { todayISO } from "../../lib/format";

export function CreateBankAccountModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [accountKind, setAccountKind] = useState<BankAccountKind>("bank");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [iban, setIban] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [openingBalanceDate, setOpeningBalanceDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createBankAccount({
        name,
        account_kind: accountKind,
        bank_name: bankName || undefined,
        account_number: accountNumber || undefined,
        sort_code: sortCode || undefined,
        iban: iban || undefined,
        opening_balance: openingBalance,
        opening_balance_date: openingBalanceDate,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4 py-8 overflow-y-auto">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">New bank/cash account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Kind">
            <select
              value={accountKind}
              onChange={(e) => setAccountKind(e.target.value as BankAccountKind)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm capitalize"
            >
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
            </select>
          </Field>
          {accountKind === "bank" && (
            <>
              <Field label="Bank name">
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Account number">
                  <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                </Field>
                <Field label="Sort code">
                  <Input value={sortCode} onChange={(e) => setSortCode(e.target.value)} />
                </Field>
              </div>
              <Field label="IBAN">
                <Input value={iban} onChange={(e) => setIban(e.target.value)} />
              </Field>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Opening balance">
              <Input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
            </Field>
            <Field label="As of">
              <Input
                type="date"
                value={openingBalanceDate}
                onChange={(e) => setOpeningBalanceDate(e.target.value)}
              />
            </Field>
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create account"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
