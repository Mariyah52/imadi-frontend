import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listAccounts } from "../../api/accounting";
import type { Account, AccountType } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CreateAccountModal } from "./CreateAccountModal";
import { useAuth } from "../../auth/AuthContext";

const TYPES: AccountType[] = ["asset", "liability", "equity", "income", "expense"];

const TYPE_TONE: Record<AccountType, string> = {
  asset: "bg-positive-bg text-positive",
  liability: "bg-negative-bg text-negative",
  equity: "bg-amber-100 text-amber-600",
  income: "bg-positive-bg text-positive",
  expense: "bg-negative-bg text-negative",
};

export function ChartOfAccountsPage() {
  const { hasPermission } = useAuth();
  const [typeFilter, setTypeFilter] = useState<AccountType | "">("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    listAccounts(typeFilter || undefined, false)
      .then(setAccounts)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the chart of accounts."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [typeFilter]);

  return (
    <div>
      <Link to="/accounting" className="text-sm text-navy-800 hover:underline">
        ← Accounting
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Chart of accounts</h1>
        {hasPermission("accounting:manage") && (
          <Button onClick={() => setShowCreate(true)}>New account</Button>
        )}
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setTypeFilter("")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
            typeFilter === "" ? "bg-navy-800 text-white" : "bg-navy-100 text-ink-muted hover:bg-navy-100/70"
          }`}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              typeFilter === t ? "bg-navy-800 text-white" : "bg-navy-100 text-ink-muted hover:bg-navy-100/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}
        {!loading && !error && accounts.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No accounts yet.</p>
        )}
        {!loading && !error && accounts.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Account ID</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3 font-mono-data text-xs">{a.account_code}</td>
                  <td className="px-5 py-3">{a.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_TONE[a.account_type]}`}
                    >
                      {a.account_type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.is_active ? "bg-positive-bg text-positive" : "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {a.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono-data text-[10px] text-ink-muted/70">{a.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showCreate && (
        <CreateAccountModal
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
