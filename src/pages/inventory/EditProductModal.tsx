import { useState, type FormEvent } from "react";
import { updateProduct } from "../../api/inventory";
import { ApiError } from "../../api/client";
import type { ProductStockSummary } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function EditProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: ProductStockSummary;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [sellingPrice, setSellingPrice] = useState(product.selling_price);
  const [minimumStock, setMinimumStock] = useState(product.minimum_stock);
  const [isActive, setIsActive] = useState(product.is_active);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateProduct(product.id, {
        name,
        description: description || undefined,
        selling_price: sellingPrice,
        minimum_stock: minimumStock,
        is_active: isActive,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Edit product</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Selling price">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
          </Field>
          <Field label="Minimum stock (low-stock threshold)">
            <Input
              type="number"
              min={0}
              step="1"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Active
          </label>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
