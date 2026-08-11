import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getProduct, getProductHistory, listStockForProduct } from "../../api/inventory";
import type { ProductStockSummary, StockItem, StockMovement } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { StockActionModal } from "./StockActionModal";
import { EditProductModal } from "./EditProductModal";
import { useAuth } from "../../auth/AuthContext";

type ActionMode = "receive" | "issue" | "adjust" | null;

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("inventory:manage");

  const [product, setProduct] = useState<ProductStockSummary | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [showEdit, setShowEdit] = useState(false);

  function load() {
    if (!id) return;
    Promise.all([getProduct(id), listStockForProduct(id), getProductHistory(id)])
      .then(([p, s, h]) => {
        setProduct(p);
        setStock(s);
        setHistory(h);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this product."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!product || !id) return null;

  return (
    <div>
      <Link to="/inventory" className="text-sm text-navy-800 hover:underline">
        ← Products
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{product.name}</h1>
          <p className="font-mono-data text-xs text-ink-muted mt-1">
            {product.sku}
            {product.barcode && ` · ${product.barcode}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {product.is_low_stock && (
            <span className="rounded-full bg-negative-bg px-2.5 py-1 text-xs font-medium text-negative">
              Low stock
            </span>
          )}
          {canManage && (
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">On hand</span>
          <div className="mt-1 font-display text-xl font-semibold text-ink font-mono-data">
            {product.total_stock}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Minimum stock</span>
          <div className="mt-1 font-display text-xl font-semibold text-ink font-mono-data">
            {product.minimum_stock}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Selling price</span>
          <div className="mt-1 font-display text-xl font-semibold text-ink">
            {formatMoney(product.selling_price)}
          </div>
        </Card>
      </div>

      {canManage && (
        <div className="mb-6 flex gap-2">
          <Button onClick={() => setActionMode("receive")}>Receive stock</Button>
          <Button variant="secondary" onClick={() => setActionMode("issue")}>
            Issue stock
          </Button>
          <Button variant="secondary" onClick={() => setActionMode("adjust")}>
            Adjust stock
          </Button>
        </div>
      )}

      <Card className="mb-6">
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Stock by batch</h2>
        {stock.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">No stock recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Batch</th>
                <th className="px-5 py-3 font-medium">Expiry</th>
                <th className="px-5 py-3 font-medium text-right">Quantity on hand</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono-data text-xs">{s.batch_number}</td>
                  <td className="px-5 py-3 text-ink-muted">{s.expiry_date ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono-data">{s.quantity_on_hand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Movement history</h2>
        {history.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">No movements yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Batch</th>
                <th className="px-5 py-3 font-medium text-right">Quantity</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 capitalize">{m.movement_type}</td>
                  <td className="px-5 py-3 font-mono-data text-xs">{m.batch_number}</td>
                  <td className="px-5 py-3 text-right font-mono-data">{m.quantity}</td>
                  <td className="px-5 py-3 text-ink-muted">{m.reason ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">
                    {new Date(m.created_at).toLocaleString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {actionMode && (
        <StockActionModal
          productId={id}
          mode={actionMode}
          onClose={() => setActionMode(null)}
          onDone={() => {
            setActionMode(null);
            load();
          }}
        />
      )}

      {showEdit && (
        <EditProductModal
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}
    </div>
  );
}
