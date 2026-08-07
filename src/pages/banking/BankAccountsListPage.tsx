import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listBankAccounts } from "../../api/banking";
import type { BankAccount } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";
import { CreateBankAccountModal } from "./CreateBankAccountModal";
import { useAuth } from "../../auth/AuthContext";

export function BankAccountsListPage() {
  const { hasPermission } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    listBankAccounts(undefined, 1, 100)
      .then((res) => setAccounts(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load bank accounts."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Banking</h1>
        <div className="flex gap-2">
          <Link to="/banking/transfers/new">
            <Button variant="secondary">New transfer</Button>
          </Link>
          {hasPermission("banking:create") && (
            <Button onClick={() => setShowCreate(true)}>New account</Button>
          )}
        </div>
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <Link key={a.id} to={`/banking/accounts/${a.id}`}>
              <Card className="p-5 hover:bg-navy-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{a.name}</span>
                  <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-ink-muted capitalize">
                    {a.account_kind}
                  </span>
                </div>
                {a.bank_name && <div className="text-xs text-ink-muted mt-1">{a.bank_name}</div>}
                <div className="mt-3 font-mono-data text-xs text-ink-muted">
                  Opening {formatMoney(a.opening_balance, a.currency)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBankAccountModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}
