import { useEffect, useState } from "react";
import { listAccounts } from "../../api/accounting";
import type { Account } from "../../types/api";

export function AccountSelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (accountId: string) => void;
  required?: boolean;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    listAccounts(undefined, true)
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);

  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
    >
      <option value="">Select account…</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.account_code} — {a.name}
        </option>
      ))}
    </select>
  );
}
