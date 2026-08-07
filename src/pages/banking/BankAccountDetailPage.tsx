import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getBankAccount, listBankTransactions } from "../../api/banking";
import type { BankAccountBalance, BankTransaction } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { AddTransactionModal } from "./AddTransactionModal";
import { useAuth } from "../../auth/AuthContext";

export function BankAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const [account, setAccount] = useState<BankAccountBalance | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  function load() {
    if (!id) return;
    Promise.all([getBankAccount(id), listBankTransactions(id)])
      .then(([a, t]) => {
        setAccount(a);
        setTransactions(t.slice().reverse());
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this account."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!account || !id) return null;

  return (
    <div>
      <Link to="/banking" className="text-sm text-navy-800 hover:underline">
        ← Banking
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{account.name}</h1>
          {account.bank_name && (
            <p className="text-sm text-ink-muted mt-1">
              {account.bank_name}
              {account.account_number && ` · ${account.account_number}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/banking/accounts/${id}/import`}>
            <Button variant="secondary">Import statement</Button>
          </Link>
          {hasPermission("banking:create") && (
            <Button onClick={() => setShowAdd(true)}>Add transaction</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Current balance</span>
          <div className="mt-1 font-display text-xl font-semibold">
            {formatMoney(account.current_balance, account.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Reconciled balance</span>
          <div className="mt-1 font-display text-xl font-semibold">
            {formatMoney(account.reconciled_balance, account.currency)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Unreconciled transactions</span>
          <div className="mt-1 font-display text-xl font-semibold text-negative">
            {account.unreconciled_transaction_count}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Transactions</h2>
        {transactions.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Reconciled</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-ink-muted">{t.transaction_date}</td>
                  <td className="px-5 py-3">{t.description}</td>
                  <td className="px-5 py-3 text-ink-muted capitalize">{t.transaction_type}</td>
                  <td
                    className={`px-5 py-3 text-right font-mono-data ${
                      Number(t.amount) < 0 ? "text-negative" : "text-positive"
                    }`}
                  >
                    {formatMoney(t.amount, account.currency)}
                  </td>
                  <td className="px-5 py-3">
                    {t.reconciled ? (
                      <span className="rounded-full bg-positive-bg px-2 py-0.5 text-xs text-positive">
                        Reconciled
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showAdd && (
        <AddTransactionModal
          accountId={id}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}
