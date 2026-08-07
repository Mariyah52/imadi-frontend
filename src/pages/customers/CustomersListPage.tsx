import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listCustomers } from "../../api/customers";
import type { Customer } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";
import { CreateCustomerModal } from "./CreateCustomerModal";
import { useAuth } from "../../auth/AuthContext";

export function CustomersListPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 20;

  function load() {
    setLoading(true);
    listCustomers(search, page, pageSize)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load customers."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Customers</h1>
          <p className="text-sm text-ink-muted">{total} total</p>
        </div>
        {hasPermission("customers:create") && (
          <Button onClick={() => setShowCreate(true)}>New customer</Button>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2 max-w-sm">
        <Input
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No customers match your search.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium text-right">Credit limit</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3 font-mono-data text-xs text-ink-muted">
                    {c.customer_code}
                  </td>
                  <td className="px-5 py-3">
                    <Link to={`/customers/${c.id}`} className="font-medium text-navy-800 hover:underline">
                      {c.company_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{c.email ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(c.credit_limit, c.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.is_active
                          ? "bg-positive-bg text-positive"
                          : "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {showCreate && (
        <CreateCustomerModal
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
