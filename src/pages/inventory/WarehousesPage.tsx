import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { createWarehouse, listWarehouses } from "../../api/inventory";
import type { Warehouse } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    listWarehouses()
      .then(setWarehouses)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load warehouses."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createWarehouse({ code, name });
      setCode("");
      setName("");
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the warehouse.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/inventory" className="text-sm text-navy-800 hover:underline">
        ← Products
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Warehouses</h1>
        <Button onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cancel" : "New warehouse"}
        </Button>
      </div>

      <p className="mb-6 text-sm text-ink-muted">
        At least one warehouse is needed before stock can be received, or before an invoice with
        product-linked lines can be posted — posting reduces stock from a warehouse.
      </p>

      {showCreate && (
        <Card className="p-5 mb-6 max-w-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Code">
              <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="WH1" />
            </Field>
            <Field label="Name">
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Main Warehouse"
              />
            </Field>
            {error && <p className="text-sm text-negative">{error}</p>}
            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Creating…" : "Create warehouse"}
            </Button>
          </form>
        </Card>
      )}

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {!loading && !error && warehouses.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No warehouses yet — create one above.</p>
        )}
        {!loading && warehouses.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono-data text-xs">{w.code}</td>
                  <td className="px-5 py-3">{w.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        w.is_active ? "bg-positive-bg text-positive" : "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {w.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
