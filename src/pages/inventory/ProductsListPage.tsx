import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listLowStockProducts, listProducts } from "../../api/inventory";
import type { LowStockProduct, Product } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { formatMoney } from "../../lib/format";
import { CreateProductModal } from "./CreateProductModal";
import { useAuth } from "../../auth/AuthContext";

export function ProductsListPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 20;

  function load() {
    setLoading(true);
    Promise.all([listProducts(search, undefined, page, pageSize), listLowStockProducts()])
      .then(([res, low]) => {
        setItems(res.items);
        setTotal(res.total);
        setLowStock(low);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load products."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const lowStockIds = new Set(lowStock.map((p) => p.product_id));
  const visibleItems = showLowStockOnly ? items.filter((p) => lowStockIds.has(p.id)) : items;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Products</h1>
          <p className="text-sm text-ink-muted">
            {total} total{lowStock.length > 0 && ` · ${lowStock.length} low stock`}
          </p>
        </div>
        {hasPermission("inventory:manage") && (
          <div className="flex gap-2">
            <Link to="/inventory/warehouses">
              <Button variant="secondary">Warehouses</Button>
            </Link>
            <Button onClick={() => setShowCreate(true)}>New product</Button>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
          <Input
            placeholder="Search by name, SKU, or barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        {lowStock.length > 0 && (
          <button
            onClick={() => setShowLowStockOnly((v) => !v)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              showLowStockOnly
                ? "bg-negative text-white"
                : "bg-negative-bg text-negative hover:bg-negative/10"
            }`}
          >
            {showLowStockOnly ? "Showing low stock only" : `Low stock (${lowStock.length})`}
          </button>
        )}
      </div>

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {error && <p className="p-6 text-sm text-negative">{error}</p>}

        {!loading && !error && visibleItems.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No products match.</p>
        )}

        {!loading && !error && visibleItems.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium text-right">Selling price</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3 font-mono-data text-xs text-ink-muted">{p.sku}</td>
                  <td className="px-5 py-3">
                    <Link to={`/inventory/${p.id}`} className="font-medium text-navy-800 hover:underline">
                      {p.name}
                    </Link>
                    {lowStockIds.has(p.id) && (
                      <span className="ml-2 rounded-full bg-negative-bg px-2 py-0.5 text-xs text-negative">
                        Low stock
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">
                    {formatMoney(p.selling_price)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.is_active ? "bg-positive-bg text-positive" : "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {!showLowStockOnly && totalPages > 1 && (
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
        <CreateProductModal
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
